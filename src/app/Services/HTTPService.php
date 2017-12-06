<?php
/**
 * HTTP Service.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:25 AM
 */

namespace App\Services;


use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;

class HTTPService
{
    private $http;

    public function __construct()
    {
        $this->http = new Client(Array());
    }

    public function request(string $methodName, object $obj) {
        $response = $this->http->post(env("APP_RPC_URL", "http://localhost:11191"), [
            RequestOptions::JSON => [
                "jsonrpc" => "2.0",
                "method"  => $methodName,
                "params"  => $obj
            ]
        ]);

        return json_decode($response->getBody(), true)['result'];
    }
}