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
     * Wallet address.
     *
     * @var String
     */
    public $address;

    /**
     * Wallet private view key.
     *
     * @var String
     */
    public $view_key;

    /**
     * Wallet private spend key.
     *
     * @var String
     */
    public $spend_key;

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
     * Serialized key images.
     *
     * @var String
     */
    public $key_images;

    /**
     * TransferRequest constructor.
     *
     * @param array $destinations
     * @param int $fee
     * @param int $mixin
     * @param int $unlock_time
     * @param String $payment_id
     * @param String $address
     * @param String $view_key
     * @param String $spend_key
     * @param int $account_create_time
     * @param int $local_bc_height
     * @param String $transfers
     */
    public function __construct(array $destinations, $fee, $mixin, $unlock_time, $payment_id, $address, $view_key, $spend_key, $account_create_time, $local_bc_height, $transfers, $key_images)
    {
        $this->destinations = $destinations;
        $this->fee = $fee;
        $this->mixin = $mixin;
        $this->unlock_time = $unlock_time;
        $this->payment_id = $payment_id;
        $this->address = $address;
        $this->view_key = $view_key;
        $this->spend_key = $spend_key;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
        $this->key_images = $key_images;
    }


}