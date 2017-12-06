<?php

namespace App\Exceptions;

use App\Utils\error;
use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof HttpException) {
            $code = $exception->getCode()?$exception->getCode():$exception->getStatusCode();
            $classNameArray = preg_split('/(?=[A-Z])/', array_last(explode("\\", get_class($exception))));
            $message = $exception->getMessage()?$exception->getMessage():trim(implode(" ", $classNameArray));
            return response()->json([
                'code' => $code,
                'message' => $message
            ], $exception->getStatusCode());
        } else if ($exception instanceof  ValidationException){
            $errors = $exception->validator->errors();
            return response()->json([
                "code" => error::getErrorCode(error::VALIDATION_FAILED),
                "message" => error::getErrorMessage(error::VALIDATION_FAILED),
                "errors" => $errors->jsonSerialize()
            ], 400);
        } else if ($exception instanceof AuthenticationException) {
            return response()->json([
                'code' => error::getErrorCode(error::SESSION_EXPIRED),
                'message' => error::getErrorMessage(error::SESSION_EXPIRED)
            ], 403);
        } else if ($exception instanceof AuthorizationException) {
            $code = $exception->getCode()?$exception->getCode():error::getErrorCode(error::FORBIDDEN);
            $message = $exception->getMessage()?$exception->getMessage():error::getErrorMessage(error::FORBIDDEN);
            return response()->json([
                'code' => $code,
                'message' => $message
            ], 401);
        } else if ($exception instanceof TokenMismatchException) {
            return response()->json([
                'code' => error::getErrorCode(error::FORBIDDEN),
                'message' => "Token Mismatch"
            ], 403);
        } else if ($exception instanceof  InternalServerException) {
            return response()->json([
                'code' => $exception->getCode(),
                'message' => $exception->getMessage()
            ], 500);
        } else {
            return response()->json([
                'code' => 10000,
                'message' => 'Unknown error occurred'
            ], 500);
        }
    }
}
