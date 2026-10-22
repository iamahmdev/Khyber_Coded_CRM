<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin User
        User::firstOrCreate(
            ['email' => 'admin@khybercoded.com'],
            [
                'name' => 'Admin User',
                'role' => UserRole::Admin,
                'status' => UserStatus::Active,
                'phone' => '+92 300 0000001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Sample Manager
        User::firstOrCreate(
            ['email' => 'manager@khybercoded.com'],
            [
                'name' => 'Manager User',
                'role' => UserRole::Manager,
                'status' => UserStatus::Active,
                'phone' => '+92 300 0000002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Sample Staff
        User::firstOrCreate(
            ['email' => 'staff@khybercoded.com'],
            [
                'name' => 'Staff Member',
                'role' => UserRole::Staff,
                'status' => UserStatus::Active,
                'phone' => '+92 300 0000003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->call(LeadSeeder::class);
        $this->call(ClientSeeder::class);
    }
}
