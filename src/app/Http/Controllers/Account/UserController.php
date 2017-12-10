<?php
/**
 * User Controller.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:06 AM
 */

namespace App\Http\Controllers\Account;


use App\Services\RPCService;
use App\Services\WalletService;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;

class UserController
{
    private $rpcService;
    private $walletService;

    public function __construct(){
        $this->rpcService = new RPCService();
        $this->walletService = new WalletService();
    }

    public function login(Request $request) {
        $this->walletService->setWallet($request->input('seed'));
        return ["success" => true];
    }

    public function logout(Request $request) {
        $request->session()->flush();
        $request->session()->regenerate();
        return ["success" => true];
    }
}