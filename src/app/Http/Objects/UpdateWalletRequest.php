<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 2/1/18
 * Time: 1:09 AM
 */

namespace app\Http\Objects;


use phpDocumentor\Reflection\Types\Integer;

class UpdateWalletRequest
{
    /**
     * Wallet Address
     *
     * @var String
     */
    public $address;

    /**
     * Wallet View Key
     *
     * @var String
     */
    public $view_key;

    /**
     * Wallet synced height
     *
     * @var Integer
     */
    public $local_bc_height;

    /**
     * Wallet create time
     *
     * @var Integer
     */
    public $account_create_time;

    /**
     * Serialized transfers
     *
     * @var String
     */
    public $transfers;

    /**
     * Serialized key images
     *
     * @var String
     */
    public $key_images;

    /**
     * Current Transaction Hash
     *
     * @var String
     */
    public $txid;

    /**
     * Outputs of the transactions.
     *
     * @var Array
     */
    public $outputs;

    /**
     * UpdateWalletRequest constructor.
     * @param $address
     * @param $view_key
     * @param $local_bc_height
     * @param $account_create_time
     * @param $transfers
     * @param $key_images
     * @param $txid
     * @param $outputs
     */
    public function __construct($address, $view_key, $local_bc_height, $account_create_time, $transfers, $key_images, $txid, $outputs)
    {
        $this->address = $address;
        $this->view_key = $view_key;
        $this->local_bc_height = $local_bc_height;
        $this->account_create_time = $account_create_time;
        $this->transfers = $transfers;
        $this->key_images = $key_images;
        $this->txid = $txid;
        $this->outputs = $outputs;
    }


}