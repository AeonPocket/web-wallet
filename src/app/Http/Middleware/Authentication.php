<?php

namespace App\Http\Middleware;

use App\Utils\error;
use Closure;
use Illuminate\Support\Facades\Log;

class Authentication
{
    /**
     * Handle an incoming request.
     *
     * @param $request
     * @param Closure $next
     * @return mixed
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function handle($request, Closure $next)
    {
        if ($request->session()->get('seed') == null) {
            throw error::getAuthorizationException(error::SESSION_EXPIRED);
        }

        return $next($request);
    }
}
