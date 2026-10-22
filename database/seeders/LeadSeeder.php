<?php

namespace Database\Seeders;

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@khybercoded.com')->first();
        $manager = User::where('email', 'manager@khybercoded.com')->first();
        $staff = User::where('email', 'staff@khybercoded.com')->first();

        $creatorId = $admin?->id ?? User::first()?->id;
        $staffId = $staff?->id ?? $creatorId;
        $managerId = $manager?->id ?? $creatorId;

        $leads = [
            [
                'name' => 'Tariq Mehmood',
                'company' => 'Apex Logistics Corp',
                'email' => 'tariq@apexlogistics.com',
                'phone' => '+92 321 4455667',
                'title' => 'Chief Operations Officer',
                'source' => LeadSource::Website,
                'status' => LeadStatus::New,
                'priority' => LeadPriority::High,
                'estimated_value' => 8500.00,
                'currency' => 'USD',
                'assigned_to' => $staffId,
                'created_by' => $creatorId,
                'notes' => 'Inquired through website contact form regarding custom ERP and fleet dispatch portal.',
            ],
            [
                'name' => 'Sara Al-Mansoor',
                'company' => 'Oasis Media Group',
                'email' => 'sara@oasismedia.ae',
                'phone' => '+971 50 123 4567',
                'title' => 'Digital Marketing Lead',
                'source' => LeadSource::LinkedIn,
                'status' => LeadStatus::Contacted,
                'priority' => LeadPriority::Urgent,
                'estimated_value' => 14000.00,
                'currency' => 'USD',
                'assigned_to' => $staffId,
                'created_by' => $managerId,
                'notes' => 'Looking for complete brand re-architecture and high-converting marketing website.',
            ],
            [
                'name' => 'Dr. Zeeshan Haider',
                'company' => 'HealthPulse Telemedicine',
                'email' => 'zeeshan@healthpulse.pk',
                'phone' => '+92 333 9988776',
                'title' => 'Founder & Managing Director',
                'source' => LeadSource::Referral,
                'status' => LeadStatus::Qualified,
                'priority' => LeadPriority::Urgent,
                'estimated_value' => 22000.00,
                'currency' => 'USD',
                'assigned_to' => $managerId,
                'created_by' => $creatorId,
                'notes' => 'Referred by existing client. Needs HIPAA-compliant patient management web app.',
            ],
            [
                'name' => 'Alexander Wright',
                'company' => 'NorthStar Analytics UK',
                'email' => 'a.wright@northstaranalytics.co.uk',
                'phone' => '+44 20 7946 0991',
                'title' => 'VP of Engineering',
                'source' => LeadSource::ColdOutreach,
                'status' => LeadStatus::Proposal,
                'priority' => LeadPriority::High,
                'estimated_value' => 18500.00,
                'currency' => 'USD',
                'assigned_to' => $staffId,
                'created_by' => $creatorId,
                'notes' => 'Proposal sent for dedicated full-stack Laravel/React sprint team.',
            ],
            [
                'name' => 'Khadija Bilal',
                'company' => 'SilkRoute Boutique',
                'email' => 'khadija@silkrouteapparel.com',
                'phone' => '+92 300 1122334',
                'title' => 'E-Commerce Director',
                'source' => LeadSource::GoogleAds,
                'status' => LeadStatus::Converted,
                'priority' => LeadPriority::Medium,
                'estimated_value' => 6000.00,
                'currency' => 'USD',
                'assigned_to' => $staffId,
                'created_by' => $creatorId,
                'notes' => 'Successfully signed retainer agreement. Converted for onboarding in Module 6.',
                'converted_at' => now()->subDays(2),
            ],
            [
                'name' => 'Marcus Vance',
                'company' => 'Vance & Partners Legal',
                'email' => 'marcus@vancelegal.com',
                'phone' => '+1 415 555 2671',
                'title' => 'Senior Partner',
                'source' => LeadSource::Website,
                'status' => LeadStatus::Lost,
                'priority' => LeadPriority::Low,
                'estimated_value' => 4500.00,
                'currency' => 'USD',
                'assigned_to' => $staffId,
                'created_by' => $staffId,
                'notes' => 'Decided to postpone internal digitization until next fiscal year.',
                'lost_reason' => 'Client postponed budget until Q3',
            ],
        ];

        foreach ($leads as $data) {
            Lead::firstOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
