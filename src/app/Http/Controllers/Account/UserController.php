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

    /**
     * UserController constructor.
     */
    public function __construct(){
        $this->rpcService = new RPCService();
        $this->walletService = new WalletService();
    }

    /**
     * Login API
     *
     * @param Request $request
     * @return string
     */
    public function login(Request $request) {
        $this->walletService->setWallet($request);
        $res = new stdClass();
        $res->success = true;
        $res->address = $request->session()->get('address');
        $res->viewOnly = $request->session()->get('viewOnly');
        $res->reset = $request->session()->get('reset');
        return json_encode($res);
    }

    /**
     * Logout API
     *
     * @param Request $request
     * @return array
     */
    public function logout(Request $request) {
        $request->session()->flush();
        $request->session()->regenerate();
        return ["success" => true];
    }
}