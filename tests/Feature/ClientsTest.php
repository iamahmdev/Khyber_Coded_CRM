<?php

use App\Enums\ClientStatus;
use App\Enums\LeadStatus;
use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\User;

test('guests are redirected to the login page when visiting clients', function () {
    $response = $this->get(route('clients.index'));
    $response->assertRedirect(route('login'));

    $response = $this->get(route('clients.create'));
    $response->assertRedirect(route('login'));

    $response = $this->post(route('clients.store'), []);
    $response->assertRedirect(route('login'));
});

test('clients role users are forbidden from accessing CRM clients', function () {
    $clientUser = User::factory()->create(['role' => UserRole::Client]);
    $this->actingAs($clientUser);

    $response = $this->get(route('clients.index'));
    $response->assertForbidden();

    $response = $this->get(route('clients.create'));
    $response->assertForbidden();

    $response = $this->post(route('clients.store'), [
        'name' => 'Forbidden Client',
        'status' => ClientStatus::Active->value,
    ]);
    $response->assertForbidden();
});

test('admin can view clients index with calculated metrics', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Client::factory()->count(3)->create(['status' => ClientStatus::Active]);
    Client::factory()->create(['status' => ClientStatus::Inactive]);

    $response = $this->get(route('clients.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('clients/index')
        ->has('clients.data', 4)
        ->where('metrics.total', 4)
        ->where('metrics.active', 3)
    );
});

test('staff only sees clients they manage or created', function () {
    $staff1 = User::factory()->create(['role' => UserRole::Staff]);
    $staff2 = User::factory()->create(['role' => UserRole::Staff]);

    $clientStaff1 = Client::factory()->create([
        'name' => 'Client of Staff 1',
        'account_manager_id' => $staff1->id,
        'created_by' => $staff1->id,
    ]);

    $clientStaff2 = Client::factory()->create([
        'name' => 'Client of Staff 2',
        'account_manager_id' => $staff2->id,
        'created_by' => $staff2->id,
    ]);

    $this->actingAs($staff1);
    $response = $this->get(route('clients.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('clients/index')
        ->has('clients.data', 1)
        ->where('clients.data.0.name', 'Client of Staff 1')
        ->where('metrics.total', 1)
    );
});

test('admin can create a client with an initial primary contact', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $clientData = [
        'name' => 'Apex Logistics Corp',
        'industry' => 'Logistics & Supply Chain',
        'website' => 'https://apexlogistics.com',
        'email' => 'contact@apexlogistics.com',
        'phone' => '+92 300 1122334',
        'address' => 'Plot 42, Sector F-7',
        'city' => 'Islamabad',
        'country' => 'Pakistan',
        'status' => ClientStatus::Active->value,
        'primary_contact_name' => 'Tariq Mehmood',
        'primary_contact_email' => 'tariq@apexlogistics.com',
        'primary_contact_phone' => '+92 321 4455667',
        'primary_contact_title' => 'Chief Operations Officer',
    ];

    $response = $this->post(route('clients.store'), $clientData);

    $client = Client::where('name', 'Apex Logistics Corp')->first();
    expect($client)->not->toBeNull();
    expect($client->email)->toBe('contact@apexlogistics.com');
    expect($client->created_by)->toBe($admin->id);

    // Primary contact was created automatically
    $contact = Contact::where('client_id', $client->id)->first();
    expect($contact)->not->toBeNull();
    expect($contact->name)->toBe('Tariq Mehmood');
    expect($contact->is_primary)->toBeTrue();

    $response->assertRedirect(route('clients.show', $client));
});

test('client creation validation rejects missing required fields', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $response = $this->post(route('clients.store'), []);

    $response->assertSessionHasErrors(['name', 'status']);
});

test('authorized users can view client details including contacts', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create(['name' => 'HealthPulse Telemedicine']);
    $contact = Contact::factory()->primary()->create([
        'client_id' => $client->id,
        'name' => 'Dr. Zeeshan Haider',
    ]);

    $response = $this->get(route('clients.show', $client));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('clients/show')
        ->where('client.id', $client->id)
        ->where('client.name', 'HealthPulse Telemedicine')
        ->has('client.contacts', 1)
        ->where('client.contacts.0.name', 'Dr. Zeeshan Haider')
    );
});

test('staff cannot view another staff members client', function () {
    $staff1 = User::factory()->create(['role' => UserRole::Staff]);
    $staff2 = User::factory()->create(['role' => UserRole::Staff]);

    $client = Client::factory()->create([
        'account_manager_id' => $staff2->id,
        'created_by' => $staff2->id,
    ]);

    $this->actingAs($staff1);
    $response = $this->get(route('clients.show', $client));

    $response->assertForbidden();
});

test('admin can update a client', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create([
        'name' => 'Old Company Name',
        'status' => ClientStatus::Active,
    ]);

    $response = $this->put(route('clients.update', $client), [
        'name' => 'Updated Company Name',
        'status' => ClientStatus::Inactive->value,
    ]);

    $response->assertRedirect(route('clients.show', $client));
    $client->refresh();
    expect($client->name)->toBe('Updated Company Name');
    expect($client->status)->toBe(ClientStatus::Inactive);
});

