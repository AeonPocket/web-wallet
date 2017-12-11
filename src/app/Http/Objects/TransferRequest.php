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

    /**
     * TransferRequest constructor.
     * @param array $destinations
     * @param int $fee
     * @param int $mixin
     * @param int $unlock_time
     * @param String $payment_id
     * @param String $seed
     * @param int $account_create_time
     * @param int $local_bc_height
     * @param String $transfers
     */
    public function __construct(array $destinations, int $fee, int $mixin, int $unlock_time=null, String $payment_id=null, String $seed, int $account_create_time, int $local_bc_height, String $transfers)
    {
        $this->destinations = $destinations;
        $this->fee = $fee;
        $this->mixin = $mixin;
        $this->unlock_time = $unlock_time;
        $this->payment_id = $payment_id;
        $this->seed = $seed;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
    }
}