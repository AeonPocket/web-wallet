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
use Illuminate\Support\Facades\Log;
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

        $response = json_decode($response->getBody(), true);

        Log::info(print_r($obj, true));
        Log::info(print_r($response, true));

        if (array_has($response, 'result'))
            return $response['result'];
        else
            throw new HttpException(503, $response['error']['message']);
    }
}