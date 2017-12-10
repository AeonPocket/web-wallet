<?php

namespace App\Http\Controllers\Wallet;
use \stdClass;
use App\Http\Objects\GetBalanceRequest;
use App\Models\Wallet;
use App\Services\RPCService;
use App\Http\Controllers\Controller;

class WalletController extends Controller
{
    private $rpcService;
    public function __construct()
    {
        $this->rpcService = new RPCService();
    }

    public function create(){
       $res = $this->rpcService->createWallet();
       $wallet = new Wallet;
       $wallet->address = $res['address'];
       $wallet->bcHeight = $res['local_bc_height'];
       $wallet->transfers = $res ['transfers'];
       $wallet->createTime = $res['account_create_time'];
       if( false&& $wallet->save()){
           $response = new stdClass();
           $response->seed =$res['seed'];
           return response()->json($response);
       } else
       {
           return response()->json(["message" => "Could not persist wallet"],418);
       }
    }

    public function getBalance(){
        $req = new GetBalanceRequest();
        $req->account_create_time = 1512887431;
        $req->local_bc_height=899885;
        $req->seed ="beneath hundred tool mark drove peace shower energy gift thought bowl shall them soon slide fully respond dear smell college peel party once forever";
        $req->transfers= "22 serialization::archive 15 0 0 0 0";
        return response()->json($this->rpcService->getBalance($req));
    }

}
