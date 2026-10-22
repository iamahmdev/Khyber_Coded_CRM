import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ArrowRight,
    Bell,
    Briefcase,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    CheckSquare,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    Eye,
    FileText,
    Filter,
    Mail,
    MapPin,
    MoreHorizontal,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Target,
    TrendingUp,
    User,
    Video,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import activitiesRoute from '@/routes/activities';
import clientsRoute from '@/routes/clients';
import dealsRoute from '@/routes/deals';
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface ActivityItem {
    id: number;
    title: string;
    type: string;
    type_label: string;
    type_badge_class: string;
    type_icon: string;
    status: string;
    status_label: string;
    status_badge_class: string;
    priority: string;
    priority_label: string;
    priority_badge_class: string;
    due_at: string;
    due_at_formatted: string;
    is_overdue: boolean;
    completed_at: string | null;
    location: string | null;
    notes: string | null;
    outcome: string | null;
    client?: {
        id: number;
        name: string;
    } | null;
    lead?: {
        id: number;
        name: string;
        company: string | null;
    } | null;
    deal?: {
        id: number;
        title: string;
    } | null;
    assigned_to?: {
        id: number;
        name: string;
        email: string;
    } | null;
    can: {
        view: boolean;
        update: boolean;
        complete: boolean;
        delete: boolean;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedActivities {
    data: ActivityItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface TypeOption {
    value: string;
    label: string;
    badge_class: string;
    icon: string;
}

interface PriorityOption {
    value: string;
    label: string;
    badge_class: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ActivitiesIndexProps {
    activities: PaginatedActivities;
    metrics: {
        pending_count: number;
        overdue_count: number;
        today_count: number;
        completed_count: number;
    };
    types: TypeOption[];
    priorities: PriorityOption[];
    teamMembers: TeamMember[];
    activeTab: string;
    filters: {
        search: string;
        type: string;
        priority: string;
        assigned_to: string;
        tab: string;
    };
}

export default function ActivitiesIndex({
    activities,
    metrics,
    types,
    priorities,
    teamMembers,
    activeTab,
    filters,
}: ActivitiesIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedAssignee, setSelectedAssignee] = useState(filters.assigned_to || 'all');
    const [currentTab, setCurrentTab] = useState(activeTab || 'upcoming');

    // Complete Activity Modal
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [activityToComplete, setActivityToComplete] = useState<ActivityItem | null>(null);
    const [outcomeNotes, setOutcomeNotes] = useState('');

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleApplyFilters = (params: {
        search?: string;
        type?: string;
        priority?: string;
        assigned_to?: string;
        tab?: string;
    }) => {
        const query: Record<string, string> = {};

        const s = params.search !== undefined ? params.search : search;
        const t = params.type !== undefined ? params.type : selectedType;
        const p = params.priority !== undefined ? params.priority : selectedPriority;
        const a = params.assigned_to !== undefined ? params.assigned_to : selectedAssignee;
        const tb = params.tab !== undefined ? params.tab : currentTab;

        if (s) query.search = s;
        if (t && t !== 'all') query.type = t;
        if (p && p !== 'all') query.priority = p;
        if (a && a !== 'all') query.assigned_to = a;
        if (tb && tb !== 'upcoming') query.tab = tb;

        router.get(activitiesRoute.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTabChange = (newTab: string) => {
        setCurrentTab(newTab);
        handleApplyFilters({ tab: newTab });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedPriority('all');
        setSelectedAssignee('all');
        router.get(activitiesRoute.index.url(), { tab: currentTab }, { preserveScroll: true, replace: true });
    };

    const openCompleteModal = (act: ActivityItem) => {
        setActivityToComplete(act);
        setOutcomeNotes(act.outcome || '');
        setCompleteModalOpen(true);
    };

    const confirmComplete = () => {
        if (!activityToComplete) return;

        router.patch(
            activitiesRoute.complete({ activity: activityToComplete.id }).url,
            {
                status: 'completed',
                outcome: outcomeNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCompleteModalOpen(false);
                    setActivityToComplete(null);
                    toast.success('Activity marked as completed!');
                },
                onError: () => toast.error('Failed to update activity.'),
            }
        );
    };

    const handleCancelActivity = (act: ActivityItem) => {
        router.patch(
            activitiesRoute.complete({ activity: act.id }).url,
            { status: 'cancelled' },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Activity cancelled.'),
                onError: () => toast.error('Failed to cancel activity.'),
            }
        );
    };

    const confirmDelete = () => {
        if (!activityToDelete) return;

        router.delete(activitiesRoute.destroy({ activity: activityToDelete.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setActivityToDelete(null);
                toast.success('Activity removed successfully.');
            },
            onError: () => toast.error('Failed to delete activity.'),
        });
    };

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="size-4 text-emerald-500" />;
            case 'meeting':
                return <Video className="size-4 text-purple-500" />;
            case 'email':
                return <Mail className="size-4 text-blue-500" />;
            case 'reminder':
                return <Bell className="size-4 text-amber-500" />;
            case 'task':
                return <CheckSquare className="size-4 text-indigo-500" />;
            default:
                return <FileText className="size-4 text-zinc-500" />;
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const activeFilterCount = [
        search,
        selectedType !== 'all' ? selectedType : '',
        selectedPriority !== 'all' ? selectedPriority : '',
        selectedAssignee !== 'all' ? selectedAssignee : '',
    ].filter(Boolean).length;

    return (
        <>
            <Head title="Follow-ups & Communication Activities" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Follow-ups & Communication</h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                Module 8
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manage stakeholder follow-ups, calls, client meetings, reminders, and communication logs.
                        </p>
                    </div>

                    <Button asChild className="gap-2 shadow-sm self-start sm:self-auto">
                        <Link href={activitiesRoute.create.url()}>
                            <Plus className="size-4" />
                            Schedule Activity
                        </Link>
                    </Button>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className={`border-border/60 shadow-xs cursor-pointer transition-all hover:border-primary/50 ${
                            currentTab === 'upcoming' ? 'ring-1 ring-primary/40 bg-primary/5' : ''
                        }`}
                        onClick={() => handleTabChange('upcoming')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
                            <Clock className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.pending_count}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Scheduled open activities</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/60 shadow-xs cursor-pointer transition-all hover:border-rose-500/50 ${
                            currentTab === 'overdue' ? 'ring-1 ring-rose-500/40 bg-rose-500/5' : ''
                        }`}
                        onClick={() => handleTabChange('overdue')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                Overdue Alerts
                            </CardTitle>
                            <AlertCircle className="size-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {metrics.overdue_count}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Action items past target due date</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/60 shadow-xs cursor-pointer transition-all hover:border-amber-500/50 ${
                            currentTab === 'today' ? 'ring-1 ring-amber-500/40 bg-amber-500/5' : ''
                        }`}
                        onClick={() => handleTabChange('today')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                            <CalendarCheck className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.today_count}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Scheduled for today&apos;s agenda</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-border/60 shadow-xs cursor-pointer transition-all hover:border-emerald-500/50 ${
                            currentTab === 'completed' ? 'ring-1 ring-emerald-500/40 bg-emerald-500/5' : ''
                        }`}
                        onClick={() => handleTabChange('completed')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed (This Month)</CardTitle>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.completed_count}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Resolved client interactions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => handleTabChange('upcoming')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            currentTab === 'upcoming'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Upcoming ({metrics.pending_count})
                    </button>
                    <button
                        onClick={() => handleTabChange('today')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            currentTab === 'today'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Today ({metrics.today_count})
                    </button>
                    <button
                        onClick={() => handleTabChange('overdue')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            currentTab === 'overdue'
                                ? 'border-rose-500 text-rose-600 font-bold'
                                : 'border-transparent text-muted-foreground hover:text-rose-600'
                        }`}
                    >
                        Overdue ({metrics.overdue_count})
                    </button>
                    <button
                        onClick={() => handleTabChange('completed')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            currentTab === 'completed'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            currentTab === 'all'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        All History
                    </button>
                </div>

                {/* Filter Toolbar */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search activities by subject, notes, or company..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleApplyFilters({ search });
                                        }}
                                        className="pl-9"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => {
                                                setSearch('');
                                                handleApplyFilters({ search: '' });
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Type Filter */}
                                <Select
                                    value={selectedType}
                                    onValueChange={(val) => {
                                        setSelectedType(val);
                                        handleApplyFilters({ type: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="Activity Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {types.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Priority Filter */}
                                <Select
                                    value={selectedPriority}
                                    onValueChange={(val) => {
                                        setSelectedPriority(val);
                                        handleApplyFilters({ priority: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        {priorities.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Assignee Filter */}
                                <Select
                                    value={selectedAssignee}
                                    onValueChange={(val) => {
                                        setSelectedAssignee(val);
                                        handleApplyFilters({ assigned_to: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[170px]">
                                        <SelectValue placeholder="Assigned Owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Owners</SelectItem>
                                        {teamMembers.map((m) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApplyFilters({ search })}
                                    className="gap-1.5"
                                >
                                    <Filter className="size-3.5" />
                                    Filter
                                </Button>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Reset ({activeFilterCount})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activities List / Agenda */}
                <div className="flex flex-col gap-3">
                    {activities.data.length === 0 ? (
                        <Card className="border-border/60 shadow-xs">
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <CalendarCheck className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                                <div className="text-base font-semibold text-foreground">No activities found</div>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    There are no follow-ups or communication tasks matching this view. Schedule an activity to start tracking interactions.
                                </p>
                                <Button asChild size="sm" className="mt-4 gap-1.5">
                                    <Link href={activitiesRoute.create.url()}>
                                        <Plus className="size-3.5" />
                                        Schedule Activity
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        activities.data.map((act) => (
                            <Card
                                key={act.id}
                                className={`border-border/60 transition-all hover:border-primary/40 shadow-xs ${
                                    act.is_overdue
                                        ? 'border-l-4 border-l-rose-500 bg-rose-500/[0.02]'
                                        : act.status === 'completed'
                                          ? 'border-l-4 border-l-emerald-500 bg-muted/10 opacity-80'
                                          : 'border-l-4 border-l-primary/60'
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        {/* Activity Main Info */}
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted border border-border mt-0.5">
                                                {renderTypeIcon(act.type)}
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        href={activitiesRoute.show({ activity: act.id }).url}
                                                        className="font-semibold text-base text-foreground hover:text-primary transition-colors"
                                                    >
                                                        {act.title}
                                                    </Link>

                                                    <Badge variant="outline" className={`text-xs ${act.type_badge_class}`}>
                                                        {act.type_label}
                                                    </Badge>

                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize ${act.priority_badge_class}`}
                                                    >
                                                        {act.priority_label}
                                                    </Badge>

                                                    {act.is_overdue && (
                                                        <Badge variant="destructive" className="text-xs gap-1 font-semibold">
                                                            <AlertCircle className="size-3" />
                                                            Overdue
                                                        </Badge>
                                                    )}

                                                    {act.status === 'completed' && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"
                                                        >
                                                            <CheckCircle2 className="size-3" />
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Related Entities Links */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                                                    {act.client && (
                                                        <Link
                                                            href={clientsRoute.show({ client: act.client.id }).url}
                                                            className="flex items-center gap-1 hover:text-foreground transition-colors font-medium text-foreground"
                                                        >
                                                            <Briefcase className="size-3.5 text-blue-500" />
                                                            {act.client.name}
                                                        </Link>
                                                    )}

                                                    {act.lead && (
                                                        <Link
                                                            href={leadsRoute.show({ lead: act.lead.id }).url}
                                                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                                                        >
                                                            <Target className="size-3.5 text-amber-500" />
                                                            Lead: {act.lead.name}
                                                        </Link>
                                                    )}

                                                    {act.deal && (
                                                        <Link
                                                            href={dealsRoute.show({ deal: act.deal.id }).url}
                                                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                                                        >
                                                            <TrendingUp className="size-3.5 text-indigo-500" />
                                                            Deal: {act.deal.title}
                                                        </Link>
                                                    )}

                                                    {act.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="size-3.5 text-muted-foreground/70" />
                                                            {act.location.startsWith('http') ? (
                                                                <a
                                                                    href={act.location}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-primary hover:underline flex items-center gap-0.5"
                                                                >
                                                                    Join Meeting
                                                                    <ExternalLink className="size-2.5" />
                                                                </a>
                                                            ) : (
                                                                <span>{act.location}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pre-activity notes or outcome debrief */}
                                                {act.notes && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                                                        {act.notes}
                                                    </p>
                                                )}

                                                {act.outcome && (
                                                    <div className="mt-2 rounded bg-muted/40 p-2 text-xs border border-border/40">
                                                        <strong className="text-foreground">Outcome Summary: </strong>
                                                        <span className="text-muted-foreground">{act.outcome}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Details & Fast Actions */}
                                        <div className="flex flex-col items-end gap-2.5 shrink-0 sm:pl-4">
                                            <div className="text-right">
                                                <div
                                                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                                                        act.is_overdue
                                                            ? 'text-rose-600 dark:text-rose-400'
                                                            : 'text-foreground'
                                                    }`}
                                                >
                                                    <Clock className="size-3.5" />
                                                    <span>{act.due_at_formatted}</span>
                                                </div>
                                                {act.assigned_to && (
                                                    <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
                                                        <span>{act.assigned_to.name}</span>
                                                        <Avatar className="size-5 border border-border">
                                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                {getInitials(act.assigned_to.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5">
                                                {act.can.complete && act.status !== 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 gap-1 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                                        onClick={() => openCompleteModal(act)}
                                                    >
                                                        <CheckCircle2 className="size-3.5" />
                                                        Complete
                                                    </Button>
                                                )}

                                                {act.can.complete && act.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleCancelActivity(act)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-7">
                                                            <MoreHorizontal className="size-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={activitiesRoute.show({ activity: act.id }).url}
                                                                className="gap-2 text-xs"
                                                            >
                                                                <Eye className="size-3.5" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {act.can.update && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={activitiesRoute.edit({ activity: act.id }).url}
                                                                    className="gap-2 text-xs"
                                                                >
                                                                    <Edit className="size-3.5" />
                                                                    Edit Activity
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {act.can.delete && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setActivityToDelete(act);
                                                                        setDeleteModalOpen(true);
                                                                    }}
                                                                    className="gap-2 text-xs text-rose-600 focus:text-rose-600"
                                                                >
                                                                    <Archive className="size-3.5" />
                                                                    Delete Activity
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Pagination */}
                    {activities.total > activities.per_page && (
                        <div className="flex items-center justify-between border-t border-border/60 px-2 py-4 text-xs text-muted-foreground">
                            <div>
                                Showing {activities.from} to {activities.to} of {activities.total} activities
                            </div>
                            <div className="flex items-center gap-1">
                                {activities.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'secondary' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                        className="h-7 min-w-7 px-2 text-xs"
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Complete Activity with Outcome Notes */}
            <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="size-5" />
                            Complete Follow-up Activity
                        </DialogTitle>
                        <DialogDescription>
                            Mark &quot;{activityToComplete?.title}&quot; as completed and optionally record key discussion takeaways or meeting minutes.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="outcomeNotes">Outcome & Debrief Notes (Optional)</Label>
                            <textarea
                                id="outcomeNotes"
                                rows={4}
                                placeholder="e.g. Client agreed to revised pricing; demo confirmed for next Tuesday..."
                                value={outcomeNotes}
                                onChange={(e) => setOutcomeNotes(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmComplete} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 className="size-4" />
                            Mark Completed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Delete Activity */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Activity</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{activityToDelete?.title}&quot;? Soft-deleted activities can be restored by an administrator.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Activity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Follow-ups & Activities',
        href: activitiesRoute.index.url(),
    },
];

ActivitiesIndex.layout = {
    breadcrumbs,
};
