<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Client;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContactController extends Controller
{
    /**
     * Store a newly created contact under a client.
     */
    public function store(StoreContactRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();
        $isPrimary = ! empty($validated['is_primary']);

        $contact = $client->contacts()->create($validated);

        if ($isPrimary) {
            $contact->setAsPrimary();
        }

        return redirect()->back()
            ->with('success', 'Contact person added successfully.');
    }

    /**
     * Update the specified contact.
     */
    public function update(UpdateContactRequest $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validated();
        $isPrimary = ! empty($validated['is_primary']);

        $contact->update($validated);

        if ($isPrimary) {
            $contact->setAsPrimary();
        }

        return redirect()->back()
            ->with('success', 'Contact updated successfully.');
    }

    /**
     * Remove the specified contact.
     */
    public function destroy(Request $request, Contact $contact): RedirectResponse
    {
        Gate::authorize('delete', $contact);

        $contact->delete();

        return redirect()->back()
            ->with('success', 'Contact removed successfully.');
    }

    /**
     * Set the contact as primary for the client.
     */
    public function makePrimary(Request $request, Contact $contact): RedirectResponse
    {
        Gate::authorize('update', $contact);

        $contact->setAsPrimary();

        return redirect()->back()
            ->with('success', "{$contact->name} is now the primary contact.");
    }
}
