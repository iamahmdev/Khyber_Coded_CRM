<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    /**
     * Determine whether the user can view any clients.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can view the client.
     */
    public function view(User $user, Client $client): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $client->account_manager_id === $user->id || $client->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create clients.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isStaff();
    }

    /**
     * Determine whether the user can update the client.
     */
    public function update(User $user, Client $client): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isStaff()) {
            return $client->account_manager_id === $user->id || $client->created_by === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can archive/soft-delete the client.
     */
    public function delete(User $user, Client $client): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can restore the client.
     */
    public function restore(User $user, Client $client): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can permanently delete the client.
     */
    public function forceDelete(User $user, Client $client): bool
    {
        return $user->isAdmin();
    }
}
