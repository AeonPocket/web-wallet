<?php
/**
 * Internal Server Exception.
 * User: pushkar
 * Date: 1/29/17
 * Time: 1:30 AM
 */

namespace App\Exceptions;


use Exception;

class InternalServerException extends \Exception
{
    public function __construct($message, $code, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}