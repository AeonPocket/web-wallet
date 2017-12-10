<?php
/**
 * User Controller.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:06 AM
 */

namespace App\Http\Controllers\Account;

use \stdClass;
use App\Services\RPCService;
use App\Services\WalletService;
use Illuminate\Support\Facades\Session;
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
        $this->walletService->setWallet($request);
        $res = new stdClass();
        $res->success = true;
        $res->address = $request->session()->get('address');
        return json_encode($res);
    }

    public function logout(Request $request) {
        $request->session()->flush();
        $request->session()->regenerate();
        return ["success" => true];
    }

    public function getAccount(Request $request) {
        return ['address' => $request->session()->get('address')];
    }
}