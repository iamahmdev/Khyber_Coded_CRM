<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    /**
     * Determine whether the user can view any leads.
     */
    public function viewAny(User $user): bool
    {
        // Admin, Manager, and Staff have CRM lead access; Client role is restricted
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can view the lead.
     */
    public function view(User $user, Lead $lead): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $lead->assigned_to === $user->id || $lead->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create leads.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can update the lead.
     */
    public function update(User $user, Lead $lead): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $lead->assigned_to === $user->id || $lead->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can archive or soft delete the lead.
     */
    public function delete(User $user, Lead $lead): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can restore the archived lead.
     */
    public function restore(User $user, Lead $lead): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can permanently delete the lead.
     */
    public function forceDelete(User $user, Lead $lead): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can convert the lead to a client.
     */
    public function convert(User $user, Lead $lead): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $lead->assigned_to === $user->id;
        }

        return false;
    }
}
