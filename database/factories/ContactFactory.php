<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
{
    protected $model = Contact::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'title' => fake()->jobTitle(),
            'department' => fake()->randomElement(['Management', 'Operations', 'Finance', 'Engineering', 'Marketing']),
            'is_primary' => false,
            'portal_user_id' => null,
            'notes' => fake()->sentence(),
        ];
    }

    /**
     * Indicate primary contact.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
        ]);
    }
}
