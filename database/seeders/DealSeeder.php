<?php

namespace Database\Seeders;

use App\Enums\DealPriority;
use App\Enums\DealStage;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class DealSeeder extends Seeder
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

        $leads = Lead::take(3)->get();

        $dealsData = [
            [
                'title' => 'SilkRoute E-Commerce Mobile App & POS',
                'client_id' => $silkRoute?->id,
                'lead_id' => $silkRoute?->source_lead_id,
                'contact_id' => $silkRoute ? Contact::where('client_id', $silkRoute->id)->first()?->id : null,
                'assigned_to' => $staff->id,
                'created_by' => $admin->id,
                'stage' => DealStage::Negotiation,
                'priority' => DealPriority::High,
                'amount' => 18500.00,
                'currency' => 'USD',
                'probability' => 75,
                'expected_close_date' => now()->addDays(14)->toDateString(),
                'notes' => 'Client is evaluating our proposal against internal timeline. Final discount discussed at 5%.',
            ],
            [
                'title' => 'Khyber Fleet Tracking & Dispatch ERP',
                'client_id' => $khyberLogistics?->id,
                'lead_id' => $khyberLogistics?->source_lead_id,
                'contact_id' => $khyberLogistics ? Contact::where('client_id', $khyberLogistics->id)->first()?->id : null,
                'assigned_to' => $manager->id,
                'created_by' => $admin->id,
                'stage' => DealStage::Proposal,
                'priority' => DealPriority::Urgent,
                'amount' => 34000.00,
                'currency' => 'USD',
                'probability' => 50,
                'expected_close_date' => now()->addDays(25)->toDateString(),
                'notes' => 'Detailed technical architecture document and SLA submitted for CTO sign-off.',
            ],
            [
                'title' => 'Zenith Global Brand SEO & PPC Campaign Q1',
                'client_id' => $zenithMedia?->id,
                'lead_id' => $zenithMedia?->source_lead_id,
                'contact_id' => $zenithMedia ? Contact::where('client_id', $zenithMedia->id)->first()?->id : null,
                'assigned_to' => $staff->id,
                'created_by' => $manager->id,
                'stage' => DealStage::Won,
                'priority' => DealPriority::Medium,
                'amount' => 12000.00,
                'currency' => 'USD',
                'probability' => 100,
                'expected_close_date' => now()->subDays(5)->toDateString(),
                'actual_close_date' => now()->subDays(5)->toDateString(),
                'notes' => 'Contract executed and 50% upfront retainer received.',
            ],
            [
                'title' => 'Smart Warehouse Automation AI PoC',
                'client_id' => $khyberLogistics?->id,
                'lead_id' => null,
                'contact_id' => $khyberLogistics ? Contact::where('client_id', $khyberLogistics->id)->first()?->id : null,
                'assigned_to' => $admin->id,
                'created_by' => $admin->id,
                'stage' => DealStage::Qualified,
                'priority' => DealPriority::Medium,
                'amount' => 22000.00,
                'currency' => 'USD',
                'probability' => 25,
                'expected_close_date' => now()->addDays(45)->toDateString(),
                'notes' => 'Requirements gathering workshop completed. High feasibility score.',
            ],
            [
                'title' => 'Boutique Loyalty Rewards Microservices',
                'client_id' => $silkRoute?->id,
                'lead_id' => null,
                'contact_id' => $silkRoute ? Contact::where('client_id', $silkRoute->id)->first()?->id : null,
                'assigned_to' => $staff->id,
                'created_by' => $staff->id,
                'stage' => DealStage::New,
                'priority' => DealPriority::Low,
                'amount' => 8500.00,
                'currency' => 'USD',
                'probability' => 10,
                'expected_close_date' => now()->addDays(60)->toDateString(),
                'notes' => 'Early exploratory discussion following the mobile app initiative.',
            ],
            [
                'title' => 'Legacy CRM Data Migration Service',
                'client_id' => null,
                'lead_id' => $leads->first()?->id,
                'contact_id' => null,
                'assigned_to' => $manager->id,
                'created_by' => $manager->id,
                'stage' => DealStage::Lost,
                'priority' => DealPriority::Low,
                'amount' => 6000.00,
                'currency' => 'USD',
                'probability' => 0,
                'expected_close_date' => now()->subDays(10)->toDateString(),
                'actual_close_date' => now()->subDays(10)->toDateString(),
                'loss_reason' => 'Client chose to handle data migration with internal IT resources.',
                'notes' => 'Disqualified gracefully; open to re-engaging for QA testing.',
            ],
        ];

        foreach ($dealsData as $data) {
            $deal = Deal::create($data);

            // Record initial history record
            $deal->stageHistories()->create([
                'user_id' => $data['created_by'],
                'from_stage' => null,
                'to_stage' => $data['stage']->value,
                'notes' => 'Initial deal creation in stage '.$data['stage']->label(),
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
