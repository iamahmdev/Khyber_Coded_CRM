<?php

namespace App\Http\Controllers;

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use App\Enums\UserRole;
use App\Http\Requests\CompleteActivityRequest;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of follow-up activities with metrics and filters.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Activity::class);

        $currentUser = $request->user();
        $tab = $request->input('tab', 'upcoming'); // upcoming, today, overdue, completed, all

        $baseQuery = Activity::query()
            ->forUser($currentUser)
            ->search($request->input('search'))
            ->type($request->input('type'))
            ->priority($request->input('priority'))
            ->assignee($request->filled('assigned_to') ? (int) $request->input('assigned_to') : null);

        // Precalculate activity metrics for user's scope
        $metricScope = Activity::query()->forUser($currentUser);
        $pendingCount = (clone $metricScope)->pending()->count();
        $overdueCount = (clone $metricScope)->overdue()->count();
        $todayCount = (clone $metricScope)->pending()->today()->count();
        $completedCount = (clone $metricScope)->completed()->where('completed_at', '>=', now()->startOfMonth())->count();

        $metrics = [
            'pending_count' => $pendingCount,
            'overdue_count' => $overdueCount,
            'today_count' => $todayCount,
            'completed_count' => $completedCount,
        ];

        // Apply Tab filters
        $filteredQuery = (clone $baseQuery);
        if ($tab === 'today') {
            $filteredQuery->pending()->today()->orderBy('due_at', 'asc');
        } elseif ($tab === 'overdue') {
            $filteredQuery->overdue()->orderBy('due_at', 'asc');
        } elseif ($tab === 'completed') {
            $filteredQuery->completed()->latest('completed_at');
        } elseif ($tab === 'upcoming') {
            $filteredQuery->pending()->orderBy('due_at', 'asc');
        } else {
            // 'all'
            $filteredQuery->latest('due_at');
        }

        $activities = $filteredQuery
            ->with([
                'client:id,name',
                'lead:id,name,company',
                'deal:id,title',
                'assignedTo:id,name,email',
            ])
            ->paginate(15)
            ->through(fn (Activity $act) => [
                'id' => $act->id,
                'title' => $act->title,
                'type' => $act->type->value,
                'type_label' => $act->type->label(),
                'type_badge_class' => $act->type->badgeClass(),
                'type_icon' => $act->type->iconName(),
                'status' => $act->status->value,
                'status_label' => $act->status->label(),
                'status_badge_class' => $act->status->badgeClass(),
                'priority' => $act->priority->value,
                'priority_label' => $act->priority->label(),
                'priority_badge_class' => $act->priority->badgeClass(),
                'due_at' => $act->due_at->toIso8601String(),
                'due_at_formatted' => $act->due_at->format('M d, Y g:i A'),
                'is_overdue' => $act->isOverdue(),
                'completed_at' => $act->completed_at?->format('M d, Y g:i A'),
                'location' => $act->location,
                'notes' => $act->notes,
                'outcome' => $act->outcome,
                'client' => $act->client,
                'lead' => $act->lead,
                'deal' => $act->deal,
                'assigned_to' => $act->assignedTo,
                'can' => [
                    'view' => $currentUser->can('view', $act),
                    'update' => $currentUser->can('update', $act),
                    'complete' => $currentUser->can('complete', $act),
                    'delete' => $currentUser->can('delete', $act),
                ],
            ])
            ->withQueryString();

        // Dropdown selection datasets
        $types = array_map(fn (ActivityType $t) => [
            'value' => $t->value,
            'label' => $t->label(),
            'badge_class' => $t->badgeClass(),
            'icon' => $t->iconName(),
        ], ActivityType::cases());

        $priorities = array_map(fn (ActivityPriority $p) => [
            'value' => $p->value,
            'label' => $p->label(),
            'badge_class' => $p->badgeClass(),
        ], ActivityPriority::cases());

        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('activities/index', [
            'activities' => $activities,
            'metrics' => $metrics,
            'types' => $types,
            'priorities' => $priorities,
            'teamMembers' => $teamMembers,
            'activeTab' => $tab,
            'filters' => [
                'search' => $request->input('search', ''),
                'type' => $request->input('type', 'all'),
                'priority' => $request->input('priority', 'all'),
                'assigned_to' => $request->input('assigned_to', 'all'),
                'tab' => $tab,
            ],
        ]);
    }

    /**
     * Show the form for creating a new follow-up activity.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Activity::class);

        $currentUser = $request->user();

        $clients = Client::query()->forUser($currentUser)->select('id', 'name')->orderBy('name')->get();
        $leads = Lead::query()->forUser($currentUser)->select('id', 'name', 'company')->orderBy('name')->get();
        $deals = Deal::query()->forUser($currentUser)->select('id', 'title')->orderBy('title')->get();

        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $types = array_map(fn (ActivityType $t) => [
            'value' => $t->value,
            'label' => $t->label(),
        ], ActivityType::cases());

        $priorities = array_map(fn (ActivityPriority $p) => [
            'value' => $p->value,
            'label' => $p->label(),
        ], ActivityPriority::cases());

        return Inertia::render('activities/create', [
            'clients' => $clients,
            'leads' => $leads,
            'deals' => $deals,
            'teamMembers' => $teamMembers,
            'types' => $types,
            'priorities' => $priorities,
            'defaultClientId' => $request->filled('client_id') ? (int) $request->input('client_id') : null,
            'defaultLeadId' => $request->filled('lead_id') ? (int) $request->input('lead_id') : null,
            'defaultDealId' => $request->filled('deal_id') ? (int) $request->input('deal_id') : null,
            'defaultAssigneeId' => $currentUser->isStaff() ? $currentUser->id : null,
        ]);
    }

    /**
     * Store a newly created follow-up activity in storage.
     */
    public function store(StoreActivityRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $validated['created_by'] = $request->user()->id;

        if (empty($validated['assigned_to']) && $request->user()->isStaff()) {
            $validated['assigned_to'] = $request->user()->id;
        }

        if (empty($validated['status'])) {
            $validated['status'] = ActivityStatus::Pending;
        }

        $activity = Activity::create($validated);

        return redirect()->route('activities.index')
            ->with('success', 'Follow-up activity scheduled successfully.');
    }

    /**
     * Display the specified activity details.
     */
    public function show(Request $request, Activity $activity): Response
    {
        Gate::authorize('view', $activity);

        $activity->load([
            'client:id,name,email,phone,website',
            'lead:id,name,company,email,phone',
            'deal:id,title,stage,amount',
            'assignedTo:id,name,email,role',
            'creator:id,name,email',
        ]);

        return Inertia::render('activities/show', [
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'type' => $activity->type->value,
                'type_label' => $activity->type->label(),
                'type_badge_class' => $activity->type->badgeClass(),
                'status' => $activity->status->value,
                'status_label' => $activity->status->label(),
                'status_badge_class' => $activity->status->badgeClass(),
                'priority' => $activity->priority->value,
                'priority_label' => $activity->priority->label(),
                'priority_badge_class' => $activity->priority->badgeClass(),
                'due_at' => $activity->due_at->toIso8601String(),
                'due_at_formatted' => $activity->due_at->format('M d, Y g:i A'),
                'is_overdue' => $activity->isOverdue(),
                'completed_at' => $activity->completed_at?->format('M d, Y g:i A'),
                'location' => $activity->location,
                'notes' => $activity->notes,
                'outcome' => $activity->outcome,
                'created_at' => $activity->created_at->format('M d, Y g:i A'),
                'client' => $activity->client,
                'lead' => $activity->lead,
                'deal' => $activity->deal,
                'assigned_to' => $activity->assignedTo,
                'creator' => $activity->creator,
            ],
            'can' => [
                'update' => $request->user()->can('update', $activity),
                'delete' => $request->user()->can('delete', $activity),
            ],
        ]);
    }

    /**
     * Show the form for editing the activity.
     */
    public function edit(Request $request, Activity $activity): Response
    {
        Gate::authorize('update', $activity);

        $currentUser = $request->user();

        $clients = Client::query()->forUser($currentUser)->select('id', 'name')->orderBy('name')->get();
        $leads = Lead::query()->forUser($currentUser)->select('id', 'name', 'company')->orderBy('name')->get();
        $deals = Deal::query()->forUser($currentUser)->select('id', 'title')->orderBy('title')->get();

        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $types = array_map(fn (ActivityType $t) => [
            'value' => $t->value,
            'label' => $t->label(),
        ], ActivityType::cases());

        $priorities = array_map(fn (ActivityPriority $p) => [
            'value' => $p->value,
            'label' => $p->label(),
        ], ActivityPriority::cases());

        $statuses = array_map(fn (ActivityStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], ActivityStatus::cases());

        return Inertia::render('activities/edit', [
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'type' => $activity->type->value,
                'status' => $activity->status->value,
                'priority' => $activity->priority->value,
                'due_at' => $activity->due_at->format('Y-m-d\TH:i'),
                'client_id' => $activity->client_id,
                'lead_id' => $activity->lead_id,
                'deal_id' => $activity->deal_id,
                'assigned_to' => $activity->assigned_to,
                'location' => $activity->location,
                'notes' => $activity->notes,
                'outcome' => $activity->outcome,
            ],
            'clients' => $clients,
            'leads' => $leads,
            'deals' => $deals,
            'teamMembers' => $teamMembers,
            'types' => $types,
            'priorities' => $priorities,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified activity in storage.
     */
    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validated();
        $newStatus = ActivityStatus::from($validated['status']);

        if ($newStatus === ActivityStatus::Completed && ! $activity->completed_at) {
            $validated['completed_at'] = now();
        } elseif ($newStatus !== ActivityStatus::Completed) {
            $validated['completed_at'] = null;
        }

        $activity->update($validated);

        return redirect()->route('activities.show', $activity)
            ->with('success', 'Activity updated successfully.');
    }

    /**
     * Fast toggle for activity completion status.
     */
    public function complete(CompleteActivityRequest $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validated();
        $targetStatus = ActivityStatus::from($validated['status']);

        if ($targetStatus === ActivityStatus::Completed) {
            $activity->markCompleted($validated['outcome'] ?? null);
            $msg = 'Activity marked as completed.';
        } elseif ($targetStatus === ActivityStatus::Cancelled) {
            $activity->markCancelled($validated['outcome'] ?? null);
            $msg = 'Activity cancelled.';
        } else {
            $activity->update([
                'status' => ActivityStatus::Pending,
                'completed_at' => null,
            ]);
            $msg = 'Activity marked as pending.';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Remove the specified activity from storage.
     */
    public function destroy(Request $request, Activity $activity): RedirectResponse
    {
        Gate::authorize('delete', $activity);

        $activity->delete();

        return redirect()->route('activities.index')
            ->with('success', 'Activity deleted successfully.');
    }

    /**
     * Restore the specified soft-deleted activity.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $activity = Activity::withTrashed()->findOrFail($id);

        Gate::authorize('restore', $activity);

        $activity->restore();

        return redirect()->back()
            ->with('success', 'Activity restored successfully.');
    }
}
