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
        Schema::create('coverage_mikrotik_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coverage_id')->constrained()->onDelete('cascade');
            $table->foreignId('mikrotik_server_id')->constrained()->onDelete('cascade');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure a coverage area can't have duplicate Mikrotik server integrations
            $table->unique(['coverage_id', 'mikrotik_server_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coverage_mikrotik_integrations');
    }
};
