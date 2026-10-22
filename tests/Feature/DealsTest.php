<?php

use App\Enums\DealPriority;
use App\Enums\DealStage;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStageHistory;
use App\Models\User;

test('unauthenticated users cannot view sales deals', function () {
    $response = $this->get(route('deals.index'));
    $response->assertRedirect(route('login'));
});

test('client role users are forbidden from viewing sales deals', function () {
    $clientUser = User::factory()->client()->create();

    $this->actingAs($clientUser);
    $response = $this->get(route('deals.index'));
    $response->assertForbidden();
});

test('admin can view sales pipeline in kanban board mode and list mode', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $deal = Deal::factory()->create(['title' => 'Alpha Cloud Project']);

    // Board view
    $response = $this->get(route('deals.index', ['view' => 'board']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('deals/index')
        ->has('boardDeals')
        ->has('metrics')
        ->where('viewMode', 'board')
    );

    // List view
    $response = $this->get(route('deals.index', ['view' => 'list']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('deals/index')
        ->has('deals.data')
        ->where('viewMode', 'list')
    );
});

test('pipeline metrics accurately compute total pipeline value, weighted forecast, and win rate', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    // Clear existing for exact calculation test
    Deal::query()->forceDelete();

    // Open deal 1: $10,000 at 50% prob
    Deal::factory()->create([
        'stage' => DealStage::Proposal,
        'amount' => 10000.00,
        'probability' => 50,
    ]);

    // Open deal 2: $20,000 at 25% prob
    Deal::factory()->create([
        'stage' => DealStage::Qualified,
        'amount' => 20000.00,
        'probability' => 25,
    ]);

    // Won deal: $15,000 at 100% prob
    Deal::factory()->won()->create([
        'amount' => 15000.00,
    ]);

    // Lost deal: $5,000
    Deal::factory()->lost()->create([
        'amount' => 5000.00,
    ]);

    $response = $this->get(route('deals.index'));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('metrics.total_pipeline_value', 30000) // 10k + 20k
        ->where('metrics.weighted_pipeline_value', 10000) // (10k*0.5) + (20k*0.25) = 5k + 5k = 10k
        ->where('metrics.active_deals_count', 2)
        ->where('metrics.won_value', 15000)
        ->where('metrics.won_count', 1)
        ->where('metrics.lost_count', 1)
        ->where('metrics.win_rate', 50) // 1 won / (1 won + 1 lost) = 50%
    );
});

test('staff user only sees deals assigned to them or created by them', function () {
    $staff1 = User::factory()->staff()->create();
    $staff2 = User::factory()->staff()->create();

    $dealStaff1 = Deal::factory()->create(['assigned_to' => $staff1->id, 'title' => 'Deal Assigned to Staff 1']);
    $dealStaff2 = Deal::factory()->create(['assigned_to' => $staff2->id, 'title' => 'Deal Assigned to Staff 2']);

    $this->actingAs($staff1);

    $response = $this->get(route('deals.index', ['view' => 'list']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('deals.data', 1)
        ->where('deals.data.0.id', $dealStaff1->id)
    );
});

test('authorized user can create a new deal and initial stage history is logged', function () {
    $admin = User::factory()->admin()->create();
    $client = Client::factory()->create();
    $contact = Contact::factory()->create(['client_id' => $client->id]);
    $staff = User::factory()->staff()->create();

    $this->actingAs($admin);

    $response = $this->post(route('deals.store'), [
        'title' => 'Khyber AI Integration Suite',
        'client_id' => $client->id,
        'contact_id' => $contact->id,
        'assigned_to' => $staff->id,
        'stage' => DealStage::Qualified->value,
        'priority' => DealPriority::High->value,
        'amount' => 45000.00,
        'currency' => 'USD',
        'expected_close_date' => now()->addMonth()->toDateString(),
        'notes' => 'Comprehensive technical PoC required.',
    ]);

    $deal = Deal::where('title', 'Khyber AI Integration Suite')->first();
    expect($deal)->not->toBeNull();
    expect($deal->amount)->toBe('45000.00');
    expect($deal->probability)->toBe(25); // Default probability for Qualified stage
    expect($deal->stage)->toBe(DealStage::Qualified);
    expect($deal->priority)->toBe(DealPriority::High);

    // Verify initial stage history was logged
    $history = DealStageHistory::where('deal_id', $deal->id)->first();
    expect($history)->not->toBeNull();
    expect($history->to_stage)->toBe(DealStage::Qualified->value);

    $response->assertRedirect(route('deals.show', $deal));
    $response->assertSessionHas('success');
});

test('creating deal validates required fields', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $response = $this->post(route('deals.store'), [
        'title' => '',
        'amount' => 'not-a-number',
        'stage' => 'invalid-stage',
        'priority' => 'invalid-priority',
    ]);

    $response->assertSessionHasErrors(['title', 'amount', 'stage', 'priority']);
});

