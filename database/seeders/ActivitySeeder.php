<?php

namespace Database\Seeders;

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use App\Models\Activity;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@khybercoded.com')->first() ?? User::factory()->admin()->create();
        $manager = User::where('email', 'manager@khybercoded.com')->first() ?? User::factory()->manager()->create();
        $staff = User::where('email', 'staff@khybercoded.com')->first() ?? User::factory()->staff()->create();

        $silkRoute = Client::where('name', 'like', '%SilkRoute%')->first();
        $khyberLogistics = Client::where('name', 'like', '%Khyber Logistics%')->first();
        $zenithMedia = Client::where('name', 'like', '%Zenith Media%')->first();

        $silkDeal = Deal::where('title', 'like', '%SilkRoute%')->first();
        $khyberDeal = Deal::where('title', 'like', '%Khyber Fleet%')->first();
        $zenithDeal = Deal::where('title', 'like', '%Zenith Global%')->first();

        $lead = Lead::first();

        $activities = [
            [
                'title' => 'Technical Architecture Review with SilkRoute CTO',
                'type' => ActivityType::Meeting,
                'status' => ActivityStatus::Pending,
                'priority' => ActivityPriority::Urgent,
                'due_at' => now()->addHours(3),
                'client_id' => $silkRoute?->id,
                'deal_id' => $silkDeal?->id,
                'assigned_to' => $staff->id,
                'created_by' => $admin->id,
                'location' => 'https://meet.google.com/xyz-silk-demo',
                'notes' => 'Review mobile app API specifications, microservice architecture, and expected user load benchmarks.',
            ],
            [
                'title' => 'Follow-up Email on Enterprise SLA Contract',
                'type' => ActivityType::Email,
                'status' => ActivityStatus::Pending,
                'priority' => ActivityPriority::High,
                'due_at' => now()->addDay()->setHour(11)->setMinute(0),
                'client_id' => $khyberLogistics?->id,
                'deal_id' => $khyberDeal?->id,
                'assigned_to' => $manager->id,
                'created_by' => $admin->id,
                'notes' => 'Send revised Annexure B with updated disaster recovery SLA targets.',
            ],
            [
                'title' => 'Kickoff Call for Zenith Q1 PPC Retainer',
                'type' => ActivityType::Call,
                'status' => ActivityStatus::Completed,
                'priority' => ActivityPriority::Medium,
                'due_at' => now()->subDays(2)->setHour(15)->setMinute(0),
                'completed_at' => now()->subDays(2)->setHour(15)->setMinute(45),
                'client_id' => $zenithMedia?->id,
                'deal_id' => $zenithDeal?->id,
                'assigned_to' => $staff->id,
                'created_by' => $manager->id,
                'location' => '+44 20 7946 0991',
                'outcome' => 'Kickoff call successful. Campaign assets approved and target CPC set to £0.85.',
            ],
            [
                'title' => 'Overdue: Follow-up on Discovery Questions',
                'type' => ActivityType::Call,
                'status' => ActivityStatus::Pending,
                'priority' => ActivityPriority::High,
                'due_at' => now()->subDays(1)->setHour(14)->setMinute(0),
                'lead_id' => $lead?->id,
                'assigned_to' => $staff->id,
                'created_by' => $staff->id,
                'location' => '+92 300 4455667',
                'notes' => 'Check if prospect discussed timeline with their managing director.',
            ],
            [
                'title' => 'Prepare Proposal Quotation PDF',
                'type' => ActivityType::Task,
                'status' => ActivityStatus::Pending,
                'priority' => ActivityPriority::Medium,
                'due_at' => now()->addDays(2)->setHour(17)->setMinute(0),
                'client_id' => $khyberLogistics?->id,
                'deal_id' => $khyberDeal?->id,
                'assigned_to' => $staff->id,
                'created_by' => $manager->id,
                'notes' => 'Draft line items for GPS IoT sensor gateway and mobile dispatcher apps.',
            ],
            [
                'title' => 'Log Note: Client requested payment plan adjustment',
                'type' => ActivityType::Note,
                'status' => ActivityStatus::Completed,
                'priority' => ActivityPriority::Low,
                'due_at' => now()->subDays(4),
                'completed_at' => now()->subDays(4),
                'client_id' => $silkRoute?->id,
                'assigned_to' => $admin->id,
                'created_by' => $admin->id,
                'outcome' => 'Noted: SilkRoute finance team requested 3 equal installments instead of 50/50. Approved by management.',
            ],
        ];

        foreach ($activities as $data) {
            Activity::create($data);
        }
    }
}
