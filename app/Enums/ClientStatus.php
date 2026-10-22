<?php

namespace App\Enums;

enum ClientStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Archived = 'archived';

    /**
     * Get a human-readable label for the client status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Inactive => 'Inactive',
            self::Archived => 'Archived',
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Active => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            self::Inactive => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Archived => 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        };
    }

    /**
     * Check if the client is currently active.
     */
    public function isActive(): bool
    {
        return $this === self::Active;
    }
}
