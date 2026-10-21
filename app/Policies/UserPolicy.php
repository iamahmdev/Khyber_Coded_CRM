<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can change roles or status.
     */
    public function manageRoles(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admins can delete users
        if (! $user->isAdmin()) {
            return false;
        }

        // Users cannot delete themselves via the admin user management interface
        if ($user->id === $model->id) {
            return false;
        }

        // Prevent deleting the last active administrator
        if ($model->isAdmin()) {
            $activeAdminsCount = User::where('role', UserRole::Admin->value)
                ->where('id', '!=', $model->id)
                ->count();

            if ($activeAdminsCount === 0) {
                return false;
            }
        }

        return true;
    }
}
