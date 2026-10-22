<?php

namespace Database\Factories;

use App\Enums\ClientStatus;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'industry' => fake()->randomElement([
                'Technology & Software',
                'Healthcare & Pharma',
                'E-Commerce & Retail',
                'Logistics & Supply Chain',
                'Financial Services',
                'Legal & Advisory',
                'Real Estate',
                'Digital Media',
            ]),
            'website' => fake()->url(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'country' => 'Pakistan',
            'status' => ClientStatus::Active,
            'account_manager_id' => User::factory(),
            'created_by' => User::factory(),
            'source_lead_id' => null,
            'notes' => fake()->paragraph(),
        ];
    }

    /**
     * Indicate inactive client.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ClientStatus::Inactive,
        ]);
    }

    /**
     * Indicate archived client.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ClientStatus::Archived,
        ]);
    }
}
