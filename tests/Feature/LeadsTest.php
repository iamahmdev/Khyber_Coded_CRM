<?php

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Enums\UserRole;
use App\Models\Lead;
use App\Models\User;

test('guests are redirected to the login page when visiting leads', function () {
    $response = $this->get(route('leads.index'));
    $response->assertRedirect(route('login'));

    $response = $this->get(route('leads.create'));
    $response->assertRedirect(route('login'));

    $response = $this->post(route('leads.store'), []);
    $response->assertRedirect(route('login'));
});

test('clients are forbidden from accessing leads', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $this->actingAs($client);

    $response = $this->get(route('leads.index'));
    $response->assertForbidden();

    $response = $this->get(route('leads.create'));
    $response->assertForbidden();

    $response = $this->post(route('leads.store'), [
        'name' => 'Test Lead',
        'source' => LeadSource::Website->value,
        'status' => LeadStatus::New->value,
        'priority' => LeadPriority::Medium->value,
    ]);
    $response->assertForbidden();
});

test('admin can view the leads index with calculated metrics', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Lead::factory()->count(3)->create([
        'status' => LeadStatus::New,
        'estimated_value' => 5000.00,
    ]);

    Lead::factory()->create([
        'status' => LeadStatus::Qualified,
        'estimated_value' => 10000.00,
    ]);

    $response = $this->get(route('leads.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/index')
        ->has('leads.data', 4)
        ->where('metrics.total', 4)
        ->where('metrics.qualified', 1)
        ->where('metrics.pipeline_value', 25000)
    );
});

test('staff only sees leads assigned to or created by them', function () {
    $staff1 = User::factory()->create(['role' => UserRole::Staff]);
    $staff2 = User::factory()->create(['role' => UserRole::Staff]);

    $leadStaff1 = Lead::factory()->create([
        'assigned_to' => $staff1->id,
        'created_by' => $staff1->id,
        'name' => 'Lead for Staff 1',
    ]);

    $leadStaff2 = Lead::factory()->create([
        'assigned_to' => $staff2->id,
        'created_by' => $staff2->id,
        'name' => 'Lead for Staff 2',
    ]);

    $this->actingAs($staff1);
    $response = $this->get(route('leads.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/index')
        ->has('leads.data', 1)
        ->where('leads.data.0.name', 'Lead for Staff 1')
        ->where('metrics.total', 1)
    );
});

test('admin can create a new lead with valid data', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $leadData = [
        'name' => 'Jane Smith',
        'company' => 'Smith Innovations',
        'email' => 'jane@smithinnovations.com',
        'phone' => '+1 555 123 4567',
        'title' => 'Chief Technology Officer',
        'source' => LeadSource::Referral->value,
        'status' => LeadStatus::Qualified->value,
        'priority' => LeadPriority::High->value,
        'estimated_value' => 12500.00,
        'currency' => 'USD',
        'notes' => 'Looking for dedicated development team for SaaS MVP.',
    ];

    $response = $this->post(route('leads.store'), $leadData);

    $lead = Lead::where('email', 'jane@smithinnovations.com')->first();
    expect($lead)->not->toBeNull();
    expect($lead->company)->toBe('Smith Innovations');
    expect($lead->created_by)->toBe($admin->id);

    $response->assertRedirect(route('leads.show', $lead));
    $response->assertSessionHas('success');
});

test('lead creation validation rejects missing required fields', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $response = $this->post(route('leads.store'), []);

    $response->assertSessionHasErrors(['name', 'source', 'status', 'priority']);
});

test('duplicate email is rejected for active pipeline leads', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Lead::factory()->create([
        'email' => 'duplicate@example.com',
        'status' => LeadStatus::New,
    ]);

    $response = $this->post(route('leads.store'), [
        'name' => 'Duplicate Candidate',
        'email' => 'duplicate@example.com',
        'source' => LeadSource::Website->value,
        'status' => LeadStatus::New->value,
        'priority' => LeadPriority::Medium->value,
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('duplicate email is permitted if previous lead was converted or lost', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Lead::factory()->converted()->create([
        'email' => 'repeat@example.com',
    ]);

    $response = $this->post(route('leads.store'), [
        'name' => 'Repeat Client New Project',
        'email' => 'repeat@example.com',
        'source' => LeadSource::Website->value,
        'status' => LeadStatus::New->value,
        'priority' => LeadPriority::High->value,
    ]);

    $response->assertSessionHasNoErrors();
    expect(Lead::where('email', 'repeat@example.com')->count())->toBe(2);
});

test('authorized users can view lead details', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->create([
        'name' => 'Acme Prospect',
        'company' => 'Acme Corp',
    ]);

    $response = $this->get(route('leads.show', $lead));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/show')
        ->where('lead.id', $lead->id)
        ->where('lead.name', 'Acme Prospect')
    );
});

