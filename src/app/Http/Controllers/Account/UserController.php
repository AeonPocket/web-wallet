<?php
/**
 * User Controller.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:06 AM
 */

namespace App\Http\Controllers\Account;


use App\Services\RPCService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;

class UserController
{
    private $rpcService;

    public function __construct(){
        $this->rpcService = new RPCService();
    }

    public function register() {

    }

    public function login(Request $req) {
        $validator = Validator::make([
            'seed' => $req->input('seed')
        ], [
            'seed' => 'required'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        return $this->rpcService->setWallet($req->seed);
    }

    public function logout() {

    }
}