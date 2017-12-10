<?php

namespace App\Http\Controllers\Wallet;
use App\Services\WalletService;
use Illuminate\Http\Request;
use \stdClass;
use App\Http\Controllers\Controller;

class WalletController extends Controller
{
    private $walletService;

    public function __construct() {
        $this->walletService = new WalletService();
    }

    public function create(Request $request) {
        if ($request->input('seed') != "" && $request->input('seed') != null) {
            return $this->walletService->restoreExistingWallet($request->input('seed'));
        } else {
            return $this->walletService->createNewWallet();
        }
    }

    public function getBalance() {
        $res = new stdClass();
        $res->balance = $this->walletService->getBalance();
        return response()->json($res);
    }

}
