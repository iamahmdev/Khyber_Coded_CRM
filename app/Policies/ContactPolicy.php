<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    /**
     * Determine whether the user can view the contact.
     */
    public function view(User $user, Contact $contact): bool
    {
        return $user->can('view', $contact->client);
    }

    /**
     * Determine whether the user can create contacts for a client.
     */
    public function create(User $user, Client $client): bool
    {
        return $user->can('update', $client);
    }

    /**
     * Determine whether the user can update the contact.
     */
    public function update(User $user, Contact $contact): bool
    {
        return $user->can('update', $contact->client);
    }

    /**
     * Determine whether the user can delete the contact.
     */
    public function delete(User $user, Contact $contact): bool
    {
        return $user->can('update', $contact->client);
    }
}
