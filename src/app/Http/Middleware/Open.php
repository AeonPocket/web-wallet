<?php

namespace App\Http\Middleware;

use App\Utils\error;
use Closure;

class Open
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->session()->get('seed') != null)
            throw error::getBadRequestException(error::ALREADY_LOGGED_IN);

        return $next($request);
    }
}
