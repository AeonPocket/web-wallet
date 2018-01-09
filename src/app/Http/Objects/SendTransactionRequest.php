<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 9/12/17
 * Time: 8:16 PM
 */

namespace App\Http\Objects;


class SendTransactionRequest
{
    /**
     * Hex encoded transaction.
     *
     * @var string
     */
    public $tx_as_hex;

    /**
     * SendTransaction constructor.
     * @param string $tx_as_hex
     */
    public function __construct($tx_as_hex)
    {
        $this->tx_as_hex = $tx_as_hex;
    }


}