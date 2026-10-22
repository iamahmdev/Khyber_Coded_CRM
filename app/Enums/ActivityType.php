<?php

namespace App\Enums;

enum ActivityType: string
{
    case Call = 'call';
    case Meeting = 'meeting';
    case Email = 'email';
    case Reminder = 'reminder';
    case Task = 'task';
    case Note = 'note';

    /**
     * Get a human-readable label for the activity type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Call => 'Phone Call',
            self::Meeting => 'Meeting / Demo',
            self::Email => 'Email Follow-up',
            self::Reminder => 'Reminder',
            self::Task => 'Action Item / Task',
            self::Note => 'Log Note',
        };
    }

    /**
     * Get badge styling classes for UI rendering.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Call => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            self::Meeting => 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            self::Email => 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            self::Reminder => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            self::Task => 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
            self::Note => 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        };
    }

    /**
     * Get Lucide icon name for frontend rendering.
     */
    public function iconName(): string
    {
        return match ($this) {
            self::Call => 'Phone',
            self::Meeting => 'Video',
            self::Email => 'Mail',
            self::Reminder => 'Bell',
            self::Task => 'CheckSquare',
            self::Note => 'FileText',
        };
    }
}