test('staff cannot view lead assigned to another user', function () {
    $staff1 = User::factory()->create(['role' => UserRole::Staff]);
    $staff2 = User::factory()->create(['role' => UserRole::Staff]);

    $lead = Lead::factory()->create([
        'assigned_to' => $staff2->id,
        'created_by' => $staff2->id,
    ]);

    $this->actingAs($staff1);
    $response = $this->get(route('leads.show', $lead));

    $response->assertForbidden();
});

test('admin can update a lead', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->create([
        'name' => 'Original Name',
        'status' => LeadStatus::New,
    ]);

    $response = $this->put(route('leads.update', $lead), [
        'name' => 'Updated Name',
        'source' => LeadSource::Website->value,
        'status' => LeadStatus::Contacted->value,
        'priority' => LeadPriority::High->value,
        'estimated_value' => 7500.00,
    ]);

    $response->assertRedirect(route('leads.show', $lead));
    $lead->refresh();
    expect($lead->name)->toBe('Updated Name');
    expect($lead->status)->toBe(LeadStatus::Contacted);
});

test('marking lead as lost requires a lost reason', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->create(['status' => LeadStatus::New]);

    $response = $this->put(route('leads.update', $lead), [
        'name' => $lead->name,
        'source' => LeadSource::Website->value,
        'status' => LeadStatus::Lost->value,
        'priority' => LeadPriority::Low->value,
        'lost_reason' => '',
    ]);

    $response->assertSessionHasErrors(['lost_reason']);
});

test('admin can soft delete (archive) and restore a lead', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->create();

    $response = $this->delete(route('leads.destroy', $lead));
    $response->assertRedirect(route('leads.index'));

    expect(Lead::find($lead->id))->toBeNull();
    expect(Lead::withTrashed()->find($lead->id))->not->toBeNull();

    // Restore
    $response = $this->post(route('leads.restore', $lead->id));
    $response->assertRedirect();

    expect(Lead::find($lead->id))->not->toBeNull();
});

test('leads can be searched and filtered', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Lead::factory()->create([
        'name' => 'Alpha Bravo',
        'company' => 'Aviation Tech',
        'status' => LeadStatus::Qualified,
        'source' => LeadSource::Website,
    ]);

    Lead::factory()->create([
        'name' => 'Charlie Delta',
        'company' => 'Delta Foods',
        'status' => LeadStatus::New,
        'source' => LeadSource::LinkedIn,
    ]);

    // Search
    $response = $this->get(route('leads.index', ['search' => 'Aviation']));
    $response->assertInertia(fn ($page) => $page->has('leads.data', 1)->where('leads.data.0.name', 'Alpha Bravo'));

    // Status filter
    $response = $this->get(route('leads.index', ['status' => LeadStatus::Qualified->value]));
    $response->assertInertia(fn ($page) => $page->has('leads.data', 1)->where('leads.data.0.name', 'Alpha Bravo'));

    // Source filter
    $response = $this->get(route('leads.index', ['source' => LeadSource::LinkedIn->value]));
    $response->assertInertia(fn ($page) => $page->has('leads.data', 1)->where('leads.data.0.name', 'Charlie Delta'));
});

test('lead can be converted preparing for Module 6 client onboarding', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $lead = Lead::factory()->qualified()->create();

    $response = $this->post(route('leads.convert', $lead));
    $response->assertSessionHas('success');

    $lead->refresh();
    expect($lead->status)->toBe(LeadStatus::Converted);
    expect($lead->converted_at)->not->toBeNull();

    // Attempting to convert again returns warning/error
    $response = $this->post(route('leads.convert', $lead));
    $response->assertSessionHas('error');
});
