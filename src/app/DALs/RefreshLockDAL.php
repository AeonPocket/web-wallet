<?php
/**
 * Wallet DAL.
 * User: pushkar
 * Date: 10/12/17
 * Time: 3:15 PM
 */

namespace App\DALs;


use App\Models\RefreshLock;

class WalletDAL
{
    public static function Lock(String $address, int $timestamp ) {
    }

    public static function Unlock(String $address, int $timestamp ) {
    }
    public static function getLock(String $address) {
        return RefreshLock::where('address', $address)->first();
    }

}