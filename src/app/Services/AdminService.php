<?php
/**
 * Service to perform Admin actions.
 * User: pushkar
 * Date: 1/7/18
 * Time: 9:42 PM
 */

namespace App\Services;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\DALs\WalletDAL;
use App\Utils\error;

class AdminService
{
    const EMPTY_TRANSFER = "22 serialization::archive 16 0 0 0 0";

    public function resetWallet(Request $request) {
        $address = $request->input('address');
        $resetHeight = $request->input('resetHeight');
        $date = $request->input('date');

        $validator = Validator::make([
            'address' => $address,
            'resetHeight' => $resetHeight,
            'date' => $date
        ], [
            'address' => 'required',
            'resetHeight' => 'required',
            'date' => 'required|date'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }


        $wallet = WalletDAL::getWallet($address);
        if (!$wallet) {
            throw error::getBadRequestException(error::WALLET_NOT_FOUND);
        }

        if (!$wallet->reset) {
            WalletDAL::updateWallet(
                $wallet, $resetHeight, self::EMPTY_TRANSFER,
                self::EMPTY_TRANSFER, [], strtotime($date), true
            );
        } else {
            throw error::getBadRequestException(error::WALLET_ALREADY_RESET);
        }

        return ['syncHeight' => $resetHeight];
    }
}