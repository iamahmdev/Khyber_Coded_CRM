<?php

namespace App\Enums;

enum LeadStatus: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Qualified = 'qualified';
    case Proposal = 'proposal';
    case Unqualified = 'unqualified';
    case Converted = 'converted';
    case Lost = 'lost';

    /**
     * Get a human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Contacted => 'Contacted',
            self::Qualified => 'Qualified',
            self::Proposal => 'Proposal Sent',
            self::Unqualified => 'Unqualified',
            self::Converted => 'Converted',
            self::Lost => 'Lost',
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::New => 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            self::Contacted => 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            self::Qualified => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            self::Proposal => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Unqualified => 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
            self::Converted => 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
            self::Lost => 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        };
    }

    /**
     * Check if the lead is in an active pipeline stage.
     */
    public function isActive(): bool
    {
        return ! in_array($this, [self::Converted, self::Lost, self::Unqualified], true);
    }

    /**
     * Check if the lead is ready to be converted into a client.
     */
    public function isConvertible(): bool
    {
        return in_array($this, [self::Qualified, self::Proposal], true);
    }
}
