<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $query = User::query();

        // Search by name, email, or phone
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $sortField = in_array($request->query('sort'), ['name', 'email', 'role', 'status', 'created_at'])
            ? $request->query('sort')
            : 'created_at';

        $sortDirection = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $users = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'status' => $user->status->value,
                'status_label' => $user->status->label(),
                'created_at' => $user->created_at?->toFormattedDateString(),
                'can' => [
                    'update' => $request->user()?->can('update', $user) ?? false,
                    'delete' => $request->user()?->can('delete', $user) ?? false,
                ],
            ]);

        $metrics = [
            'total' => User::count(),
            'active' => User::where('status', UserStatus::Active->value)->count(),
            'admins' => User::where('role', UserRole::Admin->value)->count(),
            'staff' => User::where('role', UserRole::Staff->value)->count(),
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->query('search', ''),
                'role' => $request->query('role', ''),
                'status' => $request->query('status', ''),
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
            'metrics' => $metrics,
            'roles' => array_map(fn (UserRole $r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
            'statuses' => array_map(fn (UserStatus $s) => ['value' => $s->value, 'label' => $s->label()], UserStatus::cases()),
            'canCreate' => $request->user()?->can('create', User::class) ?? false,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('users/create', [
            'roles' => array_map(fn (UserRole $r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
            'statuses' => array_map(fn (UserStatus $s) => ['value' => $s->value, 'label' => $s->label()], UserStatus::cases()),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): RedirectResponse
    {
        Gate::authorize('view', $user);

        return redirect()->route('users.edit', $user);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role->value,
                'status' => $user->status->value,
                'created_at' => $user->created_at?->toFormattedDateString(),
            ],
            'roles' => array_map(fn (UserRole $r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
            'statuses' => array_map(fn (UserStatus $s) => ['value' => $s->value, 'label' => $s->label()], UserStatus::cases()),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
