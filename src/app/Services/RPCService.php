<?php
/**
 * RPC Service.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:52 AM
 */

namespace App\Services;


use App\Http\Objects\GetBalanceRequest;
use App\Http\Objects\GetTransactionsRequests;
use App\Http\Objects\RefreshRequest;
use App\Http\Objects\SetWalletRequest;
use App\Http\Objects\TransferRequest;

class RPCService
{
    private $httpService;

    public function __construct() {
        $this->httpService = new HTTPService();
    }

    public function setWallet(SetWalletRequest $request) {
        return $this->httpService->request('set_wallet', $request);
    }

    public function createWallet() {
        return $this->httpService->request('create_wallet', "");
    }

    public function getBalance(GetBalanceRequest $request) {
        return $this->httpService->request('getbalance', $request);
    }

    public function getTransactions(GetTransactionsRequests $request) {
        return $this->httpService->request('incoming_transfers', $request);
    }

    public function transfer(TransferRequest $request) {
        return $this->httpService->request('transfer', $request);
    }

    public function refresh(RefreshRequest $request) {
        return $this->httpService->request('refresh', $request);
    }

    public function getBCHeight() {
        return $this->httpService->request('bc_height', null);
    }
}