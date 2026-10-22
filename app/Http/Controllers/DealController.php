<?php

namespace App\Http\Controllers;

use App\Enums\DealPriority;
use App\Enums\DealStage;
use App\Enums\UserRole;
use App\Http\Requests\StoreDealRequest;
use App\Http\Requests\UpdateDealRequest;
use App\Http\Requests\UpdateDealStageRequest;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DealController extends Controller
{
    /**
     * Display the sales pipeline (Kanban board or list view) with metrics and filters.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Deal::class);

        $currentUser = $request->user();
        $viewMode = $request->input('view', 'board'); // 'board' or 'list'

        $baseQuery = Deal::query()
            ->forUser($currentUser)
            ->search($request->input('search'))
            ->priority($request->input('priority'))
            ->assignee($request->filled('assigned_to') ? (int) $request->input('assigned_to') : null)
            ->client($request->filled('client_id') ? (int) $request->input('client_id') : null);

        // Calculate pipeline metrics
        $allUserDeals = (clone $baseQuery)->get();
        $openDeals = $allUserDeals->filter(fn (Deal $deal) => ! $deal->stage->isClosed());
        $wonDeals = $allUserDeals->filter(fn (Deal $deal) => $deal->stage->isWon());
        $lostDeals = $allUserDeals->filter(fn (Deal $deal) => $deal->stage->isLost());

        $totalPipelineValue = (float) $openDeals->sum('amount');
        $weightedPipelineValue = (float) $openDeals->sum(fn (Deal $d) => ((float) $d->amount * (int) $d->probability) / 100);
        $wonValue = (float) $wonDeals->sum('amount');
        $wonCount = $wonDeals->count();
        $lostCount = $lostDeals->count();
        $closedTotal = $wonCount + $lostCount;
        $winRate = $closedTotal > 0 ? round(($wonCount / $closedTotal) * 100, 1) : 0;

        // Stage-by-stage distribution summaries
        $stageDistribution = [];
        foreach (DealStage::cases() as $stageCase) {
            $stageDeals = $allUserDeals->where('stage', $stageCase);
            $stageDistribution[$stageCase->value] = [
                'count' => $stageDeals->count(),
                'total_amount' => (float) $stageDeals->sum('amount'),
                'weighted_amount' => (float) $stageDeals->sum(fn (Deal $d) => ((float) $d->amount * (int) $d->probability) / 100),
            ];
        }

        $metrics = [
            'total_pipeline_value' => round($totalPipelineValue, 2),
            'weighted_pipeline_value' => round($weightedPipelineValue, 2),
            'active_deals_count' => $openDeals->count(),
            'won_value' => round($wonValue, 2),
            'won_count' => $wonCount,
            'lost_count' => $lostCount,
            'win_rate' => $winRate,
            'stage_distribution' => $stageDistribution,
        ];

        // Format stages metadata for frontend
        $stages = array_map(fn (DealStage $stage) => [
            'value' => $stage->value,
            'label' => $stage->label(),
            'badge_class' => $stage->badgeClass(),
            'default_probability' => $stage->defaultProbability(),
            'is_closed' => $stage->isClosed(),
            'is_won' => $stage->isWon(),
            'is_lost' => $stage->isLost(),
        ], DealStage::cases());

        $priorities = array_map(fn (DealPriority $priority) => [
            'value' => $priority->value,
            'label' => $priority->label(),
            'badge_class' => $priority->badgeClass(),
        ], DealPriority::cases());

        // Prepare deals dataset based on view mode
        if ($viewMode === 'list') {
            $filteredQuery = (clone $baseQuery)
                ->stage($request->input('stage'))
                ->with(['client:id,name', 'contact:id,name,email', 'assignedTo:id,name,email']);

            // Sorting
            $sortField = $request->input('sort', 'created_at');
            $sortDirection = $request->input('direction', 'desc');
            $allowedSorts = ['title', 'amount', 'stage', 'priority', 'expected_close_date', 'created_at'];

            if (in_array($sortField, $allowedSorts, true)) {
                $filteredQuery->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
            } else {
                $filteredQuery->latest();
            }

            $deals = $filteredQuery->paginate(15)->withQueryString();
            $boardDeals = null;
        } else {
            // Board view: fetch all deals grouped by stage
            $dealsCollection = (clone $baseQuery)
                ->with(['client:id,name', 'contact:id,name,email', 'assignedTo:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->get();

            $boardDeals = [];
            foreach (DealStage::cases() as $stageCase) {
                $boardDeals[$stageCase->value] = $dealsCollection->where('stage', $stageCase)->values();
            }
            $deals = null;
        }

        // Dropdown selection datasets
        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $clients = Client::query()
            ->forUser($currentUser)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('deals/index', [
            'deals' => $deals,
            'boardDeals' => $boardDeals,
            'metrics' => $metrics,
            'stages' => $stages,
            'priorities' => $priorities,
            'teamMembers' => $teamMembers,
            'clients' => $clients,
            'viewMode' => $viewMode,
            'filters' => [
                'search' => $request->input('search', ''),
                'stage' => $request->input('stage', 'all'),
                'priority' => $request->input('priority', 'all'),
                'assigned_to' => $request->input('assigned_to', 'all'),
                'client_id' => $request->input('client_id', 'all'),
                'sort' => $request->input('sort', 'created_at'),
                'direction' => $request->input('direction', 'desc'),
                'view' => $viewMode,
            ],
        ]);
    }

    /**
     * Show the form for creating a new sales opportunity.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Deal::class);

        $currentUser = $request->user();

        $clients = Client::query()
            ->forUser($currentUser)
            ->with('contacts:id,client_id,name,title')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $leads = Lead::query()
            ->forUser($currentUser)
            ->where('status', '!=', 'disqualified')
            ->select('id', 'name', 'company', 'email', 'phone')
            ->orderBy('name')
            ->get();

        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $stages = array_map(fn (DealStage $stage) => [
            'value' => $stage->value,
            'label' => $stage->label(),
            'default_probability' => $stage->defaultProbability(),
        ], DealStage::cases());

        $priorities = array_map(fn (DealPriority $priority) => [
            'value' => $priority->value,
            'label' => $priority->label(),
        ], DealPriority::cases());

        return Inertia::render('deals/create', [
            'clients' => $clients,
            'leads' => $leads,
            'teamMembers' => $teamMembers,
            'stages' => $stages,
            'priorities' => $priorities,
            'defaultClientId' => $request->filled('client_id') ? (int) $request->input('client_id') : null,
            'defaultLeadId' => $request->filled('lead_id') ? (int) $request->input('lead_id') : null,
            'defaultAssigneeId' => $currentUser->isStaff() ? $currentUser->id : null,
        ]);
    }

    /**
     * Store a newly created deal in storage.
     */
    public function store(StoreDealRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $stage = DealStage::from($validated['stage']);

        $validated['created_by'] = $request->user()->id;

        // Default probability from stage if not provided
        if (! isset($validated['probability']) || $validated['probability'] === null) {
            $validated['probability'] = $stage->defaultProbability();
        }

        // If staff created the deal and assigned_to is omitted, default to creator
        if (empty($validated['assigned_to']) && $request->user()->isStaff()) {
            $validated['assigned_to'] = $request->user()->id;
        }

        $validated['currency'] = $validated['currency'] ?? 'USD';
        $validated['stage_updated_at'] = now();

        if ($stage === DealStage::Won || $stage === DealStage::Lost) {
            $validated['actual_close_date'] = now()->toDateString();
        }

        $deal = Deal::create($validated);

        // Record initial history transition
        $deal->stageHistories()->create([
            'user_id' => $request->user()->id,
            'from_stage' => null,
            'to_stage' => $stage->value,
            'notes' => 'Opportunity created in stage: '.$stage->label(),
            'created_at' => now(),
        ]);

        return redirect()->route('deals.show', $deal)
            ->with('success', 'Deal created successfully.');
    }

    /**
     * Display the specified sales deal.
     */
    public function show(Request $request, Deal $deal): Response
    {
        Gate::authorize('view', $deal);

        $deal->load([
            'client:id,name,email,phone,website,industry',
            'contact:id,name,email,phone,title',
            'lead:id,name,company,email,phone,status',
            'assignedTo:id,name,email,role',
            'creator:id,name,email',
            'stageHistories' => fn ($query) => $query->with('user:id,name,email')->latest('created_at'),
        ]);

        $stages = array_map(fn (DealStage $stage) => [
            'value' => $stage->value,
            'label' => $stage->label(),
            'badge_class' => $stage->badgeClass(),
            'default_probability' => $stage->defaultProbability(),
            'is_closed' => $stage->isClosed(),
            'is_won' => $stage->isWon(),
            'is_lost' => $stage->isLost(),
        ], DealStage::cases());

        return Inertia::render('deals/show', [
            'deal' => $deal,
            'stages' => $stages,
            'can' => [
                'update' => $request->user()->can('update', $deal),
                'delete' => $request->user()->can('delete', $deal),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified deal.
     */
    public function edit(Request $request, Deal $deal): Response
    {
        Gate::authorize('update', $deal);

        $currentUser = $request->user();

        $clients = Client::query()
            ->forUser($currentUser)
            ->with('contacts:id,client_id,name,title')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $leads = Lead::query()
            ->forUser($currentUser)
            ->select('id', 'name', 'company')
            ->orderBy('name')
            ->get();

        $teamMembers = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Manager, UserRole::Staff])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        $stages = array_map(fn (DealStage $stage) => [
            'value' => $stage->value,
            'label' => $stage->label(),
            'default_probability' => $stage->defaultProbability(),
        ], DealStage::cases());

        $priorities = array_map(fn (DealPriority $priority) => [
            'value' => $priority->value,
            'label' => $priority->label(),
        ], DealPriority::cases());

        return Inertia::render('deals/edit', [
            'deal' => $deal->load(['client', 'contact']),
            'clients' => $clients,
            'leads' => $leads,
            'teamMembers' => $teamMembers,
            'stages' => $stages,
            'priorities' => $priorities,
        ]);
    }

    /**
     * Update the specified deal in storage.
     */
    public function update(UpdateDealRequest $request, Deal $deal): RedirectResponse
    {
        $validated = $request->validated();
        $newStage = DealStage::from($validated['stage']);
        $previousStage = $deal->stage;

        // If stage changed, transition cleanly with history
        if ($previousStage !== $newStage) {
            $deal->transitionToStage(
                $newStage,
                $request->user(),
                $validated['loss_reason'] ?? null,
                $validated['notes'] ?? null
            );
        }

        // Update remaining fields
        $deal->update([
            'title' => $validated['title'],
            'client_id' => $validated['client_id'] ?? null,
            'lead_id' => $validated['lead_id'] ?? null,
            'contact_id' => $validated['contact_id'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'priority' => DealPriority::from($validated['priority']),
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'USD',
            'probability' => $validated['probability'] ?? $newStage->defaultProbability(),
            'expected_close_date' => $validated['expected_close_date'] ?? null,
            'loss_reason' => $validated['loss_reason'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('deals.show', $deal)
            ->with('success', 'Deal updated successfully.');
    }

    /**
     * Fast stage transition endpoint (Kanban drag-and-drop or quick stage move).
     */
    public function updateStage(UpdateDealStageRequest $request, Deal $deal): RedirectResponse
    {
        $validated = $request->validated();
        $targetStage = DealStage::from($validated['stage']);

        $deal->transitionToStage(
            $targetStage,
            $request->user(),
            $validated['loss_reason'] ?? null,
            $validated['notes'] ?? null
        );

        return redirect()->back()
            ->with('success', "Deal moved to {$targetStage->label()} stage successfully.");
    }

    /**
     * Soft-delete / archive the specified deal.
     */
    public function destroy(Request $request, Deal $deal): RedirectResponse
    {
        Gate::authorize('delete', $deal);

        $deal->delete();

        return redirect()->route('deals.index')
            ->with('success', 'Deal archived successfully.');
    }

    /**
     * Restore the specified archived deal.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $deal = Deal::withTrashed()->findOrFail($id);

        Gate::authorize('restore', $deal);

        $deal->restore();

        return redirect()->back()
            ->with('success', 'Deal restored successfully.');
    }
}
