<?php
/**
 * Wallet DAL.
 * User: pushkar
 * Date: 10/12/17
 * Time: 3:15 PM
 */

namespace App\DALs;


use App\Models\Wallet;
use phpDocumentor\Reflection\Types\Integer;

class WalletDAL
{
    public static function createWallet(String $address, int $timestamp, int $bcHeight, String $transfers) {
        $wallet = new Wallet();
        $wallet->address = $address;
        $wallet->bcHeight = $bcHeight;
        $wallet->transfers = $transfers;
        $wallet->createTime = $timestamp;
        $wallet->save();
    }

    public static function getWallet(String $address) {
        return Wallet::where('address', $address)->first();
    }
}