<?php

namespace App\Http\Controllers\Wallet;
use App\Services\WalletService;
use Illuminate\Http\Request;
use \stdClass;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Session;
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
        return response()->json($this->walletService->getBalance());
    }

    public function getIncomingTransfers(){
        return response()->json($this->walletService->getIncomingTransfers());
    }

    public function refresh() {
        return response()->json($this->walletService->refresh());
    }

    public function getSeed(){
        $res = new stdClass();
        $res->seed = Session::get('seed');
        $res->status = 'success';
        return response()->json($res);
    }

    public function getKeys(){
        $res = new stdClass();
        $res->viewKey = Session::get('viewKey');
        $res->spendKey = Session::get('spendKey');
        $res->address = Session::get('address');
        $res->seed = Session::get('seed');
        $res->status = 'success';
        return response()->json($res);
    }

    public function transferFunds(Request $request){
     $this->validate($request,[
            'mixin' => 'required|numeric|max:10|min:3',
            'destinations'=>'required|max:1|min:1',
            'destinations.*'=>'required',
            'unlockTime'=>'required|numeric',
            'paymentId'=>'required|string'
        ]);
        return response()->json($this->walletService->transferFunds($request));
    }
}
