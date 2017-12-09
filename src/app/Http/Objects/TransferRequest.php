<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 8:16 PM
 */

namespace App\Http\Objects;


class TransferRequest
{
    /**
     * List of transfer destinations.
     *
     * @var array
     */
    public $destinations;

    /**
     * Fee to be charged.
     *
     * @var Integer
     */
    public $fee;

    /**
     * Number of signers required.
     *
     * @var Integer
     */
    public $mixin;

    /**
     * Time after which balance is to be unlocked.
     *
     * @var Integer
     */
    public $unlock_time;

    /**
     * Payment ID.
     *
     * @var String
     */
    public $payment_id;

    /**
     * Wallet seed.
     *
     * @var String
     */
    public $seed;

    /**
     * Creation time of account.
     *
     * @var Integer
     */
    public $account_create_time;

    /**
     * Last synced Block chain height.
     *
     * @var Integer
     */
    public $local_bc_height;

    /**
     * Serialized transactions.
     *
     * @var String
     */
    public $transfers;
}