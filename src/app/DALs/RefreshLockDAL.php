<?php
/**
 * Wallet DAL.
 * User: pushkar
 * Date: 10/12/17
 * Time: 3:15 PM
 */

namespace App\DALs;


use App\Models\RefreshLock;
use Illuminate\Routing\Pipeline;

class RefreshLockDAL
{
    public static function Lock(String $address, int $timestamp ) {
        $lock = RefreshLock::where('address', $address)->first();
        if($lock) {
            $lock->lastRefreshTime = $timestamp;
            $lock->isLocked = true;
            $lock->save();
        } else {
            $newLock = new RefreshLock;
            $newLock->address = $address;
            $newLock->lastRefreshTime = $timestamp;
            $newLock->isLocked = true;
            $newLock->save();
        }
    }

    public static function Unlock(String $address) {
        $lock = RefreshLock::where('address', $address)->first();
        $lock->isLocked = false;
        $lock->save();
    }
    public static function getLock(String $address) {
        return RefreshLock::where('address', $address)->first();
    }

}