test('admin can soft delete (archive) and restore a client', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create();

    $response = $this->delete(route('clients.destroy', $client));
    $response->assertRedirect(route('clients.index'));

    expect(Client::find($client->id))->toBeNull();
    expect(Client::withTrashed()->find($client->id))->not->toBeNull();

    // Restore
    $response = $this->post(route('clients.restore', $client->id));
    $response->assertRedirect();

    expect(Client::find($client->id))->not->toBeNull();
});

test('authorized users can add contacts to a client', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create();

    $response = $this->post(route('clients.contacts.store', $client), [
        'name' => 'Asim Khan',
        'email' => 'asim@example.com',
        'phone' => '+92 300 9988776',
        'title' => 'VP Technology',
        'is_primary' => true,
    ]);

    $response->assertRedirect();
    $contact = Contact::where('client_id', $client->id)->first();
    expect($contact)->not->toBeNull();
    expect($contact->name)->toBe('Asim Khan');
    expect($contact->is_primary)->toBeTrue();
});

test('setting a contact as primary unsets existing primary contact', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create();
    $contact1 = Contact::factory()->primary()->create([
        'client_id' => $client->id,
        'name' => 'First Primary',
    ]);

    $contact2 = Contact::factory()->create([
        'client_id' => $client->id,
        'name' => 'Second Contact',
        'is_primary' => false,
    ]);

    expect($contact1->fresh()->is_primary)->toBeTrue();

    // Make contact2 primary
    $response = $this->post(route('contacts.make-primary', $contact2));
    $response->assertRedirect();

    expect($contact1->fresh()->is_primary)->toBeFalse();
    expect($contact2->fresh()->is_primary)->toBeTrue();
});

test('authorized user can update and delete contacts', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $client = Client::factory()->create();
    $contact = Contact::factory()->create([
        'client_id' => $client->id,
        'name' => 'Original Contact',
    ]);

    // Update
    $response = $this->put(route('contacts.update', $contact), [
        'name' => 'Renamed Contact',
        'email' => 'renamed@example.com',
    ]);
    $response->assertRedirect();
    expect($contact->fresh()->name)->toBe('Renamed Contact');

    // Delete
    $response = $this->delete(route('contacts.destroy', $contact));
    $response->assertRedirect();
    expect(Contact::find($contact->id))->toBeNull();
});

test('clients can be searched and filtered', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Client::factory()->create([
        'name' => 'Khyber Software Solutions',
        'city' => 'Peshawar',
        'industry' => 'Technology & Software',
        'status' => ClientStatus::Active,
    ]);

    Client::factory()->create([
        'name' => 'SilkRoute Boutique',
        'city' => 'Islamabad',
        'industry' => 'E-Commerce & Retail',
        'status' => ClientStatus::Inactive,
    ]);

    // Search
    $response = $this->get(route('clients.index', ['search' => 'Khyber']));
    $response->assertInertia(fn ($page) => $page->has('clients.data', 1)->where('clients.data.0.name', 'Khyber Software Solutions'));

    // Status filter
    $response = $this->get(route('clients.index', ['status' => ClientStatus::Inactive->value]));
    $response->assertInertia(fn ($page) => $page->has('clients.data', 1)->where('clients.data.0.name', 'SilkRoute Boutique'));

    // Industry filter
    $response = $this->get(route('clients.index', ['industry' => 'Technology & Software']));
    $response->assertInertia(fn ($page) => $page->has('clients.data', 1)->where('clients.data.0.name', 'Khyber Software Solutions'));
});

test('converting a qualified lead creates a client and contact idempotently', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->qualified()->create([
        'name' => 'Farhan Qureshi',
        'company' => 'SilkRoute Apparel Ltd',
        'email' => 'farhan@silkrouteapparel.com',
        'phone' => '+92 300 5566778',
        'title' => 'Managing Director',
    ]);

    $response = $this->post(route('leads.convert', $lead));

    $lead->refresh();
    expect($lead->status)->toBe(LeadStatus::Converted);
    expect($lead->converted_to_client_id)->not->toBeNull();

    $client = Client::find($lead->converted_to_client_id);
    expect($client)->not->toBeNull();
    expect($client->name)->toBe('SilkRoute Apparel Ltd');
    expect($client->source_lead_id)->toBe($lead->id);

    // Primary contact was created with lead contact details
    $contact = Contact::where('client_id', $client->id)->first();
    expect($contact)->not->toBeNull();
    expect($contact->name)->toBe('Farhan Qureshi');
    expect($contact->title)->toBe('Managing Director');
    expect($contact->is_primary)->toBeTrue();

    // Idempotent retry: converting the lead again redirects to the same client without creating a duplicate
    $initialClientCount = Client::count();
    $retryResponse = $this->post(route('leads.convert', $lead));
    $retryResponse->assertRedirect(route('clients.show', $client));
    expect(Client::count())->toBe($initialClientCount);
});
