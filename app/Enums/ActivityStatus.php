<?php

namespace App\Enums;

enum ActivityStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get a human-readable label for the activity status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Pending => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Completed => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            self::Cancelled => 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        };
    }

    /**
     * Check if the activity is completed.
     */
    public function isCompleted(): bool
    {
        return $this === self::Completed;
    }

    /**
     * Check if the activity is pending.
     */
    public function isPending(): bool
    {
        return $this === self::Pending;
    }
}
