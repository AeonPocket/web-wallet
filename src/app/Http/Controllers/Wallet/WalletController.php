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
        return $this->walletService->restoreExistingWallet(
            $request->input('address'),
            $request->input('viewKey'),
            $request->input('viewOnly')
        );
    }

    public function getBalance(Request $request) {
        return response()->json($this->walletService->getBalance($request));
    }

    public function getIncomingTransfers(Request $request){
        return response()->json($this->walletService->getIncomingTransfers($request));
    }

    public function refresh(Request $request) {
        return response()->json($this->walletService->refresh($request));
    }

    public function getTransaction(Request $request) {
        return response()->json($this->walletService->getTransaction($request));
    }

    public function updateWallet(Request $request) {
        return response()->json($this->walletService->updateWallet($request));
    }

    public function transferFunds(Request $request){
     $this->validate($request,[
            'mixin' => 'required|numeric|max:10|min:3',
            'destinations'=>'required|max:1|min:1',
            'destinations.*'=>'required',
            'unlockTime'=>'numeric',
            'paymentId'=>'string'
        ]);
        return response()->json($this->walletService->transferFunds($request));
    }

    public function sendTransaction(Request $request) {
        return response()->json($this->walletService->sendTransaction($request));
    }

    public function deleteWallet(Request $request) {
        return response()->json($this->walletService->deleteWallet($request));
    }

    public function resetWallet(Request $request) {
        return response()->json($this->walletService->resetWallet($request));
    }
}