test('deal can be viewed with relations and stage histories', function () {
    $admin = User::factory()->admin()->create();
    $client = Client::factory()->create(['name' => 'Apex Global']);
    $deal = Deal::factory()->create([
        'client_id' => $client->id,
        'title' => 'Enterprise SLA Deal',
    ]);

    $deal->stageHistories()->create([
        'user_id' => $admin->id,
        'from_stage' => 'new',
        'to_stage' => 'qualified',
        'notes' => 'Initial qualification call passed.',
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('deals.show', $deal));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('deals/show')
        ->where('deal.title', 'Enterprise SLA Deal')
        ->where('deal.client.name', 'Apex Global')
        ->has('deal.stage_histories', 1)
    );
});

test('deal can be updated with new fields', function () {
    $admin = User::factory()->admin()->create();
    $deal = Deal::factory()->create([
        'title' => 'Original Title',
        'amount' => 10000.00,
        'stage' => DealStage::New,
        'priority' => DealPriority::Low,
    ]);

    $this->actingAs($admin);

    $response = $this->put(route('deals.update', $deal), [
        'title' => 'Updated Proposal Deal',
        'amount' => 25000.00,
        'stage' => DealStage::Proposal->value,
        'priority' => DealPriority::High->value,
        'currency' => 'USD',
        'probability' => 60,
    ]);

    $deal->refresh();
    expect($deal->title)->toBe('Updated Proposal Deal');
    expect($deal->amount)->toBe('25000.00');
    expect($deal->stage)->toBe(DealStage::Proposal);
    expect($deal->priority)->toBe(DealPriority::High);
    expect($deal->probability)->toBe(60);

    $response->assertRedirect(route('deals.show', $deal));
    $response->assertSessionHas('success');
});

test('staff user cannot update deal assigned to another user', function () {
    $staff1 = User::factory()->staff()->create();
    $staff2 = User::factory()->staff()->create();

    $deal = Deal::factory()->create(['assigned_to' => $staff2->id]);

    $this->actingAs($staff1);

    $response = $this->put(route('deals.update', $deal), [
        'title' => 'Unauthorized update',
        'amount' => 5000,
        'stage' => DealStage::Proposal->value,
        'priority' => DealPriority::Medium->value,
    ]);

    $response->assertForbidden();
});

test('deal stage can be transitioned and logs audit history record', function () {
    $admin = User::factory()->admin()->create();
    $deal = Deal::factory()->create([
        'stage' => DealStage::Proposal,
        'probability' => 50,
    ]);

    $this->actingAs($admin);

    $response = $this->patch(route('deals.stage', $deal), [
        'stage' => DealStage::Negotiation->value,
        'notes' => 'Contract terms under legal review.',
    ]);

    $deal->refresh();
    expect($deal->stage)->toBe(DealStage::Negotiation);
    expect($deal->probability)->toBe(75);

    $history = DealStageHistory::where('deal_id', $deal->id)
        ->where('to_stage', DealStage::Negotiation->value)
        ->first();

    expect($history)->not->toBeNull();
    expect($history->from_stage)->toBe(DealStage::Proposal->value);
    expect($history->notes)->toBe('Contract terms under legal review.');
    expect($history->user_id)->toBe($admin->id);

    $response->assertRedirect();
    $response->assertSessionHas('success');
});

