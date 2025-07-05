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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('account_no')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone');
            $table->text('address');
            $table->enum('customer_type', ['public', 'corporate', 'government']);
            $table->enum('id_card_type', ['umid', 'sss', 'sim', 'passport', 'pag-ibig']);
            $table->string('id_number');
            $table->text('remarks')->nullable();
            $table->foreignId('plan_id')->constrained('internet_packages');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->enum('payment_type', ['postpaid', 'prepaid'])->default('postpaid');
            $table->integer('due_date')->nullable(); // Day of the month
            $table->boolean('is_tax_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
