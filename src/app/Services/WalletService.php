<?php
/**
 * Wallet Service.
 * User: pushkar
 * Date: 10/12/17
 * Time: 2:53 PM
 */

namespace App\Services;


use App\DALs\WalletDAL;
use App\Http\Objects\GetBalanceRequest;
use App\Http\Objects\SetWalletRequest;
use App\Utils\error;
use Hamcrest\Core\Set;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class WalletService
{
    private $rpcService;

    public function __construct() {
        $this->rpcService = new RPCService();
    }

    public function createNewWallet() {
        $res = $this->rpcService->createWallet();
        $wallet = $this->rpcService->setWallet(new SetWalletRequest(
            $res['seed'], $res['account_create_time'], $res['local_bc_height'], $res['transfers']
        ));
        WalletDAL::createWallet($wallet['address'], $res['account_create_time'], $res['local_bc_height'], $res['transfers']);
        return ["status" => "success", "seed" => $res['seed']];
    }

    public function restoreExistingWallet(String $seed) {
        $timestamp = now()->timestamp;
        $bcHeight = 0;
        $transfers = "22 serialization::archive 15 0 0 0 0";
        $res = $this->rpcService->setWallet(new SetWalletRequest(
            $seed, $timestamp, $bcHeight, $transfers
        ));

        $validator = Validator::make([
            'address' => $res['address']
        ], [
            'address' => 'required|unique:wallets'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        WalletDAL::createWallet($res['address'], $timestamp, $bcHeight, $transfers);
        return ["status" => "success", "seed" => $res['seed']];
    }

    public function setWallet(String $seed) {
        $validator = Validator::make([
            'seed' => $seed
        ], [
            'seed' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Get wallet address and keys using the seed.
        $res = $this->rpcService->setWallet(new SetWalletRequest(
            $seed, now()->timestamp, 0, "22 serialization::archive 15 0 0 0 0"
        ));

        // Get wallet transfers from db
        $wallet = WalletDAL::getWallet($res['address']);

        if ($wallet != null) {
            // Generate a new session.
            Session::regenerate();

            // Set session variables
            Session::put('seed', $seed);
            Session::put('address', $res['address']);
            Session::put('viewKey', $res['key']);
            Session::put('spendKey', $res['spend_key']);
        } else {
            error::getBadRequestException(error::WALLET_NOT_FOUND);
        }
    }

    public function getBalance() {
        $wallet = WalletDAL::getWallet(Session::get('address'));
        $res = $this->rpcService->getBalance(new GetBalanceRequest(
            Session::get('seed'), $wallet->createTime, $wallet->bcHeight, $wallet->transfers
        ));
        return $res['balance'];
    }
}