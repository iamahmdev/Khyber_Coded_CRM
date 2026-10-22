import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowRight,
    Award,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Filter,
    Kanban,
    Layers,
    List,
    MoreHorizontal,
    Percent,
    Plus,
    RotateCcw,
    Search,
    Target,
    TrendingUp,
    User,
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
import dealsRoute from '@/routes/deals';
import type { BreadcrumbItem } from '@/types';

interface DealItem {
    id: number;
    title: string;
    client_id: number | null;
    lead_id: number | null;
    contact_id: number | null;
    stage: string;
    priority: string;
    amount: string | number;
    currency: string;
    probability: number;
    expected_close_date: string | null;
    actual_close_date: string | null;
    loss_reason: string | null;
    notes: string | null;
    created_at: string;
    client?: {
        id: number;
        name: string;
    } | null;
    contact?: {
        id: number;
        name: string;
        email: string | null;
    } | null;
    assigned_to?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDeals {
    data: DealItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface StageMeta {
    value: string;
    label: string;
    badge_class: string;
    default_probability: number;
    is_closed: boolean;
    is_won: boolean;
    is_lost: boolean;
}

interface PriorityMeta {
    value: string;
    label: string;
    badge_class: string;
}

interface DealsIndexProps {
    deals: PaginatedDeals | null;
    boardDeals: Record<string, DealItem[]> | null;
    metrics: {
        total_pipeline_value: number;
        weighted_pipeline_value: number;
        active_deals_count: number;
        won_value: number;
        won_count: number;
        lost_count: number;
        win_rate: number;
        stage_distribution: Record<string, { count: number; total_amount: number; weighted_amount: number }>;
    };
    stages: StageMeta[];
    priorities: PriorityMeta[];
    teamMembers: Array<{ id: number; name: string; email: string; role: string }>;
    clients: Array<{ id: number; name: string }>;
    viewMode: 'board' | 'list';
    filters: {
        search: string;
        stage: string;
        priority: string;
        assigned_to: string;
        client_id: string;
        sort: string;
        direction: string;
        view: string;
    };
}

export default function DealsIndex({
    deals,
    boardDeals,
    metrics,
    stages,
    priorities,
    teamMembers,
    clients,
    viewMode,
    filters,
}: DealsIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; info?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedAssignee, setSelectedAssignee] = useState(filters.assigned_to || 'all');
    const [selectedClient, setSelectedClient] = useState(filters.client_id || 'all');
    const [selectedStage, setSelectedStage] = useState(filters.stage || 'all');
    const [currentView, setCurrentView] = useState<'board' | 'list'>(viewMode);

    // Modals
    const [lossDialogOpen, setLossDialogOpen] = useState(false);
    const [dealForLoss, setDealForLoss] = useState<DealItem | null>(null);
    const [lossReason, setLossReason] = useState('');
    const [lossNotes, setLossNotes] = useState('');

    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [dealToArchive, setDealToArchive] = useState<DealItem | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
    }, [flash]);

    const formatCurrency = (val: number | string, currency = 'USD') => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const handleApplyFilters = (params: {
        search?: string;
        priority?: string;
        assigned_to?: string;
        client_id?: string;
        stage?: string;
        view?: 'board' | 'list';
    }) => {
        const query: Record<string, string> = {};

        const s = params.search !== undefined ? params.search : search;
        const p = params.priority !== undefined ? params.priority : selectedPriority;
        const a = params.assigned_to !== undefined ? params.assigned_to : selectedAssignee;
        const c = params.client_id !== undefined ? params.client_id : selectedClient;
        const st = params.stage !== undefined ? params.stage : selectedStage;
        const v = params.view !== undefined ? params.view : currentView;

        if (s) query.search = s;
        if (p && p !== 'all') query.priority = p;
        if (a && a !== 'all') query.assigned_to = a;
        if (c && c !== 'all') query.client_id = c;
        if (v === 'list' && st && st !== 'all') query.stage = st;
        if (v) query.view = v;

        router.get(dealsRoute.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedPriority('all');
        setSelectedAssignee('all');
        setSelectedClient('all');
        setSelectedStage('all');
        router.get(dealsRoute.index.url(), { view: currentView }, { preserveScroll: true, replace: true });
    };

    const handleQuickStageAdvance = (deal: DealItem, targetStage: string) => {
        router.patch(
            dealsRoute.stage({ deal: deal.id }).url,
            { stage: targetStage },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Stage advanced successfully!'),
                onError: () => toast.error('Failed to advance stage.'),
            }
        );
    };

    const openLossDialog = (deal: DealItem) => {
        setDealForLoss(deal);
        setLossReason('Budget constraints');
        setLossNotes('');
        setLossDialogOpen(true);
    };

    const confirmMarkLost = () => {
        if (!dealForLoss) return;

        router.patch(
            dealsRoute.stage({ deal: dealForLoss.id }).url,
            {
                stage: 'lost',
                loss_reason: lossReason,
                notes: lossNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLossDialogOpen(false);
                    setDealForLoss(null);
                    toast.success('Deal marked as Closed Lost.');
                },
                onError: () => toast.error('Failed to update deal stage.'),
            }
        );
    };

    const confirmArchive = () => {
        if (!dealToArchive) return;

        router.delete(dealsRoute.destroy({ deal: dealToArchive.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setArchiveDialogOpen(false);
                setDealToArchive(null);
                toast.success('Deal archived successfully.');
            },
            onError: () => toast.error('Failed to archive deal.'),
        });
    };

    const getStageNextTarget = (currentStage: string): string | null => {
        const order = ['new', 'qualified', 'proposal', 'negotiation', 'won'];
        const idx = order.indexOf(currentStage);
        if (idx >= 0 && idx < order.length - 1) {
            return order[idx + 1];
        }
        return null;
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'high':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
        }
    };

    const getStageBadgeClass = (stage: string) => {
        const found = stages.find((s) => s.value === stage);
        return found ? found.badge_class : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const activeFilterCount = [
        search,
        selectedPriority !== 'all' ? selectedPriority : '',
        selectedAssignee !== 'all' ? selectedAssignee : '',
        selectedClient !== 'all' ? selectedClient : '',
        selectedStage !== 'all' ? selectedStage : '',
    ].filter(Boolean).length;

    return (
        <>
            <Head title="Sales Pipeline & Opportunities" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                Module 7
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Track deals, calculate probability-weighted forecasts, and drive conversions through stages.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* View Switcher */}
                        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
                            <Button
                                size="sm"
                                variant={currentView === 'board' ? 'secondary' : 'ghost'}
                                className="h-7 gap-1.5 px-2.5 text-xs font-medium"
                                onClick={() => {
                                    setCurrentView('board');
                                    handleApplyFilters({ view: 'board' });
                                }}
                            >
                                <Kanban className="size-3.5" />
                                Kanban Board
                            </Button>
                            <Button
                                size="sm"
                                variant={currentView === 'list' ? 'secondary' : 'ghost'}
                                className="h-7 gap-1.5 px-2.5 text-xs font-medium"
                                onClick={() => {
                                    setCurrentView('list');
                                    handleApplyFilters({ view: 'list' });
                                }}
                            >
                                <List className="size-3.5" />
                                List View
                            </Button>
                        </div>

                        <Button asChild className="gap-2 shadow-sm">
                            <Link href={dealsRoute.create.url()}>
                                <Plus className="size-4" />
                                New Deal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                            <DollarSign className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.total_pipeline_value)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active open opportunities
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Weighted Forecast</CardTitle>
                            <TrendingUp className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.weighted_pipeline_value)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Probability-adjusted projected revenue
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                            <Layers className="size-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.active_deals_count}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Currently progressing in pipeline
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
                            <Award className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.won_value)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.won_count} deal{metrics.won_count === 1 ? '' : 's'} won
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                            <Percent className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.win_rate}%</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.won_count} won vs {metrics.lost_count} lost
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search deals by title, company, or contact..."
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

                                {/* Priority filter */}
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

                                {/* Assignee filter */}
                                <Select
                                    value={selectedAssignee}
                                    onValueChange={(val) => {
                                        setSelectedAssignee(val);
                                        handleApplyFilters({ assigned_to: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[170px]">
                                        <SelectValue placeholder="Deal Owner" />
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

                                {/* Client filter */}
                                <Select
                                    value={selectedClient}
                                    onValueChange={(val) => {
                                        setSelectedClient(val);
                                        handleApplyFilters({ client_id: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Clients</SelectItem>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Stage filter (visible in list mode) */}
                                {currentView === 'list' && (
                                    <Select
                                        value={selectedStage}
                                        onValueChange={(val) => {
                                            setSelectedStage(val);
                                            handleApplyFilters({ stage: val });
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[160px]">
                                            <SelectValue placeholder="Stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stages</SelectItem>
                                            {stages.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
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

                {/* VIEW 1: KANBAN BOARD */}
                {currentView === 'board' && boardDeals && (
                    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-[1200px]">
                        {stages.map((stage) => {
                            const columnDeals = boardDeals[stage.value] || [];
                            const colStats = metrics.stage_distribution[stage.value] || {
                                count: 0,
                                total_amount: 0,
                                weighted_amount: 0,
                            };
                            const nextStageTarget = getStageNextTarget(stage.value);

                            return (
                                <div
                                    key={stage.value}
                                    className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs"
                                >
                                    {/* Column Header */}
                                    <div className="mb-3 border-b border-border/50 pb-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`px-2 py-0.5 text-xs font-semibold ${stage.badge_class}`}
                                                >
                                                    {stage.label}
                                                </Badge>
                                                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                                    {colStats.count}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground">
                                                {formatCurrency(colStats.total_amount)}
                                            </span>
                                            <span>
                                                {stage.default_probability}% prob
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deals Column Body */}
                                    <div className="flex flex-1 flex-col gap-2.5 min-h-[300px]">
                                        {columnDeals.length === 0 ? (
                                            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                                                <span>No deals in this stage</span>
                                            </div>
                                        ) : (
                                            columnDeals.map((deal) => {
                                                const weighted = Math.round(
                                                    ((parseFloat(deal.amount as string) || 0) * (deal.probability || 0)) / 100
                                                );

                                                return (
                                                    <Card
                                                        key={deal.id}
                                                        className="group border-border/70 transition-all hover:border-primary/50 hover:shadow-sm"
                                                    >
                                                        <CardContent className="p-3.5">
                                                            {/* Card Top: Title & Dropdown */}
                                                            <div className="flex items-start justify-between gap-1.5">
                                                                <Link
                                                                    href={dealsRoute.show({ deal: deal.id }).url}
                                                                    className="font-medium text-sm leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
                                                                >
                                                                    {deal.title}
                                                                </Link>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-6 text-muted-foreground hover:text-foreground"
                                                                        >
                                                                            <MoreHorizontal className="size-3.5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link
                                                                                href={dealsRoute.show({ deal: deal.id }).url}
                                                                                className="gap-2 text-xs"
                                                                            >
                                                                                <Eye className="size-3.5" />
                                                                                View Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link
                                                                                href={dealsRoute.edit({ deal: deal.id }).url}
                                                                                className="gap-2 text-xs"
                                                                            >
                                                                                <Edit className="size-3.5" />
                                                                                Edit Deal
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setDealToArchive(deal);
                                                                                setArchiveDialogOpen(true);
                                                                            }}
                                                                            className="gap-2 text-xs text-rose-600 focus:text-rose-600"
                                                                        >
                                                                            <Archive className="size-3.5" />
                                                                            Archive Deal
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>

                                                            {/* Client Organization */}
                                                            {deal.client && (
                                                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    <Briefcase className="size-3 shrink-0 text-muted-foreground/80" />
                                                                    <span className="truncate">{deal.client.name}</span>
                                                                </div>
                                                            )}

                                                            {/* Amount & Weighted Forecast */}
                                                            <div className="mt-2.5 flex items-baseline justify-between border-t border-border/40 pt-2">
                                                                <div className="text-sm font-bold text-foreground">
                                                                    {formatCurrency(deal.amount, deal.currency)}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                                    wt: {formatCurrency(weighted, deal.currency)}
                                                                </div>
                                                            </div>

                                                            {/* Footer Badges & Assignee */}
                                                            <div className="mt-2.5 flex items-center justify-between gap-1 text-xs">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[10px] px-1.5 py-0 ${getPriorityBadgeClass(deal.priority)}`}
                                                                >
                                                                    {deal.priority}
                                                                </Badge>

                                                                {deal.expected_close_date && (
                                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                        <Calendar className="size-3" />
                                                                        <span>{deal.expected_close_date}</span>
                                                                    </div>
                                                                )}

                                                                {deal.assigned_to && (
                                                                    <Avatar className="size-5 border border-border">
                                                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                            {getInitials(deal.assigned_to.name)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                            </div>

                                                            {/* Quick Stage Controls */}
                                                            <div className="mt-3 flex items-center gap-1 border-t border-border/40 pt-2">
                                                                {nextStageTarget && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 flex-1 gap-1 text-[11px] text-primary hover:bg-primary/10"
                                                                        onClick={() => handleQuickStageAdvance(deal, nextStageTarget)}
                                                                    >
                                                                        <span>Advance</span>
                                                                        <ArrowRight className="size-3" />
                                                                    </Button>
                                                                )}

                                                                {deal.stage !== 'won' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 px-1.5 text-[11px] text-emerald-600 hover:bg-emerald-500/10"
                                                                        title="Mark as Won"
                                                                        onClick={() => handleQuickStageAdvance(deal, 'won')}
                                                                    >
                                                                        <CheckCircle2 className="size-3.5" />
                                                                    </Button>
                                                                )}

                                                                {deal.stage !== 'lost' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 px-1.5 text-[11px] text-rose-600 hover:bg-rose-500/10"
                                                                        title="Mark as Lost"
                                                                        onClick={() => openLossDialog(deal)}
                                                                    >
                                                                        <XCircle className="size-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* VIEW 2: LIST TABLE VIEW */}
                {currentView === 'list' && deals && (
                    <Card className="border-border/60 shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Deal Title</th>
                                        <th className="px-4 py-3">Client / Organization</th>
                                        <th className="px-4 py-3">Stage</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3 text-right">Deal Amount</th>
                                        <th className="px-4 py-3 text-right">Win Prob</th>
                                        <th className="px-4 py-3">Expected Close</th>
                                        <th className="px-4 py-3">Owner</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {deals.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-muted-foreground">
                                                No sales opportunities found matching current filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        deals.data.map((deal) => (
                                            <tr key={deal.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={dealsRoute.show({ deal: deal.id }).url}
                                                        className="font-medium text-foreground hover:text-primary transition-colors"
                                                    >
                                                        {deal.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {deal.client ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <Briefcase className="size-3 text-muted-foreground" />
                                                            {deal.client.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize ${getStageBadgeClass(deal.stage)}`}
                                                    >
                                                        {deal.stage}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize ${getPriorityBadgeClass(deal.priority)}`}
                                                    >
                                                        {deal.priority}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                    {formatCurrency(deal.amount, deal.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    {deal.probability}%
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {deal.expected_close_date || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {deal.assigned_to ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Avatar className="size-5 border border-border">
                                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                    {getInitials(deal.assigned_to.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs truncate max-w-[120px]">
                                                                {deal.assigned_to.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild size="icon" variant="ghost" className="size-8">
                                                            <Link href={dealsRoute.show({ deal: deal.id }).url}>
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button asChild size="icon" variant="ghost" className="size-8">
                                                            <Link href={dealsRoute.edit({ deal: deal.id }).url}>
                                                                <Edit className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {deals.total > deals.per_page && (
                            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                                <div>
                                    Showing {deals.from} to {deals.to} of {deals.total} deals
                                </div>
                                <div className="flex items-center gap-1">
                                    {deals.links.map((link, idx) => (
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
                    </Card>
                )}
            </div>

            {/* Modal: Mark Closed Lost */}
            <Dialog open={lossDialogOpen} onOpenChange={setLossDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <XCircle className="size-5" />
                            Mark Opportunity as Closed Lost
                        </DialogTitle>
                        <DialogDescription>
                            Please provide the primary reason for losing &quot;{dealForLoss?.title}&quot; to maintain pipeline analytics integrity.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="lossReason">Reason for Loss</Label>
                            <Select value={lossReason} onValueChange={setLossReason}>
                                <SelectTrigger id="lossReason">
                                    <SelectValue placeholder="Select primary reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Budget constraints">Budget constraints</SelectItem>
                                    <SelectItem value="Competitor selected">Competitor selected</SelectItem>
                                    <SelectItem value="Chose internal team">Chose internal team</SelectItem>
                                    <SelectItem value="Project delayed or cancelled">Project delayed or cancelled</SelectItem>
                                    <SelectItem value="Feature / scope mismatch">Feature / scope mismatch</SelectItem>
                                    <SelectItem value="Unresponsive client">Unresponsive client</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lossNotes">Debrief Notes (Optional)</Label>
                            <Input
                                id="lossNotes"
                                placeholder="Additional details or context..."
                                value={lossNotes}
                                onChange={(e) => setLossNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLossDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmMarkLost}>
                            Confirm Closed Lost
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Archive Deal */}
            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Archive Sales Deal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive &quot;{dealToArchive?.title}&quot;? Archived deals can be restored later by an administrator or manager.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Deal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales Pipeline',
        href: dealsRoute.index.url(),
    },
];

DealsIndex.layout = {
    breadcrumbs,
};