test('marking deal as won updates actual close date and probability to 100%', function () {
    $admin = User::factory()->admin()->create();
    $deal = Deal::factory()->create([
        'stage' => DealStage::Negotiation,
        'probability' => 75,
        'actual_close_date' => null,
    ]);

    $this->actingAs($admin);

    $this->patch(route('deals.stage', $deal), [
        'stage' => DealStage::Won->value,
    ]);

    $deal->refresh();
    expect($deal->stage)->toBe(DealStage::Won);
    expect($deal->probability)->toBe(100);
    expect($deal->actual_close_date)->not->toBeNull();
});

test('marking deal as lost requires and updates loss reason', function () {
    $admin = User::factory()->admin()->create();
    $deal = Deal::factory()->create([
        'stage' => DealStage::Proposal,
        'actual_close_date' => null,
    ]);

    $this->actingAs($admin);

    // Omitting loss_reason when stage is lost fails validation
    $response = $this->patch(route('deals.stage', $deal), [
        'stage' => DealStage::Lost->value,
        'loss_reason' => '',
    ]);
    $response->assertSessionHasErrors('loss_reason');

    // Providing loss_reason succeeds
    $response = $this->patch(route('deals.stage', $deal), [
        'stage' => DealStage::Lost->value,
        'loss_reason' => 'Client chose cheaper competitor',
    ]);

    $deal->refresh();
    expect($deal->stage)->toBe(DealStage::Lost);
    expect($deal->probability)->toBe(0);
    expect($deal->loss_reason)->toBe('Client chose cheaper competitor');
    expect($deal->actual_close_date)->not->toBeNull();
});

test('admin can archive and restore a deal', function () {
    $admin = User::factory()->admin()->create();
    $deal = Deal::factory()->create(['title' => 'To be archived']);

    $this->actingAs($admin);

    // Archive
    $response = $this->delete(route('deals.destroy', $deal));
    $response->assertRedirect(route('deals.index'));

    expect(Deal::find($deal->id))->toBeNull();
    expect(Deal::withTrashed()->find($deal->id))->not->toBeNull();

    // Restore
    $response = $this->post(route('deals.restore', $deal->id));
    $response->assertRedirect();

    expect(Deal::find($deal->id))->not->toBeNull();
});

test('staff user cannot archive a deal', function () {
    $staff = User::factory()->staff()->create();
    $deal = Deal::factory()->create(['assigned_to' => $staff->id]);

    $this->actingAs($staff);

    $response = $this->delete(route('deals.destroy', $deal));
    $response->assertForbidden();
});

test('deals can be searched by title and filtered by priority', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    Deal::query()->forceDelete();

    Deal::factory()->create([
        'title' => 'Target Redesign Project',
        'priority' => DealPriority::Urgent,
    ]);

    Deal::factory()->create([
        'title' => 'Other Marketing Service',
        'priority' => DealPriority::Low,
    ]);

    // Search query
    $response = $this->get(route('deals.index', ['view' => 'list', 'search' => 'Target Redesign']));
    $response->assertInertia(fn ($page) => $page
        ->has('deals.data', 1)
        ->where('deals.data.0.title', 'Target Redesign Project')
    );

    // Priority filter
    $response = $this->get(route('deals.index', ['view' => 'list', 'priority' => DealPriority::Urgent->value]));
    $response->assertInertia(fn ($page) => $page
        ->has('deals.data', 1)
        ->where('deals.data.0.title', 'Target Redesign Project')
    );
});
