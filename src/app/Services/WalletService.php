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
use App\Http\Objects\GetTransactionRequest;
use App\Http\Objects\GetTransactionsRequests;
use App\Http\Objects\RefreshRequest;
use App\Http\Objects\SetWalletRequest;
use App\Http\Objects\TransferDestination;
use App\Http\Objects\TransferRequest;
use App\Http\Objects\UpdateWalletRequest;
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
        $keyImages = self::EMPTY_TRANSFER;
        $res = $this->rpcService->setWallet(new SetWalletRequest(
            $address, $viewKey, $timestamp, $bcHeight, $transfers, $keyImages
        ));

        $validator = Validator::make([
            'address' => $res['address']
        ], [
            'address' => 'required|unique:wallets'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        WalletDAL::createWallet($res['address'], $timestamp, $bcHeight, $transfers, $keyImages);
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
            $address, $viewKey, $wallet->createTime, $wallet->bcHeight, $wallet->transfers, $wallet->keyImages
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
        $res = $this->rpcService->refresh(new RefreshRequest(
            $address, $viewKey, $wallet->getAttribute('createTime'),
            $wallet->getAttribute('bcHeight'), $wallet->getAttribute('transfers'), $wallet->getAttribute('keyImages')
        ));

        $txHashes = [];
        if (isset($res['txs_hashes'])) {
            $txHashes = $res['txs_hashes'];
        }

        //We update the DB with the new values local_bc_height,transfers,createTime
        WalletDAL::updateWallet($wallet, $res['local_bc_height'], $res['transfers'], $res['key_images'], $txHashes);

        $result = new stdClass();
        $result->status = "success";
        $result->txHashes = $txHashes;
        return $result;
    }

    public function getTransaction(Request $request) {
        $txHash = $request->input('txHash');
        $validator = Validator::make([
            'txHash' => $txHash
        ], [
            'txHash' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $res = $this->rpcService->getTransaction(new GetTransactionRequest($txHash));

        $result = new stdClass();
        $result->txHash = $res['tx_hash'];
        $result->txExtraPub = $res['tx_extra_pub'];
        $result->outputs = [];

        foreach ($res['outputs'] as $output) {
            $txOut = new stdClass();
            $txOut->key = $output['key_image'];
            array_push($result->outputs, $txOut);
        }

        return $result;
    }

    public function updateWallet(Request $request) {
        $address = $request->input('address');
        $viewKey = $request->input('viewKey');
        $txid = $request->input('txid');
        $outputs = $request->input('outputs');
        $validator = Validator::make([
            'address' => $address,
            'viewKey' => $viewKey,
            'txid'    => $txid,
            'outputs' => $outputs
        ], [
            'address' => 'required',
            'viewKey' => 'required',
            'txid'    => 'required',
            'outputs' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $wallet = WalletDAL::getWallet($address);

        $reqOutputs = [];
        foreach ($outputs as $output) {
            array_push($reqOutputs, [
                "tx_hash" => $txid,
                "key_image" => $output['keyImage'],
                "internal_index" => intval($output['index'])
            ]);
        }

        $res = $this->rpcService->updateWallet(new UpdateWalletRequest(
            $address, $viewKey, $wallet->bcHeight, $wallet->createTime,
            $wallet->transfers, $wallet->keyImages, $txid, $reqOutputs
        ));

        $unprocessedTxs = $wallet->unprocessedTxs;
        if (($key = array_search($txid, $unprocessedTxs)) !== false) {
            unset($unprocessedTxs[$key]);
        }
        $wallet->unprocessedTxs = $unprocessedTxs;

        if (count($wallet->unprocessedTxs) == 0) {
            $wallet->bcHeight += 1;
        }

        WalletDAL::updateWallet($wallet, $wallet->bcHeight, $res['transfers'], $res['key_images'], $wallet->unprocessedTxs);

        $result = new stdClass();
        $result->status = "success";
        return $result;
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
                $wallet->getAttribute('bcHeight'), $wallet->getAttribute('transfers'), self::TRANSFER_TYPE_ALL,
                $wallet->getAttribute('keyImages')
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
            'viewKey' => $viewKey
        ], [
            'address' => 'required',
            'viewKey' => 'required'
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
            $wallet->getAttribute('createTime'),
            $wallet->getAttribute('bcHeight'),
            $wallet->getAttribute('transfers'),
            $wallet->getAttribute('keyImages'));
        $res = $this->rpcService->transfer($req);

        WalletDAL::updateWallet($wallet, $res['local_bc_height'], $res['transfers'], $res['key_images']);
        $result = new stdClass();
        $result->sources = $res['sources'];
        $result->sucess = true;
        return $result;
    }
}