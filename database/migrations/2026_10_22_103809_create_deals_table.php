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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('stage', 50)->default('new')->index();
            $table->string('priority', 50)->default('medium')->index();
            $table->decimal('amount', 15, 2)->default(0.00);
            $table->string('currency', 10)->default('USD');
            $table->unsignedTinyInteger('probability')->default(10);
            $table->date('expected_close_date')->nullable()->index();
            $table->date('actual_close_date')->nullable();
            $table->string('loss_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('stage_updated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['stage', 'assigned_to']);
            $table->index(['client_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
