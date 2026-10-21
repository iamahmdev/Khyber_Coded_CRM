import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Shield,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import usersRoute from '@/routes/users';
import type { Auth, BreadcrumbItem } from '@/types';

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    status: string;
    status_label: string;
    created_at: string;
}

interface RoleDistributionItem {
    name: string;
    count: number;
    role: string;
}

interface DashboardProps {
    metrics: {
        total_users: number;
        active_users: number;
        admins_count: number | null;
        managers_count: number | null;
        staff_count: number | null;
        clients_count: number | null;
        new_this_week: number | null;
    };
    recentUsers: RecentUser[];
    roleDistribution: RoleDistributionItem[];
    canManageUsers: boolean;
}

export default function Dashboard({
    metrics,
    recentUsers,
    roleDistribution,
    canManageUsers,
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'manager':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getStatusPillClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'inactive':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'suspended':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            default:
                return '';
        }
    };

    const currentDateFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <>
            <Head title="CRM Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card via-card to-muted/40 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Calendar className="size-3.5" />
                                <span>{currentDateFormatted}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {getTimeGreeting()}, {currentUser.name}!
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Welcome to your Khyber Coded CRM workspace. Here is an overview of your organization.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                                <Sparkles className="size-3 text-primary" />
                                {currentUser.role?.toUpperCase() || 'STAFF'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
                            <Users className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_users}</div>
                            <CardDescription>
                                {metrics.new_this_week !== null
                                    ? `+${metrics.new_this_week} registered this week`
                                    : 'Registered CRM accounts'}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                            <UserCheck className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.active_users}</div>
                            <CardDescription>Authorized & ready</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                            <Shield className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics.admins_count !== null ? metrics.admins_count : '—'}
                            </div>
                            <CardDescription>
                                {metrics.admins_count !== null
                                    ? 'Full system privileges'
                                    : 'Restricted view'}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Staff & Operations</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics.staff_count !== null ? metrics.staff_count : '—'}
                            </div>
                            <CardDescription>
                                {metrics.staff_count !== null
                                    ? 'Operational users'
                                    : 'Restricted view'}
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Sections */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Users List (2 Columns wide on large screens) */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Team Members</CardTitle>
                                <CardDescription>Recently onboarded and active colleagues</CardDescription>
                            </div>

                            {canManageUsers && (
                                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                    <Link href={usersRoute.index.url()}>
                                        View All
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent>
                            {recentUsers.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No users found in database.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {recentUsers.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9 border">
                                                    <AvatarFallback className="text-xs font-semibold">
                                                        {getInitials(u.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{u.name}</div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={getRoleBadgeVariant(u.role)}>
                                                    {u.role_label}
                                                </Badge>

                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusPillClass(
                                                        u.status
                                                    )}`}
                                                >
                                                    {u.status_label}
                                                </span>

                                                <span className="hidden sm:inline text-xs text-muted-foreground">
                                                    {u.created_at}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Role Distribution & System Roadmap */}
                    <div className="flex flex-col gap-6">
                        {/* Role Distribution Card */}
                        {roleDistribution.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold">Role Distribution</CardTitle>
                                    <CardDescription>Access breakdown across the team</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {roleDistribution.map((item) => {
                                        const pct =
                                            metrics.total_users > 0
                                                ? Math.round((item.count / metrics.total_users) * 100)
                                                : 0;

                                        return (
                                            <div key={item.role} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">{item.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {item.count} ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}

                        {/* CRM Roadmap & Modules Readiness */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">CRM Implementation Status</CardTitle>
                                <CardDescription>Progress per 44-Module Roadmap</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 font-medium">
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                        M1: Project Setup & Architecture
                                    </span>
                                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 font-medium">
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                        M2: Built-in Authentication (Fortify)
                                    </span>
                                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 font-medium">
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                        M3: Users & Roles (RBAC)
                                    </span>
                                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 font-medium">
                                        <Sparkles className="size-4 text-primary" />
                                        M4: Dynamic CRM Dashboard
                                    </span>
                                    <Badge variant="default">
                                        Current
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2 font-medium">
                                        <Clock className="size-4 text-muted-foreground" />
                                        M5: Leads Management
                                    </span>
                                    <Badge variant="outline" className="text-muted-foreground">
                                        Next
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

Dashboard.layout = {
    breadcrumbs,
};
