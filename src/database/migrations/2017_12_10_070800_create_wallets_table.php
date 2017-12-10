<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection($this->connection)->create('wallets', function (Blueprint $collection) {
            $collection->increments('id');
            $collection->timestamps();
            $collection->string('address');
            $collection->string('transfers');
            $collection->integer('bcHeight');
            $collection->timestamp('createTime');
            $collection->timestamps();
            $collection->index(['id', 'address']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallets');
    }
}
