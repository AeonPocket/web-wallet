<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection($this->connection)->create('files', function (Blueprint $collection) {
            $collection->uuid('id');
            $collection->string('walletAddress');
            $collection->string('transfers');
            $collection->integer('bcHeight');
            $collection->timestamp('accountCreationTime');
            $collection->timestamps();
            $collection->index(['id', 'walletAddress']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
