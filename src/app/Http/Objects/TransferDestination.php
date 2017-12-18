<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 9:11 PM
 */

namespace App\Http\Objects;


use phpDocumentor\Reflection\Types\Integer;

class TransferDestination
{
    /**
     * Address of wallet.
     *
     * @var String
     */
    public $address;

    /**
     * Amount to be sent.
     *
     * @var Integer
     */
    public $amount;

    /**
     * TransferDestination constructor.
     * @param String $address
     * @param int $amount
     */
    public function __construct($address, $amount)
    {
        $this->address = $address;
        $this->amount = $amount;
    }


}