<?php

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use App\Models\Activity;
use App\Models\Client;
use App\Models\Deal;
use App\Models\User;

test('unauthenticated users cannot view activities', function () {
    $response = $this->get(route('activities.index'));
    $response->assertRedirect(route('login'));
});

test('client role users are forbidden from viewing activities', function () {
    $clientUser = User::factory()->client()->create();

    $this->actingAs($clientUser);
    $response = $this->get(route('activities.index'));
    $response->assertForbidden();
});

test('admin can view activities index with precalculated metrics and tabs', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Activity::factory()->create(['title' => 'Sample Upcoming Call']);

    $response = $this->get(route('activities.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('activities/index')
        ->has('activities.data')
        ->has('metrics')
        ->where('activeTab', 'upcoming')
    );
});

test('activity metrics accurately calculate pending, overdue, and today counts', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Activity::query()->forceDelete();

    // 1 Pending due today
    Activity::factory()->create([
        'status' => ActivityStatus::Pending,
        'due_at' => now()->startOfDay()->addHours(14),
    ]);

    // 1 Overdue (pending in past)
    Activity::factory()->overdue()->create();

    // 1 Future upcoming (pending in 3 days)
    Activity::factory()->create([
        'status' => ActivityStatus::Pending,
        'due_at' => now()->addDays(3),
    ]);

    // 1 Completed today
    Activity::factory()->completed()->create([
        'completed_at' => now(),
    ]);

    $response = $this->get(route('activities.index'));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('metrics.pending_count', 3)
        ->where('metrics.overdue_count', 1)
        ->where('metrics.today_count', 1)
        ->where('metrics.completed_count', 1)
    );
});

test('staff user only sees activities assigned to or created by them', function () {
    $staff1 = User::factory()->staff()->create();
    $staff2 = User::factory()->staff()->create();

    $act1 = Activity::factory()->create(['assigned_to' => $staff1->id, 'title' => 'Task for Staff 1']);
    $act2 = Activity::factory()->create(['assigned_to' => $staff2->id, 'title' => 'Task for Staff 2']);

    $this->actingAs($staff1);

    $response = $this->get(route('activities.index', ['tab' => 'all']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.id', $act1->id)
    );
});

test('authorized user can schedule a new activity', function () {
    $admin = User::factory()->admin()->create();
    $client = Client::factory()->create();
    $deal = Deal::factory()->create(['client_id' => $client->id]);
    $staff = User::factory()->staff()->create();

    $this->actingAs($admin);

    $dueAt = now()->addDays(2)->format('Y-m-d H:i:s');

    $response = $this->post(route('activities.store'), [
        'title' => 'Product Demo with SilkRoute Stakeholders',
        'type' => ActivityType::Meeting->value,
        'priority' => ActivityPriority::Urgent->value,
        'due_at' => $dueAt,
        'client_id' => $client->id,
        'deal_id' => $deal->id,
        'assigned_to' => $staff->id,
        'location' => 'https://meet.google.com/abc-xyz',
        'notes' => 'Cover user roles and invoicing modules.',
    ]);

    $activity = Activity::where('title', 'Product Demo with SilkRoute Stakeholders')->first();
    expect($activity)->not->toBeNull();
    expect($activity->type)->toBe(ActivityType::Meeting);
    expect($activity->priority)->toBe(ActivityPriority::Urgent);
    expect($activity->status)->toBe(ActivityStatus::Pending);
    expect($activity->client_id)->toBe($client->id);
    expect($activity->deal_id)->toBe($deal->id);

    $response->assertRedirect(route('activities.index'));
    $response->assertSessionHas('success');
});

test('scheduling activity validates required fields', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $response = $this->post(route('activities.store'), [
        'title' => '',
        'type' => 'invalid-type',
        'priority' => 'invalid-priority',
        'due_at' => 'not-a-date',
    ]);

    $response->assertSessionHasErrors(['title', 'type', 'priority', 'due_at']);
});

test('activity can be viewed with relations', function () {
    $admin = User::factory()->admin()->create();
    $client = Client::factory()->create(['name' => 'Khyber Tech']);
    $deal = Deal::factory()->create(['title' => 'Cloud ERP Deal']);
    $activity = Activity::factory()->create([
        'title' => 'Architecture Review',
        'client_id' => $client->id,
        'deal_id' => $deal->id,
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('activities.show', $activity));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('activities/show')
        ->where('activity.title', 'Architecture Review')
        ->where('activity.client.name', 'Khyber Tech')
        ->where('activity.deal.title', 'Cloud ERP Deal')
    );
});

