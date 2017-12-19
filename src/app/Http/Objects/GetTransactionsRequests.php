<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 8:10 PM
 */

namespace App\Http\Objects;


class GetTransactionsRequests
{
    /**
     * Address of the wallet.
     *
     * @var String
     */
    public $address;

    /**
     * Private view key of the wallet.
     *
     * @var String
     */
    public $view_key;

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

    /**
     * Serialized key images of wallet.
     *
     * @var String
     */
    public $key_images;

    /**
     * Transactions type. One of ['All', 'Incoming', 'Outgoing'].
     * @var String
     */
    public $transfer_type;

    /**
     * GetTransactionsRequests constructor.
     *
     * @param String $address
     * @param String $view_key
     * @param int $account_create_time
     * @param int $local_bc_height
     * @param String $transfers
     * @param String $transfer_type
     */
    public function __construct($address, $view_key, $account_create_time, $local_bc_height, $transfers, $transfer_type, $key_images)
    {
        $this->address = $address;
        $this->view_key = $view_key;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
        $this->transfer_type = $transfer_type;
        $this->key_images = $key_images;
    }


}