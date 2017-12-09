<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 7:55 PM
 */

namespace App\Http\Objects;


use phpDocumentor\Reflection\Types\Integer;

class SetWalletRequest
{
    /**
     * Seed of the wallet.
     *
     * @var String
     */
    public $seed;

    /**
     * Account creation time on platform.
     *
     * @var Integer
     */
    public $account_create_time;

    /**
     * Last synced blockchain height.
     *
     * @var Integer
     */
    public $local_bc_height;

    /**
     * Serialized transactions of wallet.
     *
     * @var String
     */
    public $transfers;
}