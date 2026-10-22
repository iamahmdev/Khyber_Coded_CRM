<?php

namespace App\Enums;

enum DealStage: string
{
    case New = 'new';
    case Qualified = 'qualified';
    case Proposal = 'proposal';
    case Negotiation = 'negotiation';
    case Won = 'won';
    case Lost = 'lost';

    /**
     * Get a human-readable label for the deal stage.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'New Opportunity',
            self::Qualified => 'Qualified',
            self::Proposal => 'Proposal / Pitch',
            self::Negotiation => 'Negotiation',
            self::Won => 'Closed Won',
            self::Lost => 'Closed Lost',
        };
    }

    /**
     * Get the default win probability percentage (0 - 100) for this stage.
     */
    public function defaultProbability(): int
    {
        return match ($this) {
            self::New => 10,
            self::Qualified => 25,
            self::Proposal => 50,
            self::Negotiation => 75,
            self::Won => 100,
            self::Lost => 0,
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::New => 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            self::Qualified => 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
            self::Proposal => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Negotiation => 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            self::Won => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            self::Lost => 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
    }

    /**
     * Check if the stage represents a closed deal.
     */
    public function isClosed(): bool
    {
        return $this === self::Won || $this === self::Lost;
    }

    /**
     * Check if the stage is Won.
     */
    public function isWon(): bool
    {
        return $this === self::Won;
    }

    /**
     * Check if the stage is Lost.
     */
    public function isLost(): bool
    {
        return $this === self::Lost;
    }
}
