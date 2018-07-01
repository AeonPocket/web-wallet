<?php

namespace App\Http\Middleware;

use App\Utils\error;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     * @throws AuthorizationException
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('X-ADMIN-TOKEN');
        Log::debug($token);
        if ($token == env('APP_ADMIN_TOKEN', null))
            return $next($request);
        else
            throw error::getAuthorizationException(error::FORBIDDEN);
    }
}
