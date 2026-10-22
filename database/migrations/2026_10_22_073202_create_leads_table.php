<?php

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('title')->nullable();
            $table->string('source')->default(LeadSource::Website->value)->index();
            $table->string('status')->default(LeadStatus::New->value)->index();
            $table->string('priority')->default(LeadPriority::Medium->value)->index();
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('lost_reason')->nullable();
            $table->timestamp('converted_at')->nullable()->index();
            $table->unsignedBigInteger('converted_to_client_id')->nullable()->index();
            $table->timestamps();
            $table->softDeletes()->index();

            $table->index(['status', 'priority']);
            $table->index(['assigned_to', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
