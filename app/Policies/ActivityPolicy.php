<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    /**
     * Determine whether the user can view any activities.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can view the activity.
     */
    public function view(User $user, Activity $activity): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $activity->assigned_to === $user->id || $activity->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create activities.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can update the activity.
     */
    public function update(User $user, Activity $activity): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $activity->assigned_to === $user->id || $activity->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can toggle completion status.
     */
    public function complete(User $user, Activity $activity): bool
    {
        return $this->update($user, $activity);
    }

    /**
     * Determine whether the user can archive/soft-delete the activity.
     */
    public function delete(User $user, Activity $activity): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $activity->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the activity.
     */
    public function restore(User $user, Activity $activity): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can permanently delete the activity.
     */
    public function forceDelete(User $user, Activity $activity): bool
    {
        return $user->isAdmin();
    }
}
