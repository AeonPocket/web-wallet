<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Path: /v1
Route::group(['middleware' => 'web', 'prefix' => 'v1'], function(){

    // Path: /account
    Route::group(['prefix' => 'account', 'namespace' => 'Account'], function (){

        Route::group(['middleware' => 'guest'], function(){
            Route::post('login', 'UserController@login');
        });

        Route::group(['middleware' => ['authentication']], function (){
            Route::get('logout', 'UserController@logout');
        });
    });

    // Path: /wallet
    Route::group(['prefix' => 'wallet', 'namespace'=>'Wallet'], function(){
        Route::group(['middleware' => 'guest'], function(){
            Route::post('create', 'WalletController@create');
        });

        Route::group(['middleware' => ['authentication']], function (){
            Route::get('balance','WalletController@getBalance');
            Route::get('refresh','WalletController@refresh');
            Route::get('seed','WalletController@getSeed');
            Route::get('keys','WalletController@getKeys');
        });
    });

});
