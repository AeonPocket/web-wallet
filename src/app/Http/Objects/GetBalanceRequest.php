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
     * Seed of the wallet.
     *
     * @var String
     */
    public $seed;

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
     * GetBalanceRequest constructor.
     * @param String $seed
     * @param int $account_create_time
     * @param int $local_bc_height
     * @param String $transfers
     */
    public function __construct($seed, $account_create_time, $local_bc_height, $transfers)
    {
        $this->seed = $seed;
        $this->account_create_time = $account_create_time;
        $this->local_bc_height = $local_bc_height;
        $this->transfers = $transfers;
    }


}