<?php

namespace Database\Seeders;

use App\Enums\ClientStatus;
use App\Enums\LeadStatus;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@khybercoded.com')->first();
        $manager = User::where('email', 'manager@khybercoded.com')->first();
        $staff = User::where('email', 'staff@khybercoded.com')->first();

        $adminId = $admin?->id ?? User::first()?->id;
        $staffId = $staff?->id ?? $adminId;
        $managerId = $manager?->id ?? $adminId;

        // 1. Converted Lead Client: SilkRoute Boutique
        $convertedLead = Lead::where('email', 'khadija@silkrouteapparel.com')->first();

        $client1 = Client::firstOrCreate(
            ['name' => 'SilkRoute Boutique'],
            [
                'industry' => 'E-Commerce & Retail',
                'website' => 'https://silkrouteapparel.com',
                'email' => 'contact@silkrouteapparel.com',
                'phone' => '+92 300 1122334',
                'address' => 'Plot 42, Sector F-7',
                'city' => 'Islamabad',
                'state' => 'Federal Capital',
                'postal_code' => '44000',
                'country' => 'Pakistan',
                'status' => ClientStatus::Active,
                'account_manager_id' => $staffId,
                'created_by' => $adminId,
                'source_lead_id' => $convertedLead?->id,
                'notes' => 'Converted from inbound Google Ads inquiry. Monthly retainer agreement for web development.',
            ]
        );

        if ($convertedLead && ! $convertedLead->converted_to_client_id) {
            $convertedLead->update([
                'status' => LeadStatus::Converted,
                'converted_at' => now(),
                'converted_to_client_id' => $client1->id,
            ]);
        }

        // Primary contact for SilkRoute
        Contact::firstOrCreate(
            ['email' => 'khadija@silkrouteapparel.com'],
            [
                'client_id' => $client1->id,
                'name' => 'Khadija Bilal',
                'phone' => '+92 300 1122334',
                'title' => 'E-Commerce Director',
                'department' => 'Executive',
                'is_primary' => true,
                'notes' => 'Primary decision maker for technical contracts.',
            ]
        );

        Contact::firstOrCreate(
            ['email' => 'finance@silkrouteapparel.com'],
            [
                'client_id' => $client1->id,
                'name' => 'Farhan Qureshi',
                'phone' => '+92 300 1122335',
                'title' => 'Billing & Finance Lead',
                'department' => 'Finance',
                'is_primary' => false,
                'notes' => 'Invoicing and payment contact.',
            ]
        );

        // 2. Client: Khyber Logistics Pvt Ltd
        $client2 = Client::firstOrCreate(
            ['name' => 'Khyber Logistics Pvt Ltd'],
            [
                'industry' => 'Logistics & Supply Chain',
                'website' => 'https://khyberlogistics.pk',
                'email' => 'info@khyberlogistics.pk',
                'phone' => '+92 91 5840011',
                'address' => 'Hayatabad Industrial Estate',
                'city' => 'Peshawar',
                'state' => 'Khyber Pakhtunkhwa',
                'postal_code' => '25000',
                'country' => 'Pakistan',
                'status' => ClientStatus::Active,
                'account_manager_id' => $managerId,
                'created_by' => $adminId,
                'notes' => 'Custom fleet dispatch management application and mobile app.',
            ]
        );

        Contact::firstOrCreate(
            ['email' => 'asim.khan@khyberlogistics.pk'],
            [
                'client_id' => $client2->id,
                'name' => 'Asim Khan',
                'phone' => '+92 333 9112233',
                'title' => 'VP Operations',
                'department' => 'Operations',
                'is_primary' => true,
                'notes' => 'Oversees logistics systems deployment.',
            ]
        );

        // 3. Client: Zenith Digital Agency (UK)
        $client3 = Client::firstOrCreate(
            ['name' => 'Zenith Media UK'],
            [
                'industry' => 'Digital Media',
                'website' => 'https://zenithmedia.co.uk',
                'email' => 'partnerships@zenithmedia.co.uk',
                'phone' => '+44 20 7946 0888',
                'address' => '45 Soho Square',
                'city' => 'London',
                'state' => 'Greater London',
                'postal_code' => 'W1D 3QU',
                'country' => 'United Kingdom',
                'status' => ClientStatus::Active,
                'account_manager_id' => $staffId,
                'created_by' => $managerId,
                'notes' => 'White-label web engineering partner.',
            ]
        );

        Contact::firstOrCreate(
            ['email' => 'oliver.smith@zenithmedia.co.uk'],
            [
                'client_id' => $client3->id,
                'name' => 'Oliver Smith',
                'phone' => '+44 7700 900123',
                'title' => 'Managing Director',
                'department' => 'Executive',
                'is_primary' => true,
            ]
        );
    }
}
