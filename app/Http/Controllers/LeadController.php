<?php

namespace App\Http\Controllers;

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a paginated listing of leads with filters, search, and metrics.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Lead::class);

        $currentUser = $request->user();

        // Base query with server-side visibility enforcement
        $view = $request->query('view', 'active');
        $query = Lead::query();

        if ($view === 'archived') {
            $query->onlyTrashed();
        } elseif ($view === 'all') {
            $query->withTrashed();
        }

        // Apply role-based visibility scoping
        $query->forUser($currentUser);

        // Search by name, company, email, or phone
        if ($search = $request->query('search')) {
            $query->search($search);
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->status($status);
        }

        // Filter by source
        if ($source = $request->query('source')) {
            $query->source($source);
        }

        // Filter by priority
        if ($priority = $request->query('priority')) {
            $query->priority($priority);
        }

        // Filter by assigned user
        if ($assignedTo = $request->query('assigned_to')) {
            if ($assignedTo === 'unassigned') {
                $query->whereNull('assigned_to');
            } elseif (is_numeric($assignedTo)) {
                $query->where('assigned_to', (int) $assignedTo);
            }
        }

        // Sorting
        $allowedSorts = ['name', 'company', 'estimated_value', 'status', 'priority', 'created_at'];
        $sortField = in_array($request->query('sort'), $allowedSorts, true)
            ? $request->query('sort')
            : 'created_at';
        $sortDirection = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $leads = $query->with(['assignedTo:id,name,email', 'creator:id,name'])
            ->orderBy($sortField, $sortDirection)
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Lead $lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'company' => $lead->company,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'title' => $lead->title,
                'source' => $lead->source->value,
                'source_label' => $lead->source->label(),
                'status' => $lead->status->value,
                'status_label' => $lead->status->label(),
                'status_badge_class' => $lead->status->badgeClass(),
                'priority' => $lead->priority->value,
                'priority_label' => $lead->priority->label(),
                'priority_badge_class' => $lead->priority->badgeClass(),
                'estimated_value' => $lead->estimated_value ? (float) $lead->estimated_value : null,
                'currency' => $lead->currency,
                'formatted_value' => $lead->estimated_value !== null
                    ? '$'.number_format((float) $lead->estimated_value, 2)
                    : null,
                'assigned_to' => $lead->assignedTo ? [
                    'id' => $lead->assignedTo->id,
                    'name' => $lead->assignedTo->name,
                    'email' => $lead->assignedTo->email,
                ] : null,
                'created_at' => $lead->created_at?->toFormattedDateString(),
                'is_archived' => $lead->trashed(),
                'is_convertible' => $lead->status->isConvertible(),
                'can' => [
                    'view' => $currentUser->can('view', $lead),
                    'update' => $currentUser->can('update', $lead),
                    'delete' => $currentUser->can('delete', $lead),
                    'restore' => $currentUser->can('restore', $lead),
                    'convert' => $currentUser->can('convert', $lead),
                ],
            ]);

        // Calculate scoped pipeline metrics
        $metricsQuery = Lead::query()->forUser($currentUser);
        $totalLeads = (clone $metricsQuery)->count();
        $qualifiedCount = (clone $metricsQuery)->where('status', LeadStatus::Qualified->value)->count();
        $convertedCount = (clone $metricsQuery)->where('status', LeadStatus::Converted->value)->count();
        $newThisWeekCount = (clone $metricsQuery)
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();
        $totalPipelineValue = (clone $metricsQuery)
            ->whereNotIn('status', [LeadStatus::Converted->value, LeadStatus::Lost->value, LeadStatus::Unqualified->value])
            ->sum('estimated_value');

        $metrics = [
            'total' => $totalLeads,
            'qualified' => $qualifiedCount,
            'converted' => $convertedCount,
            'new_this_week' => $newThisWeekCount,
            'pipeline_value' => (float) $totalPipelineValue,
            'formatted_pipeline_value' => '$'.number_format((float) $totalPipelineValue, 2),
            'conversion_rate' => $totalLeads > 0 ? round(($convertedCount / $totalLeads) * 100, 1) : 0,
        ];

        // Team members assignable to leads
        $teamMembers = User::whereIn('role', [UserRole::Admin->value, UserRole::Manager->value, UserRole::Staff->value])
            ->where('status', UserStatus::Active->value)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->label(),
            ]);

        return Inertia::render('leads/index', [
            'leads' => $leads,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', ''),
                'source' => $request->query('source', ''),
                'priority' => $request->query('priority', ''),
                'assigned_to' => $request->query('assigned_to', ''),
                'view' => $view,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
            'metrics' => $metrics,
            'statuses' => array_map(fn (LeadStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'badgeClass' => $s->badgeClass(),
            ], LeadStatus::cases()),
            'sources' => array_map(fn (LeadSource $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LeadSource::cases()),
            'priorities' => array_map(fn (LeadPriority $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'badgeClass' => $p->badgeClass(),
            ], LeadPriority::cases()),
            'assignees' => $teamMembers,
            'canCreate' => $currentUser->can('create', Lead::class),
        ]);
    }

    /**
     * Show the form for creating a new lead.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Lead::class);

        $teamMembers = User::whereIn('role', [UserRole::Admin->value, UserRole::Manager->value, UserRole::Staff->value])
            ->where('status', UserStatus::Active->value)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->label(),
            ]);

        return Inertia::render('leads/create', [
            'statuses' => array_map(fn (LeadStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LeadStatus::cases()),
            'sources' => array_map(fn (LeadSource $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LeadSource::cases()),
            'priorities' => array_map(fn (LeadPriority $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ], LeadPriority::cases()),
            'assignees' => $teamMembers,
            'defaultAssigneeId' => $request->user()->isStaff() ? $request->user()->id : null,
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $validated['created_by'] = $request->user()->id;

        // If staff created the lead and assigned_to is omitted, default to the staff member
        if (empty($validated['assigned_to']) && $request->user()->isStaff()) {
            $validated['assigned_to'] = $request->user()->id;
        }

        $validated['currency'] = $validated['currency'] ?? 'USD';

        $lead = Lead::create($validated);

        return redirect()->route('leads.show', $lead)
            ->with('success', 'Lead created successfully.');
    }

    /**
     * Display the specified lead.
     */
    public function show(Request $request, Lead $lead): Response
    {
        Gate::authorize('view', $lead);

        $currentUser = $request->user();
        $lead->load(['assignedTo:id,name,email,role', 'creator:id,name,email']);

        return Inertia::render('leads/show', [
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'company' => $lead->company,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'title' => $lead->title,
                'source' => $lead->source->value,
                'source_label' => $lead->source->label(),
                'status' => $lead->status->value,
                'status_label' => $lead->status->label(),
                'status_badge_class' => $lead->status->badgeClass(),
                'priority' => $lead->priority->value,
                'priority_label' => $lead->priority->label(),
                'priority_badge_class' => $lead->priority->badgeClass(),
                'estimated_value' => $lead->estimated_value ? (float) $lead->estimated_value : null,
                'currency' => $lead->currency,
                'formatted_value' => $lead->estimated_value !== null
                    ? '$'.number_format((float) $lead->estimated_value, 2)
                    : null,
                'notes' => $lead->notes,
                'lost_reason' => $lead->lost_reason,
                'converted_at' => $lead->converted_at?->toFormattedDateString(),
                'is_converted' => $lead->isConverted(),
                'is_convertible' => $lead->status->isConvertible(),
                'assigned_to' => $lead->assignedTo ? [
                    'id' => $lead->assignedTo->id,
                    'name' => $lead->assignedTo->name,
                    'email' => $lead->assignedTo->email,
                    'role' => $lead->assignedTo->role->label(),
                ] : null,
                'creator' => $lead->creator ? [
                    'id' => $lead->creator->id,
                    'name' => $lead->creator->name,
                    'email' => $lead->creator->email,
                ] : null,
                'created_at' => $lead->created_at?->toFormattedDateString(),
                'created_at_relative' => $lead->created_at?->diffForHumans(),
                'updated_at' => $lead->updated_at?->diffForHumans(),
                'is_archived' => $lead->trashed(),
                'can' => [
                    'update' => $currentUser->can('update', $lead),
                    'delete' => $currentUser->can('delete', $lead),
                    'restore' => $currentUser->can('restore', $lead),
                    'convert' => $currentUser->can('convert', $lead),
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified lead.
     */
    public function edit(Request $request, Lead $lead): Response
    {
        Gate::authorize('update', $lead);

        $teamMembers = User::whereIn('role', [UserRole::Admin->value, UserRole::Manager->value, UserRole::Staff->value])
            ->where('status', UserStatus::Active->value)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->label(),
            ]);

        return Inertia::render('leads/edit', [
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'company' => $lead->company ?? '',
                'email' => $lead->email ?? '',
                'phone' => $lead->phone ?? '',
                'title' => $lead->title ?? '',
                'source' => $lead->source->value,
                'status' => $lead->status->value,
                'priority' => $lead->priority->value,
                'estimated_value' => $lead->estimated_value !== null ? (float) $lead->estimated_value : '',
                'currency' => $lead->currency ?? 'USD',
                'assigned_to' => $lead->assigned_to,
                'notes' => $lead->notes ?? '',
                'lost_reason' => $lead->lost_reason ?? '',
            ],
            'statuses' => array_map(fn (LeadStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LeadStatus::cases()),
            'sources' => array_map(fn (LeadSource $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LeadSource::cases()),
            'priorities' => array_map(fn (LeadPriority $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ], LeadPriority::cases()),
            'assignees' => $teamMembers,
        ]);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validated();

        // Clear lost reason if status is not lost
        if ($validated['status'] !== LeadStatus::Lost->value) {
            $validated['lost_reason'] = null;
        }

        // Set converted_at timestamp if changed to converted
        if ($validated['status'] === LeadStatus::Converted->value && ! $lead->converted_at) {
            $validated['converted_at'] = now();
        }

        $lead->update($validated);

        return redirect()->route('leads.show', $lead)
            ->with('success', 'Lead updated successfully.');
    }

    /**
     * Archive (soft-delete) the specified lead.
     */
    public function destroy(Lead $lead): RedirectResponse
    {
        Gate::authorize('delete', $lead);

        $lead->delete();

        return redirect()->route('leads.index')
            ->with('success', 'Lead archived successfully.');
    }

    /**
     * Restore the specified archived lead.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $lead = Lead::withTrashed()->findOrFail($id);

        Gate::authorize('restore', $lead);

        $lead->restore();

        return redirect()->back()
            ->with('success', 'Lead restored successfully.');
    }

    /**
     * Convert qualified lead to client (Integration hook for Module 6).
     */
    public function convert(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('convert', $lead);

        if ($lead->isConverted()) {
            return redirect()->back()
                ->with('error', 'This lead has already been converted.');
        }

        $lead->markAsConverted();

        return redirect()->back()
            ->with('success', 'Lead successfully converted! Client record integration ready for Module 6.');
    }
}
