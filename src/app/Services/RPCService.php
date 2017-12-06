<?php
/**
 * RPC Service.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:52 AM
 */

namespace App\Services;


class RPCService
{
    private $httpService;

    public function __construct() {
        $this->httpService = new HTTPService();
    }

    public function setWallet(string $seed) {
        $request = new \stdClass();
        $request->seed = $seed;
        return $this->httpService->request('set_wallet', $request);
    }
}