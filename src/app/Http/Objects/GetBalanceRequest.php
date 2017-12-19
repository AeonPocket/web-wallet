<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 8:07 PM
 */

namespace App\Http\Objects;


use PhpParser\Node\Scalar\String_;

class GetBalanceRequest
{
    /**
     * Address of the wallet.
     *
     * @var String
     */
    public $address;

    /**
     * Secret view key of the wallet.
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
     * GetBalanceRequest constructor.
     *
     * @param $address
     * @param $view_key
     * @param $account_create_time
     * @param $local_bc_height
     * @param $transfers
     */
    public function __construct($address, $view_key, $account_create_time, $local_bc_height, $transfers, $key_images)
    {
        $this->address = $address;
        $this->view_key = $view_key;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
        $this->key_images = $key_images;
    }


}