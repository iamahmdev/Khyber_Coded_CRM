<?php

namespace App\Enums;

enum DealPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Urgent = 'urgent';

    /**
     * Get a human-readable label for the deal priority.
     */
    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
            self::Urgent => 'Urgent',
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Low => 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
            self::Medium => 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            self::High => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Urgent => 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
    }
}
