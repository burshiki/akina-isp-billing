<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mikrotik_servers', function (Blueprint $table) {
            $table->renameColumn('ip_address', 'host');
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->integer('port')->default(8728);
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mikrotik_servers', function (Blueprint $table) {
            $table->renameColumn('host', 'ip_address');
            $table->dropColumn(['username', 'password', 'port', 'is_active']);
        });
    }
};
