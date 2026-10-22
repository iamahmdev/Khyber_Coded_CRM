<?php

namespace App\Http\Controllers;

use App\Enums\ClientStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of clients with filtering, search, and metrics.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Client::class);

        $currentUser = $request->user();
        $view = $request->query('view', 'active');
        $query = Client::query();

        if ($view === 'archived') {
            $query->onlyTrashed();
        } elseif ($view === 'all') {
            $query->withTrashed();
        }

        $query->forUser($currentUser);

        if ($search = $request->query('search')) {
            $query->search($search);
        }

        if ($status = $request->query('status')) {
            $query->status($status);
        }

        if ($industry = $request->query('industry')) {
            $query->industry($industry);
        }

        if ($accountManager = $request->query('account_manager')) {
            if ($accountManager === 'unassigned') {
                $query->whereNull('account_manager_id');
            } elseif (is_numeric($accountManager)) {
                $query->where('account_manager_id', (int) $accountManager);
            }
        }

        $allowedSorts = ['name', 'industry', 'city', 'status', 'created_at'];
        $sortField = in_array($request->query('sort'), $allowedSorts, true)
            ? $request->query('sort')
            : 'created_at';
        $sortDirection = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $clients = $query->with([
            'accountManager:id,name,email',
            'primaryContact:id,client_id,name,email,phone,title',
        ])
            ->withCount('contacts')
            ->orderBy($sortField, $sortDirection)
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Client $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'industry' => $client->industry,
                'website' => $client->website,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'country' => $client->country,
                'status' => $client->status->value,
                'status_label' => $client->status->label(),
                'status_badge_class' => $client->status->badgeClass(),
                'contacts_count' => $client->contacts_count,
                'primary_contact' => $client->primaryContact ? [
                    'id' => $client->primaryContact->id,
                    'name' => $client->primaryContact->name,
                    'email' => $client->primaryContact->email,
                    'phone' => $client->primaryContact->phone,
                    'title' => $client->primaryContact->title,
                ] : null,
                'account_manager' => $client->accountManager ? [
                    'id' => $client->accountManager->id,
                    'name' => $client->accountManager->name,
                    'email' => $client->accountManager->email,
                ] : null,
                'is_from_lead' => $client->source_lead_id !== null,
                'created_at' => $client->created_at?->toFormattedDateString(),
                'is_archived' => $client->trashed(),
                'can' => [
                    'view' => $currentUser->can('view', $client),
                    'update' => $currentUser->can('update', $client),
                    'delete' => $currentUser->can('delete', $client),
                    'restore' => $currentUser->can('restore', $client),
                ],
            ]);

        // Scoped metrics
        $metricsQuery = Client::query()->forUser($currentUser);
        $totalClients = (clone $metricsQuery)->count();
        $activeClients = (clone $metricsQuery)->where('status', ClientStatus::Active->value)->count();
        $fromLeadsCount = (clone $metricsQuery)->whereNotNull('source_lead_id')->count();
        $newThisMonth = (clone $metricsQuery)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        $metrics = [
            'total' => $totalClients,
            'active' => $activeClients,
            'new_this_month' => $newThisMonth,
            'from_leads' => $fromLeadsCount,
            'total_contacts' => Contact::whereHas('client', fn ($q) => $q->forUser($currentUser))->count(),
        ];

        // Industries available for filter
        $industries = [
            'Technology & Software',
            'Healthcare & Pharma',
            'E-Commerce & Retail',
            'Logistics & Supply Chain',
            'Financial Services',
            'Legal & Advisory',
            'Real Estate',
            'Digital Media',
            'Education & Training',
            'Manufacturing',
            'Other',
        ];

        // Assignable team members
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

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', ''),
                'industry' => $request->query('industry', ''),
                'account_manager' => $request->query('account_manager', ''),
                'view' => $view,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
            'metrics' => $metrics,
            'statuses' => array_map(fn (ClientStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'badgeClass' => $s->badgeClass(),
            ], ClientStatus::cases()),
            'industries' => $industries,
            'teamMembers' => $teamMembers,
            'canCreate' => $currentUser->can('create', Client::class),
        ]);
    }

    /**
     * Show the form for creating a new client.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Client::class);

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

        $industries = [
            'Technology & Software',
            'Healthcare & Pharma',
            'E-Commerce & Retail',
            'Logistics & Supply Chain',
            'Financial Services',
            'Legal & Advisory',
            'Real Estate',
            'Digital Media',
            'Education & Training',
            'Manufacturing',
            'Other',
        ];

        return Inertia::render('clients/create', [
            'statuses' => array_map(fn (ClientStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], ClientStatus::cases()),
            'industries' => $industries,
            'teamMembers' => $teamMembers,
            'defaultAccountManagerId' => $request->user()->isStaff() ? $request->user()->id : null,
        ]);
    }

    /**
     * Store a newly created client and optional primary contact.
     */
    public function store(StoreClientRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $clientData = [
            'name' => $validated['name'],
            'industry' => $validated['industry'] ?? null,
            'website' => $validated['website'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => $validated['country'] ?? 'Pakistan',
            'status' => $validated['status'],
            'account_manager_id' => $validated['account_manager_id'] ?? null,
            'created_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ];

        if (empty($clientData['account_manager_id']) && $request->user()->isStaff()) {
            $clientData['account_manager_id'] = $request->user()->id;
        }

        $client = DB::transaction(function () use ($clientData, $validated) {
            $client = Client::create($clientData);

            // Create initial primary contact if provided
            if (! empty($validated['primary_contact_name'])) {
                Contact::create([
                    'client_id' => $client->id,
                    'name' => $validated['primary_contact_name'],
                    'email' => $validated['primary_contact_email'] ?? null,
                    'phone' => $validated['primary_contact_phone'] ?? null,
                    'title' => $validated['primary_contact_title'] ?? null,
                    'is_primary' => true,
                ]);
            }

            return $client;
        });

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client created successfully.');
    }

    /**
     * Display the specified client with contact persons.
     */
    public function show(Request $request, Client $client): Response
    {
        Gate::authorize('view', $client);

        $currentUser = $request->user();
        $client->load([
            'accountManager:id,name,email,role',
            'creator:id,name,email',
            'sourceLead:id,name,company,email,status',
            'contacts' => fn ($q) => $q->orderByDesc('is_primary')->orderBy('name'),
        ]);

        return Inertia::render('clients/show', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'industry' => $client->industry,
                'website' => $client->website,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address,
                'city' => $client->city,
                'state' => $client->state,
                'postal_code' => $client->postal_code,
                'country' => $client->country,
                'status' => $client->status->value,
                'status_label' => $client->status->label(),
                'status_badge_class' => $client->status->badgeClass(),
                'notes' => $client->notes,
                'account_manager' => $client->accountManager ? [
                    'id' => $client->accountManager->id,
                    'name' => $client->accountManager->name,
                    'email' => $client->accountManager->email,
                    'role' => $client->accountManager->role->label(),
                ] : null,
                'creator' => $client->creator ? [
                    'id' => $client->creator->id,
                    'name' => $client->creator->name,
                    'email' => $client->creator->email,
                ] : null,
                'source_lead' => $client->sourceLead ? [
                    'id' => $client->sourceLead->id,
                    'name' => $client->sourceLead->name,
                    'company' => $client->sourceLead->company,
                    'email' => $client->sourceLead->email,
                    'status_label' => $client->sourceLead->status->label(),
                ] : null,
                'contacts' => $client->contacts->map(fn (Contact $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email,
                    'phone' => $c->phone,
                    'title' => $c->title,
                    'department' => $c->department,
                    'is_primary' => $c->is_primary,
                    'notes' => $c->notes,
                    'created_at' => $c->created_at?->toFormattedDateString(),
                ]),
                'created_at' => $client->created_at?->toFormattedDateString(),
                'updated_at' => $client->updated_at?->diffForHumans(),
                'is_archived' => $client->trashed(),
                'can' => [
                    'update' => $currentUser->can('update', $client),
                    'delete' => $currentUser->can('delete', $client),
                    'restore' => $currentUser->can('restore', $client),
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the client.
     */
    public function edit(Request $request, Client $client): Response
    {
        Gate::authorize('update', $client);

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

        $industries = [
            'Technology & Software',
            'Healthcare & Pharma',
            'E-Commerce & Retail',
            'Logistics & Supply Chain',
            'Financial Services',
            'Legal & Advisory',
            'Real Estate',
            'Digital Media',
            'Education & Training',
            'Manufacturing',
            'Other',
        ];

        return Inertia::render('clients/edit', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'industry' => $client->industry ?? '',
                'website' => $client->website ?? '',
                'email' => $client->email ?? '',
                'phone' => $client->phone ?? '',
                'address' => $client->address ?? '',
                'city' => $client->city ?? '',
                'state' => $client->state ?? '',
                'postal_code' => $client->postal_code ?? '',
                'country' => $client->country ?? 'Pakistan',
                'status' => $client->status->value,
                'account_manager_id' => $client->account_manager_id,
                'notes' => $client->notes ?? '',
            ],
            'statuses' => array_map(fn (ClientStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], ClientStatus::cases()),
            'industries' => $industries,
            'teamMembers' => $teamMembers,
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();

        $client->update($validated);

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client updated successfully.');
    }

    /**
     * Archive/soft-delete the client.
     */
    public function destroy(Client $client): RedirectResponse
    {
        Gate::authorize('delete', $client);

        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client archived successfully.');
    }

    /**
     * Restore the archived client.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $client = Client::withTrashed()->findOrFail($id);

        Gate::authorize('restore', $client);

        $client->restore();

        return redirect()->back()
            ->with('success', 'Client restored successfully.');
    }
}
