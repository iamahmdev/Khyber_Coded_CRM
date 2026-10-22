<?php

namespace App\Policies;

use App\Models\Deal;
use App\Models\User;

class DealPolicy
{
    /**
     * Determine whether the user can view any deals.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can view the deal.
     */
    public function view(User $user, Deal $deal): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $deal->assigned_to === $user->id || $deal->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create deals.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can update the deal.
     */
    public function update(User $user, Deal $deal): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $deal->assigned_to === $user->id || $deal->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can transition the stage of the deal.
     */
    public function updateStage(User $user, Deal $deal): bool
    {
        return $this->update($user, $deal);
    }

    /**
     * Determine whether the user can archive/soft-delete the deal.
     */
    public function delete(User $user, Deal $deal): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can restore the deal.
     */
    public function restore(User $user, Deal $deal): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can permanently delete the deal.
     */
    public function forceDelete(User $user, Deal $deal): bool
    {
        return $user->isAdmin();
    }
}
