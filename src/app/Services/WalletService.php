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
use App\Http\Objects\GetTransactionsRequests;
use App\Http\Objects\RefreshRequest;
use App\Http\Objects\SetWalletRequest;
use App\Http\Objects\TransferRequest;
use App\Utils\error;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use stdClass;

class WalletService
{
    private $rpcService;
    const EMPTY_TRANSFER = "22 serialization::archive 15 0 0 0 0";
    const TRANSFER_TYPE_ALL = "all";
    const TRANSFER_FEE = 10000000;
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

    public function restoreExistingWallet($seed) {
        $validator = Validator::make([
            'seed' => $seed
        ], [
            'seed' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $timestamp = now()->timestamp;
        $bcHeight = 0;
        $transfers = self::EMPTY_TRANSFER;
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
        return ["status" => "success", "seed" => $seed];
    }

    public function setWallet(Request $request) {
        $seed = $request->input('seed');
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
            $seed, now()->timestamp, 0, self::EMPTY_TRANSFER
        ));

        // Get wallet transfers from db
        $wallet = WalletDAL::getWallet($res['address']);

        if ($wallet == null) {
            throw error::getBadRequestException(error::WALLET_NOT_FOUND);
        }

        // Generate a new session.
        $request->session()->regenerate();

        // Set session variables
        $request->session()->put('seed', $seed);
        $request->session()->put('address', $res['address']);
        $request->session()->put('viewKey', $res['key']);
        $request->session()->put('spendKey', $res['spend_key']);
    }

    public function getBalance() {
        $wallet = WalletDAL::getWallet(Session::get('address'));
        $res= $this->rpcService->getBalance(new GetBalanceRequest(
            Session::get('seed'), $wallet->createTime, $wallet->bcHeight, $wallet->transfers
        ));
        $result = new stdClass();
        $result->status = 'success';
        Log::info($res['balance']);
        $result->balance = $res['balance']/(pow(10, 12));
        return $result;
    }


    public function refresh() {
        $wallet = WalletDAL::getWallet(Session::get('address'));
        $result = new stdClass();
        $result->refreshedOn = time();
        $req = new RefreshRequest();
        $req->local_bc_height = $wallet->getAttribute('bcHeight');
        $req->transfers = $wallet->getAttribute('transfers');
        $req->account_create_time = $wallet->getAttribute('createTime');
        $req->seed = Session::get('seed');
        $res = $this->rpcService->refresh($req);
        //We update the DB with the new values local_bc_height,transfers,createTime
        WalletDAL::updateWallet($wallet, $res['local_bc_height'], $result->refreshedOn, $res['transfers']);
        $result->balance = $res['balance'];
        $result->currentHeight = $res['local_bc_height'];
        $result->status = "success";
        return $result;
    }

    public function getIncomingTransfers(){
        $wallet = WalletDAL::getWallet(Session::get('address'));
        if(strcmp($wallet->getAttribute('transfers'),self::EMPTY_TRANSFER)){
            $req = new GetTransactionsRequests();
            $req->local_bc_height = $wallet->getAttribute('bcHeight');
            $req->transfers = $wallet->getAttribute('transfers');
            $req->account_create_time = $wallet->getAttribute('createTime');
            $req->seed = Session::get('seed');
            $req->transfer_type = self::TRANSFER_TYPE_ALL;
            $res = $this->rpcService->getTransactions($req);
            $result = new stdClass();
            $result->status = "success";
            $result->transfers = [];
            foreach ($res['transfers'] as $transfer) {
                $transfer['amount'] = $transfer['amount']/pow(10, 12);
                array_push($result->transfers, $transfer);
            }
            return $result;
        } else {
            $res = new stdClass();
            $res->status = "fail";
            $res->message ="No Transactions found";
           return $res;
        }
    }
    public function transferFunds(Request $request){
        $wallet = WalletDAL::getWallet(Session::get('address'));
        $req = new TransferRequest(
            $request->get('destinations'),
            self::TRANSFER_FEE,
            $request->get('mixin'),
            $request->get('unlockTime'),
            $request->get('paymentId'),
            Session::get('seed'),
            $wallet->getAttribute('createTime'),
            $wallet->getAttribute('bcHeight'),
            $wallet->getAttribute('transfers'));
        $res = $this->rpcService->transfer($req);
        $result = new stdClass();
        return $res;
    }
}