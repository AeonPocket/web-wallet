<?php
/**
 * Wallet Service.
 * User: pushkar
 * Date: 10/12/17
 * Time: 2:53 PM
 */

namespace App\Services;


use App\DALs\RefreshLockDAL;
use App\DALs\WalletDAL;
use App\Http\Objects\GetBalanceRequest;
use App\Http\Objects\GetTransactionsRequests;
use App\Http\Objects\RefreshRequest;
use App\Http\Objects\SetWalletRequest;
use App\Http\Objects\TransferDestination;
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
    const TRANSFER_FEE = 10000000000;
    public function __construct() {
        $this->rpcService = new RPCService();
    }

    public function restoreExistingWallet($address, $viewKey) {
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey
        ], [
            'address' => 'required',
            'viewKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $timestamp = now()->timestamp;
        $bcHeight = $this->rpcService->getBCHeight()['height'];
        $transfers = self::EMPTY_TRANSFER;
        $res = $this->rpcService->setWallet(new SetWalletRequest(
            $address, $viewKey, $timestamp, $bcHeight, $transfers
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
        return ["status" => "success"];
    }

    public function setWallet(Request $request) {
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey
        ], [
            'address' => 'required',
            'viewKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Get wallet address and keys using the seed.
        $res = $this->rpcService->setWallet(new SetWalletRequest(
            $address, $viewKey, now()->timestamp, 0, self::EMPTY_TRANSFER
        ));

        // Get wallet transfers from db
        $wallet = WalletDAL::getWallet($address);

        if ($wallet == null) {
            throw error::getBadRequestException(error::WALLET_NOT_FOUND);
        }

        // Generate a new session.
        $request->session()->regenerate();

        // Set session variables
        $request->session()->put('address', $address);
    }

    public function getBalance(Request $request) {
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey
        ], [
            'address' => 'required',
            'viewKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $wallet = WalletDAL::getWallet($address);
        $res= $this->rpcService->getBalance(new GetBalanceRequest(
            $address, $viewKey, $wallet->createTime, $wallet->bcHeight, $wallet->transfers
        ));
        $result = new stdClass();
        $result->status = 'success';
        Log::info($res['balance']);
        $result->balance = $res['balance']/(pow(10, 12));
        return $result;
    }


    public function refresh(Request $request) {
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $spendKey = $request->input('spendKey');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey,
            'spendKey' => $spendKey
        ], [
            'address' => 'required',
            'viewKey' => 'required',
            'spendKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $refreshTime = time();
        $lock =  RefreshLockDAL::getLock($address);
        $isLocked = true;

        if($lock && $lock['isLocked'] ){
            //Check if the lock can be released
            if(($refreshTime - $lock['lastRefreshTime']) > 10*60){
                RefreshLockDAL::Unlock($address);
                $isLocked = false;
            } else {
                throw error::getBadRequestException(error::REFRESH_LOCKED);
            }
        } else {
            $isLocked = false;
        }
        if($isLocked){
            throw error::getBadRequestException(error::REFRESH_LOCKED);
        } else {
            $wallet = WalletDAL::getWallet($address);
            $result = new stdClass();
            $result->refreshedOn = $refreshTime;
            RefreshLockDAL::Lock($address,$refreshTime);
            $res = $this->rpcService->refresh(new RefreshRequest(
                $address, $viewKey, $spendKey, $wallet->getAttribute('createTime'),
                $wallet->getAttribute('bcHeight'), $wallet->getAttribute('transfers')
            ));
            //We update the DB with the new values local_bc_height,transfers,createTime
            WalletDAL::updateWallet($wallet, $res['local_bc_height'], $result->refreshedOn, $res['transfers']);
//            RefreshLockDAL::Unlock($address);
            $result->balance = $res['balance'];
            $result->currentHeight = $res['local_bc_height'];
            $result->status = "success";
            return $result;
        }
    }

    public function getIncomingTransfers(Request $request){
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey
        ], [
            'address' => 'required',
            'viewKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $wallet = WalletDAL::getWallet(Session::get('address'));
        if(strcmp($wallet->getAttribute('transfers'),self::EMPTY_TRANSFER)){
            $res = $this->rpcService->getTransactions(new GetTransactionsRequests(
                $address, $viewKey, $wallet->getAttribute('createTime'),
                $wallet->getAttribute('bcHeight'), $wallet->getAttribute('transfers'), self::TRANSFER_TYPE_ALL
            ));
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
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $spendKey = $request->input('spendKey');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey,
            'spendKey' => $spendKey,
        ], [
            'address' => 'required',
            'viewKey' => 'required',
            'spendKey' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $destinations = [];
        foreach ($request->get('destinations') as $dest) {
            array_push($destinations, new TransferDestination(
                $dest['address'],
                intval($dest['amount']*(pow(10, 12)))
            ));
        }

        $wallet = WalletDAL::getWallet($address);
        $req = new TransferRequest(
            $destinations,
            self::TRANSFER_FEE,
            intval($request->get('mixin')),
            $request->get('unlockTime'),
            $request->get('paymentId'),
            $address,
            $viewKey,
            $spendKey,
            $wallet->getAttribute('createTime'),
            $wallet->getAttribute('bcHeight'),
            $wallet->getAttribute('transfers'));
        $res = $this->rpcService->transfer($req);
        $result = new stdClass();
        return $res;
    }
}