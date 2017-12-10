<?php
/**
 * HTTP Service.
 * User: pushkar
 * Date: 12/7/17
 * Time: 1:25 AM
 */

namespace App\Services;


use App\Utils\error;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Symfony\Component\HttpKernel\Exception\HttpException;

class HTTPService
{
    private $http;

    public function __construct()
    {
        $this->http = new Client(Array());
    }

    public function request(string $methodName,  $obj = null) {
        $response = $this->http->post(env("APP_RPC_URL", "http://localhost:11191"), [
            RequestOptions::JSON => [
                "jsonrpc" => "2.0",
                "method"  => $methodName,
                "params"  => $obj
            ]
        ]);

        if ($response->getStatusCode() == 200)
            return json_decode($response->getBody(), true)['result'];
        else
            throw new HttpException($response->getStatusCode(), json_decode($response->getBody(), true)['error']['message']);
    }
}