test('activity can be updated with new fields', function () {
    $admin = User::factory()->admin()->create();
    $activity = Activity::factory()->pending()->create(['title' => 'Original Title']);

    $this->actingAs($admin);

    $newDueAt = now()->addDays(4)->format('Y-m-d H:i:s');

    $response = $this->put(route('activities.update', $activity), [
        'title' => 'Updated Meeting Title',
        'type' => ActivityType::Call->value,
        'status' => ActivityStatus::Pending->value,
        'priority' => ActivityPriority::High->value,
        'due_at' => $newDueAt,
        'notes' => 'Updated notes for the call.',
    ]);

    $activity->refresh();
    expect($activity->title)->toBe('Updated Meeting Title');
    expect($activity->type)->toBe(ActivityType::Call);
    expect($activity->priority)->toBe(ActivityPriority::High);
    expect($activity->notes)->toBe('Updated notes for the call.');

    $response->assertRedirect(route('activities.show', $activity));
    $response->assertSessionHas('success');
});

test('staff user cannot update activity assigned to another user', function () {
    $staff1 = User::factory()->staff()->create();
    $staff2 = User::factory()->staff()->create();

    $activity = Activity::factory()->create(['assigned_to' => $staff2->id]);

    $this->actingAs($staff1);

    $response = $this->put(route('activities.update', $activity), [
        'title' => 'Unauthorized update',
        'type' => ActivityType::Call->value,
        'status' => ActivityStatus::Pending->value,
        'priority' => ActivityPriority::Low->value,
        'due_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertForbidden();
});

test('activity can be marked as completed with outcome notes', function () {
    $admin = User::factory()->admin()->create();
    $activity = Activity::factory()->pending()->create();

    $this->actingAs($admin);

    $response = $this->patch(route('activities.complete', $activity), [
        'status' => ActivityStatus::Completed->value,
        'outcome' => 'Client approved the wireframe and authorized sprint start.',
    ]);

    $activity->refresh();
    expect($activity->status)->toBe(ActivityStatus::Completed);
    expect($activity->completed_at)->not->toBeNull();
    expect($activity->outcome)->toBe('Client approved the wireframe and authorized sprint start.');

    $response->assertRedirect();
    $response->assertSessionHas('success');
});

test('activity can be marked as cancelled', function () {
    $admin = User::factory()->admin()->create();
    $activity = Activity::factory()->pending()->create();

    $this->actingAs($admin);

    $response = $this->patch(route('activities.complete', $activity), [
        'status' => ActivityStatus::Cancelled->value,
        'outcome' => 'Cancelled due to national holiday.',
    ]);

    $activity->refresh();
    expect($activity->status)->toBe(ActivityStatus::Cancelled);
    expect($activity->outcome)->toBe('Cancelled due to national holiday.');

    $response->assertRedirect();
    $response->assertSessionHas('success');
});

test('overdue scope identifies pending activities with due_at in the past', function () {
    Activity::query()->forceDelete();

    $overdueAct = Activity::factory()->overdue()->create(['title' => 'Overdue Task']);
    $upcomingAct = Activity::factory()->pending()->create(['title' => 'Future Task']);

    expect($overdueAct->isOverdue())->toBeTrue();
    expect($upcomingAct->isOverdue())->toBeFalse();

    $overdueIds = Activity::overdue()->pluck('id')->all();
    expect($overdueIds)->toContain($overdueAct->id);
    expect($overdueIds)->not->toContain($upcomingAct->id);
});

test('admin can delete and restore an activity', function () {
    $admin = User::factory()->admin()->create();
    $activity = Activity::factory()->create();

    $this->actingAs($admin);

    // Delete
    $response = $this->delete(route('activities.destroy', $activity));
    $response->assertRedirect(route('activities.index'));

    expect(Activity::find($activity->id))->toBeNull();
    expect(Activity::withTrashed()->find($activity->id))->not->toBeNull();

    // Restore
    $response = $this->post(route('activities.restore', $activity->id));
    $response->assertRedirect();

    expect(Activity::find($activity->id))->not->toBeNull();
});

test('staff user cannot delete activity created by someone else', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();

    $activity = Activity::factory()->create([
        'created_by' => $admin->id,
        'assigned_to' => $staff->id,
    ]);

    $this->actingAs($staff);

    $response = $this->delete(route('activities.destroy', $activity));
    $response->assertForbidden();
});

test('activities can be filtered by type and searched by title', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Activity::query()->forceDelete();

    Activity::factory()->create([
        'title' => 'Quarterly Business Review Call',
        'type' => ActivityType::Call,
        'status' => ActivityStatus::Pending,
        'due_at' => now()->addDays(2),
    ]);

    Activity::factory()->create([
        'title' => 'General Technical Meeting',
        'type' => ActivityType::Meeting,
        'status' => ActivityStatus::Pending,
        'due_at' => now()->addDays(2),
    ]);

    // Search filter
    $response = $this->get(route('activities.index', ['search' => 'Quarterly Business']));
    $response->assertInertia(fn ($page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.title', 'Quarterly Business Review Call')
    );

    // Type filter
    $response = $this->get(route('activities.index', ['type' => ActivityType::Call->value]));
    $response->assertInertia(fn ($page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.type', ActivityType::Call->value)
    );
});
