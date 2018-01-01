<?php
/**
 * Created by PhpStorm.
 * User: pushkar
 * Date: 2/1/18
 * Time: 12:51 AM
 */

namespace app\Http\Objects;


class GetTransactionRequest
{
    /**
     * Hash of the transaction.
     *
     * @var String
     */
    public $tx_hash;

    /**
     * GetTransactionRequest constructor.
     * @param $tx_hash
     */
    public function __construct($tx_hash)
    {
        $this->tx_hash = $tx_hash;
    }


}