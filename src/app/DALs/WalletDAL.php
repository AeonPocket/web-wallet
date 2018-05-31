<?php
/**
 * Wallet DAL.
 * User: pushkar
 * Date: 10/12/17
 * Time: 3:15 PM
 */

namespace App\DALs;


use App\Models\Wallet;
use phpDocumentor\Reflection\Types\Boolean;

class WalletDAL
{
    public static function createWallet(String $address, int $timestamp, int $bcHeight, String $transfers, String $keyImages, bool $viewOnly) {
        $wallet = new Wallet();
        $wallet->address = $address;
        $wallet->bcHeight = $bcHeight;
        $wallet->transfers = $transfers;
        $wallet->createTime = $timestamp;
        $wallet->keyImages = $keyImages;
        $wallet->viewOnly = $viewOnly;
        $wallet->save();
    }

    public static function getWallet(String $address) {
        return Wallet::where('address', $address)->first();
    }

    public static function updateWallet(Wallet $wallet, int $bcHeight, String $transfers, String $keyImages, Array $unprocessedTx=[]){
       $wallet->setAttribute('bcHeight', $bcHeight);
       $wallet->setAttribute('transfers', $transfers);
       $wallet->setAttribute('keyImages', $keyImages);
       $wallet->setAttribute('unprocessedTxs', $unprocessedTx);
       $wallet->save();
    }

    public static function deleteWallet(Wallet $wallet) {
        $wallet->delete();
    }
}