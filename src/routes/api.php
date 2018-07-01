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

        Route::group(['middleware' => 'open'], function(){
            Route::post('login', 'UserController@login');
        });

        Route::group(['middleware' => ['authentication']], function (){
            Route::get('logout', 'UserController@logout');
            Route::post('create', 'WalletController@create');
        });
    });

    // Path: /admin
    Route::group(['prefix' => 'admin', 'namespace' => 'Admin'], function() {

        Route::group(['middleware' => ['admin']], function () {
            Route::post('reset', 'AdminController@reset');
        });
    });

    // Path: /wallet
    Route::group(['prefix' => 'wallet', 'namespace'=>'Wallet'], function(){
        Route::group(['middleware' => ['authentication']], function (){
            Route::post('balance','WalletController@getBalance');
            Route::post('refresh','WalletController@refresh');
            Route::post('getTransaction','WalletController@getTransaction');
            Route::post('updateWallet','WalletController@updateWallet');
            Route::post('transactions','WalletController@getIncomingTransfers');
            Route::post('transfer','WalletController@transferFunds');
            Route::post('sendTransaction','WalletController@sendTransaction');
            Route::post('deleteWallet','WalletController@deleteWallet');
            Route::post('resetWallet', 'WalletController@resetWallet');
        });

        Route::group(['middleware' => ['open']], function (){
            Route::post('create', 'WalletController@create');
        });
    });

});
