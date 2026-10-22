<?php

namespace Database\Factories;

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'company' => fake()->company(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'title' => fake()->jobTitle(),
            'source' => fake()->randomElement(LeadSource::cases()),
            'status' => fake()->randomElement([
                LeadStatus::New,
                LeadStatus::Contacted,
                LeadStatus::Qualified,
                LeadStatus::Proposal,
            ]),
            'priority' => fake()->randomElement(LeadPriority::cases()),
            'estimated_value' => fake()->randomFloat(2, 500, 25000),
            'currency' => 'USD',
            'assigned_to' => User::factory(),
            'created_by' => User::factory(),
            'notes' => fake()->paragraph(),
            'lost_reason' => null,
            'converted_at' => null,
            'converted_to_client_id' => null,
        ];
    }

    /**
     * Indicate that the lead is qualified.
     */
    public function qualified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Qualified,
            'priority' => LeadPriority::High,
        ]);
    }

    /**
     * Indicate that the lead has proposal sent.
     */
    public function proposal(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Proposal,
            'priority' => LeadPriority::High,
            'estimated_value' => fake()->randomFloat(2, 3000, 15000),
        ]);
    }

    /**
     * Indicate that the lead is converted.
     */
    public function converted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Converted,
            'converted_at' => now(),
        ]);
    }

    /**
     * Indicate that the lead is lost.
     */
    public function lost(string $reason = 'Budget constraints'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Lost,
            'lost_reason' => $reason,
        ]);
    }

    /**
     * Indicate that the lead is unassigned.
     */
    public function unassigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate high priority lead.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => LeadPriority::Urgent,
        ]);
    }
}
