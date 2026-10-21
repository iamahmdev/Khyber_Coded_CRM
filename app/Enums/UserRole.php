<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case Staff = 'staff';
    case Client = 'client';

    /**
     * Get a human-readable label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Manager => 'Manager',
            self::Staff => 'Staff',
            self::Client => 'Client',
        };
    }

    /**
     * Check if the role is Administrator.
     */
    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    /**
     * Check if the role is Manager.
     */
    public function isManager(): bool
    {
        return $this === self::Manager;
    }

    /**
     * Check if the role has management permissions.
     */
    public function canManageUsers(): bool
    {
        return $this === self::Admin || $this === self::Manager;
    }
}
