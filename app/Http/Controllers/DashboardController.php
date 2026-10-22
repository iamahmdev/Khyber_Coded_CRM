<?php

namespace App\Http\Controllers;

use App\Enums\LeadStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the CRM dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Administrator and Manager have full team visibility
        if ($user->isAdmin() || $user->isManager()) {
            $metrics = [
                'total_users' => User::count(),
                'active_users' => User::where('status', UserStatus::Active->value)->count(),
                'admins_count' => User::where('role', UserRole::Admin->value)->count(),
                'managers_count' => User::where('role', UserRole::Manager->value)->count(),
                'staff_count' => User::where('role', UserRole::Staff->value)->count(),
                'clients_count' => User::where('role', UserRole::Client->value)->count(),
                'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
            ];

            $recentUsers = User::latest()
                ->take(5)
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role->value,
                    'role_label' => $u->role->label(),
                    'status' => $u->status->value,
                    'status_label' => $u->status->label(),
                    'created_at' => $u->created_at?->diffForHumans() ?? 'Recently',
                ]);

            $roleDistribution = [
                ['name' => 'Administrators', 'count' => $metrics['admins_count'], 'role' => 'admin'],
                ['name' => 'Managers', 'count' => $metrics['managers_count'], 'role' => 'manager'],
                ['name' => 'Staff', 'count' => $metrics['staff_count'], 'role' => 'staff'],
                ['name' => 'Clients', 'count' => $metrics['clients_count'], 'role' => 'client'],
            ];
        } else {
            // Staff and Client scoped view
            $metrics = [
                'total_users' => User::where('status', UserStatus::Active->value)->count(),
                'active_users' => User::where('status', UserStatus::Active->value)->count(),
                'admins_count' => null,
                'managers_count' => null,
                'staff_count' => null,
                'clients_count' => null,
                'new_this_week' => null,
            ];

            $recentUsers = User::active()
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role->value,
                    'role_label' => $u->role->label(),
                    'status' => $u->status->value,
                    'status_label' => $u->status->label(),
                    'created_at' => $u->created_at?->diffForHumans() ?? 'Recently',
                ]);

            $roleDistribution = [];
        }

        // Live leads overview for authorized team members
        $canViewLeads = $user->can('viewAny', Lead::class);
        $leadMetrics = null;
        $recentLeads = [];

        if ($canViewLeads) {
            $leadsQuery = Lead::query()->forUser($user);
            $totalLeads = (clone $leadsQuery)->count();
            $pipelineVal = (clone $leadsQuery)
                ->whereNotIn('status', [LeadStatus::Converted->value, LeadStatus::Lost->value, LeadStatus::Unqualified->value])
                ->sum('estimated_value');

            $leadMetrics = [
                'total' => $totalLeads,
                'pipeline_value' => '$'.number_format((float) $pipelineVal, 2),
                'qualified' => (clone $leadsQuery)->where('status', LeadStatus::Qualified->value)->count(),
                'new_this_week' => (clone $leadsQuery)->where('created_at', '>=', now()->startOfWeek())->count(),
            ];

            $recentLeads = (clone $leadsQuery)
                ->latest()
                ->take(4)
                ->get()
                ->map(fn (Lead $l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'company' => $l->company,
                    'status_label' => $l->status->label(),
                    'status_badge_class' => $l->status->badgeClass(),
                    'formatted_value' => $l->estimated_value !== null ? '$'.number_format((float) $l->estimated_value, 2) : null,
                    'created_at' => $l->created_at?->diffForHumans() ?? 'Recently',
                ]);
        }

        return Inertia::render('dashboard', [
            'metrics' => $metrics,
            'recentUsers' => $recentUsers,
            'roleDistribution' => $roleDistribution,
            'canManageUsers' => $user->canManageUsers(),
            'canViewLeads' => $canViewLeads,
            'leadMetrics' => $leadMetrics,
            'recentLeads' => $recentLeads,
        ]);
    }
}
