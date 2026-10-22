<?php

namespace Database\Factories;

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use App\Models\Activity;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(ActivityType::cases());
        $status = fake()->randomElement([ActivityStatus::Pending, ActivityStatus::Completed]);

        return [
            'title' => fake()->randomElement([
                'Discovery Call with Key Stakeholders',
                'Technical Architecture Demo & Q&A',
                'Contract & SLA Review Meeting',
                'Follow-up on Proposal Feedback',
                'Quarterly Account Review & Optimization',
                'Requirement Gathering Session',
                'Check-in Call regarding Project Milestones',
            ]),
            'type' => $type,
            'status' => $status,
            'priority' => fake()->randomElement(ActivityPriority::cases()),
            'due_at' => fake()->dateTimeBetween('-1 week', '+2 weeks'),
            'completed_at' => $status === ActivityStatus::Completed ? now() : null,
            'lead_id' => null,
            'client_id' => Client::factory(),
            'deal_id' => null,
            'assigned_to' => User::factory()->staff(),
            'created_by' => User::factory()->admin(),
            'location' => $type === ActivityType::Meeting ? 'Google Meet / Zoom' : ($type === ActivityType::Call ? '+92 300 1234567' : null),
            'notes' => fake()->optional()->sentence(),
            'outcome' => $status === ActivityStatus::Completed ? 'Discussion went positively; client agreed to proceed to next stage.' : null,
        ];
    }

    /**
     * Indicate the activity is pending.
     */
    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => ActivityStatus::Pending,
            'completed_at' => null,
            'outcome' => null,
            'due_at' => fake()->dateTimeBetween('+1 day', '+1 week'),
        ]);
    }

    /**
     * Indicate the activity is completed.
     */
    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => ActivityStatus::Completed,
            'completed_at' => now(),
            'outcome' => 'Completed successfully as scheduled.',
            'due_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate the activity is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => ActivityStatus::Cancelled,
            'completed_at' => null,
            'outcome' => 'Cancelled per client request.',
        ]);
    }

    /**
     * Indicate the activity is overdue (pending with due date in the past).
     */
    public function overdue(): static
    {
        return $this->state(fn () => [
            'status' => ActivityStatus::Pending,
            'completed_at' => null,
            'outcome' => null,
            'due_at' => fake()->dateTimeBetween('-5 days', '-1 day'),
        ]);
    }
}
