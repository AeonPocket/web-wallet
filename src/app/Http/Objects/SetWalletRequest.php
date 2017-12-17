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
     * Address of the wallet.
     *
     * @var String
     */
    public $address;

    /**
     * Private view key.
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
     * SetWalletRequest constructor.
     *
     * @param String $address
     * @param String $view_key
     * @param int $account_create_time
     * @param int $local_bc_height
     * @param String $transfers
     */
    public function __construct($address, $view_key, $account_create_time, $local_bc_height, $transfers)
    {
        $this->address = $address;
        $this->view_key = $view_key;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
    }


}