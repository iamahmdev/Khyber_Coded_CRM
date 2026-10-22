<?php

namespace Database\Factories;

use App\Enums\DealPriority;
use App\Enums\DealStage;
use App\Models\Client;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deal>
 */
class DealFactory extends Factory
{
    protected $model = Deal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stage = fake()->randomElement(DealStage::cases());
        $amount = fake()->randomFloat(2, 2000, 50000);

        return [
            'title' => fake()->randomElement([
                'Custom CRM & ERP Portal Development',
                'Mobile Commerce App MVP',
                'Corporate Brand Identity & UI/UX Redesign',
                'Enterprise Cloud Infrastructure Migration',
                'Full-Stack Web Application Revamp',
                'SEO & Content Marketing Growth Retainer',
                'API Integration & Automation System',
            ]),
            'client_id' => Client::factory(),
            'lead_id' => null,
            'contact_id' => null,
            'assigned_to' => User::factory()->staff(),
            'created_by' => User::factory()->admin(),
            'stage' => $stage,
            'priority' => fake()->randomElement(DealPriority::cases()),
            'amount' => $amount,
            'currency' => 'USD',
            'probability' => $stage->defaultProbability(),
            'expected_close_date' => fake()->dateTimeBetween('+1 week', '+3 months')->format('Y-m-d'),
            'actual_close_date' => $stage->isClosed() ? fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d') : null,
            'loss_reason' => $stage === DealStage::Lost ? fake()->randomElement(['Budget constraints', 'Chose internal team', 'Competitor selected', 'Project delayed']) : null,
            'notes' => fake()->optional()->paragraph(),
            'stage_updated_at' => now(),
        ];
    }

    /**
     * Indicate the deal is in New stage.
     */
    public function stageNew(): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::New,
            'probability' => DealStage::New->defaultProbability(),
            'actual_close_date' => null,
            'loss_reason' => null,
        ]);
    }

    /**
     * Indicate the deal is in Qualified stage.
     */
    public function qualified(): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::Qualified,
            'probability' => DealStage::Qualified->defaultProbability(),
            'actual_close_date' => null,
            'loss_reason' => null,
        ]);
    }

    /**
     * Indicate the deal is in Proposal stage.
     */
    public function proposal(): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::Proposal,
            'probability' => DealStage::Proposal->defaultProbability(),
            'actual_close_date' => null,
            'loss_reason' => null,
        ]);
    }

    /**
     * Indicate the deal is in Negotiation stage.
     */
    public function negotiation(): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::Negotiation,
            'probability' => DealStage::Negotiation->defaultProbability(),
            'actual_close_date' => null,
            'loss_reason' => null,
        ]);
    }

    /**
     * Indicate the deal is Won.
     */
    public function won(): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::Won,
            'probability' => 100,
            'actual_close_date' => now()->toDateString(),
            'loss_reason' => null,
        ]);
    }

    /**
     * Indicate the deal is Lost.
     */
    public function lost(?string $reason = 'Budget constraints'): static
    {
        return $this->state(fn () => [
            'stage' => DealStage::Lost,
            'probability' => 0,
            'actual_close_date' => now()->toDateString(),
            'loss_reason' => $reason,
        ]);
    }
}
