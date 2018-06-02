<?php
/**
 * Wallet DAL.
 * User: pushkar
 * Date: 10/12/17
 * Time: 3:15 PM
 */

namespace App\DALs;


use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletDAL
{
    private static function saveFile($fileName, $contents) {
        $bucket = DB::selectGridFSBucket();
        $stream = $bucket->openUploadStream($fileName);
        fwrite($stream, $contents);
        fclose($stream);
        return $fileName;
    }

    private static function getFile($fileName) {
        $bucket = DB::selectGridFSBucket();
        $stream = $bucket->openDownloadStreamByName($fileName);
        return stream_get_contents($stream);
    }

    public static function createWallet(String $address, int $timestamp, int $bcHeight, String $transfers, String $keyImages, bool $viewOnly=null) {
        $wallet = new Wallet();
        $wallet->address = $address;
        $wallet->bcHeight = $bcHeight;
        $wallet->transfers = self::saveFile($address.'-transfers', $transfers);
        $wallet->createTime = $timestamp;
        $wallet->keyImages = self::saveFile($address.'-keyImages', $keyImages);
        $wallet->viewOnly = $viewOnly;
        $wallet->save();
    }

    public static function getWallet(String $address) {
        $wallet = Wallet::where('address', $address)->first();
        if ($wallet && $wallet->transfers[0] == 'W') {
            $wallet->transfers = self::getFile($wallet->transfers);
        }
        if ($wallet && $wallet->keyImages[0] == 'W') {
            $wallet->keyImages = self::getFile($wallet->keyImages);
        }
        Log::debug($wallet);
        return $wallet;
    }

    public static function updateWallet(Wallet $wallet, int $bcHeight, String $transfers, String $keyImages,
                                        Array $unprocessedTx=[], int $timeStamp=null, bool $reset=null){
       $wallet->setAttribute('bcHeight', $bcHeight);
       $wallet->setAttribute('transfers', self::saveFile($wallet->address.'-transfers', $transfers));
       $wallet->setAttribute('keyImages', self::saveFile($wallet->address.'-keyImages', $keyImages));
       $wallet->setAttribute('unprocessedTxs', $unprocessedTx);
       $wallet->setAttribute('createTime', $timeStamp ? $timeStamp : $wallet->createTime);
       $wallet->setAttribute('reset', $reset ? $reset : $wallet->reset);
       $wallet->save();
    }

    public static function deleteWallet(Wallet $wallet) {
        $wallet->delete();
    }
}