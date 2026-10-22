import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    Building2,
    CheckCircle2,
    DollarSign,
    Edit,
    Eye,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    User,
    UserCheck,
    X,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface LeadItem {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    title: string | null;
    source: string;
    source_label: string;
    status: string;
    status_label: string;
    status_badge_class: string;
    priority: string;
    priority_label: string;
    priority_badge_class: string;
    estimated_value: number | null;
    currency: string;
    formatted_value: string | null;
    assigned_to: {
        id: number;
        name: string;
        email: string;
    } | null;
    created_at: string;
    is_archived: boolean;
    is_convertible: boolean;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        convert: boolean;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLeads {
    data: LeadItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface LeadsIndexProps {
    leads: PaginatedLeads;
    filters: {
        search: string;
        status: string;
        source: string;
        priority: string;
        assigned_to: string;
        view: string;
        sort: string;
        direction: string;
    };
    metrics: {
        total: number;
        qualified: number;
        converted: number;
        new_this_week: number;
        pipeline_value: number;
        formatted_pipeline_value: string;
        conversion_rate: number;
    };
    statuses: Array<{ value: string; label: string; badgeClass: string }>;
    sources: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string; badgeClass: string }>;
    assignees: Array<{ id: number; name: string; email: string; role: string }>;
    canCreate: boolean;
}

export default function LeadsIndex({
    leads,
    filters,
    metrics,
    statuses,
    sources,
    priorities,
    assignees,
    canCreate,
}: LeadsIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedSource, setSelectedSource] = useState(filters.source || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedAssignee, setSelectedAssignee] = useState(filters.assigned_to || 'all');
    const [selectedView, setSelectedView] = useState(filters.view || 'active');

    const [leadToArchive, setLeadToArchive] = useState<LeadItem | null>(null);
    const [leadToConvert, setLeadToConvert] = useState<LeadItem | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleFilterChange = (params: {
        search?: string;
        status?: string;
        source?: string;
        priority?: string;
        assigned_to?: string;
        view?: string;
    }) => {
        const query: Record<string, string> = {};

        const s = params.search !== undefined ? params.search : search;
        const st = params.status !== undefined ? params.status : selectedStatus;
        const src = params.source !== undefined ? params.source : selectedSource;
        const pr = params.priority !== undefined ? params.priority : selectedPriority;
        const asg = params.assigned_to !== undefined ? params.assigned_to : selectedAssignee;
        const vw = params.view !== undefined ? params.view : selectedView;

        if (s) query.search = s;
        if (st && st !== 'all') query.status = st;
        if (src && src !== 'all') query.source = src;
        if (pr && pr !== 'all') query.priority = pr;
        if (asg && asg !== 'all') query.assigned_to = asg;
        if (vw && vw !== 'active') query.view = vw;

        router.get(leadsRoute.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedSource('all');
        setSelectedPriority('all');
        setSelectedAssignee('all');
        setSelectedView('active');
        router.get(leadsRoute.index.url(), {}, { preserveScroll: true, replace: true });
    };

    const confirmArchive = () => {
        if (!leadToArchive) return;

        router.delete(leadsRoute.destroy.url({ lead: leadToArchive.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setLeadToArchive(null);
            },
        });
    };

    const confirmRestore = (leadId: number) => {
        router.post(leadsRoute.restore.url({ id: leadId }), {}, {
            preserveScroll: true,
        });
    };

    const confirmConvert = () => {
        if (!leadToConvert) return;

        router.post(leadsRoute.convert.url({ lead: leadToConvert.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLeadToConvert(null);
            },
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const activeFilterCount = [
        search,
        selectedStatus !== 'all' ? selectedStatus : '',
        selectedSource !== 'all' ? selectedSource : '',
        selectedPriority !== 'all' ? selectedPriority : '',
        selectedAssignee !== 'all' ? selectedAssignee : '',
        selectedView !== 'active' ? selectedView : '',
    ].filter(Boolean).length;

    return (
        <>
            <Head title="Leads Management" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                Module 5
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Capture, qualify, and track business opportunities through the sales pipeline.
                        </p>
                    </div>

                    {canCreate && (
                        <Button asChild className="gap-2 self-start sm:self-auto shadow-sm">
                            <Link href={leadsRoute.create.url()}>
                                <Plus className="size-4" />
                                Add New Lead
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                            <Target className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total}</div>
                            <CardDescription className="text-xs">All records in pipeline</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                            <DollarSign className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {metrics.formatted_pipeline_value}
                            </div>
                            <CardDescription className="text-xs">Active estimated value</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                            <UserCheck className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.qualified}</div>
                            <CardDescription className="text-xs">High intent prospects</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                            <Sparkles className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.new_this_week}</div>
                            <CardDescription className="text-xs">Recent incoming inquiries</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                            <TrendingUp className="size-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.conversion_rate}%</div>
                            <CardDescription className="text-xs">
                                {metrics.converted} won / converted
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            {/* Search */}
                            <div className="relative sm:col-span-2 lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, company, email..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleFilterChange({ search: e.target.value });
                                    }}
                                    className="pl-9"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(val) => {
                                        setSelectedStatus(val);
                                        handleFilterChange({ status: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Source */}
                            <div>
                                <Select
                                    value={selectedSource}
                                    onValueChange={(val) => {
                                        setSelectedSource(val);
                                        handleFilterChange({ source: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Sources" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sources</SelectItem>
                                        {sources.map((src) => (
                                            <SelectItem key={src.value} value={src.value}>
                                                {src.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div>
                                <Select
                                    value={selectedPriority}
                                    onValueChange={(val) => {
                                        setSelectedPriority(val);
                                        handleFilterChange({ priority: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Priorities" />
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
                            </div>

                            {/* Assignee */}
                            <div>
                                <Select
                                    value={selectedAssignee}
                                    onValueChange={(val) => {
                                        setSelectedAssignee(val);
                                        handleFilterChange({ assigned_to: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Owners" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Owners</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {assignees.map((a) => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* View Mode & Clear Filters */}
                        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">View:</span>
                                <Button
                                    variant={selectedView === 'active' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                        setSelectedView('active');
                                        handleFilterChange({ view: 'active' });
                                    }}
                                >
                                    Active Pipeline
                                </Button>
                                <Button
                                    variant={selectedView === 'archived' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                        setSelectedView('archived');
                                        handleFilterChange({ view: 'archived' });
                                    }}
                                >
                                    Archived
                                </Button>
                                <Button
                                    variant={selectedView === 'all' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                        setSelectedView('all');
                                        handleFilterChange({ view: 'all' });
                                    }}
                                >
                                    All Records
                                </Button>
                            </div>

                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1 size-3" />
                                    Clear filters ({activeFilterCount})
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Leads Table Card */}
                <Card className="border-border/60 shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5">Lead Contact</th>
                                    <th className="px-6 py-3.5">Company</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Priority</th>
                                    <th className="px-6 py-3.5">Estimated Value</th>
                                    <th className="px-6 py-3.5">Source</th>
                                    <th className="px-6 py-3.5">Assigned To</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {leads.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Target className="size-10 text-muted-foreground/40" />
                                                <h3 className="text-base font-medium text-foreground">
                                                    No leads found
                                                </h3>
                                                <p className="max-w-sm text-sm text-muted-foreground">
                                                    {activeFilterCount > 0
                                                        ? 'No leads matched your filter criteria. Try adjusting your search query.'
                                                        : 'Start by capturing inquiries and sales leads into your CRM.'}
                                                </p>
                                                {canCreate && (
                                                    <Button asChild size="sm" className="mt-2 gap-1.5">
                                                        <Link href={leadsRoute.create.url()}>
                                                            <Plus className="size-4" />
                                                            Create Lead
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.data.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="transition-colors hover:bg-muted/30 group"
                                        >
                                            {/* Lead Contact */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9 border border-border/60">
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                            {getInitials(lead.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={leadsRoute.show.url({ lead: lead.id })}
                                                            className="font-medium text-foreground hover:underline"
                                                        >
                                                            {lead.name}
                                                        </Link>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {lead.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="size-3" />
                                                                    {lead.email}
                                                                </span>
                                                            )}
                                                            {lead.phone && !lead.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="size-3" />
                                                                    {lead.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company */}
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {lead.company ? (
                                                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                        <Building2 className="size-3.5 text-muted-foreground" />
                                                        <span>{lead.company}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">—</span>
                                                )}
                                                {lead.title && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {lead.title}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${lead.status_badge_class}`}
                                                >
                                                    {lead.status_label}
                                                </span>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${lead.priority_badge_class}`}
                                                >
                                                    {lead.priority_label}
                                                </span>
                                            </td>

                                            {/* Estimated Value */}
                                            <td className="px-6 py-4 font-mono font-medium">
                                                {lead.formatted_value ? (
                                                    <span className="text-foreground">
                                                        {lead.formatted_value}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">—</span>
                                                )}
                                            </td>

                                            {/* Source */}
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                <span className="rounded bg-muted px-2 py-1">
                                                    {lead.source_label}
                                                </span>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="px-6 py-4">
                                                {lead.assigned_to ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                        <User className="size-3 text-muted-foreground" />
                                                        <span>{lead.assigned_to.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="rounded-sm border border-dashed border-muted-foreground/30 px-1.5 py-0.5 text-xs text-muted-foreground">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        {lead.can.view && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={leadsRoute.show.url({ lead: lead.id })}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="size-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {lead.can.update && !lead.is_archived && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={leadsRoute.edit.url({ lead: lead.id })}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Edit className="size-4" />
                                                                    Edit Lead
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {lead.can.convert && !lead.is_archived && lead.status !== 'converted' && (
                                                            <DropdownMenuItem
                                                                onClick={() => setLeadToConvert(lead)}
                                                                className="gap-2 cursor-pointer text-teal-600 dark:text-teal-400 font-medium"
                                                            >
                                                                <CheckCircle2 className="size-4" />
                                                                Convert to Client
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        {lead.is_archived && lead.can.restore && (
                                                            <DropdownMenuItem
                                                                onClick={() => confirmRestore(lead.id)}
                                                                className="gap-2 cursor-pointer text-blue-600 dark:text-blue-400"
                                                            >
                                                                <RotateCcw className="size-4" />
                                                                Restore Lead
                                                            </DropdownMenuItem>
                                                        )}

                                                        {!lead.is_archived && lead.can.delete && (
                                                            <DropdownMenuItem
                                                                onClick={() => setLeadToArchive(lead)}
                                                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                            >
                                                                <Archive className="size-4" />
                                                                Archive Lead
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {leads.total > leads.per_page && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row text-xs text-muted-foreground">
                            <div>
                                Showing <span className="font-medium text-foreground">{leads.from}</span> to{' '}
                                <span className="font-medium text-foreground">{leads.to}</span> of{' '}
                                <span className="font-medium text-foreground">{leads.total}</span> leads
                            </div>

                            <div className="flex items-center gap-1">
                                {leads.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 text-muted-foreground/40 text-xs"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Archive Confirmation Dialog */}
            <Dialog open={!!leadToArchive} onOpenChange={(open) => !open && setLeadToArchive(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Lead</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{leadToArchive?.name}</strong>{' '}
                            {leadToArchive?.company ? `from ${leadToArchive.company}` : ''}? The lead will be soft-deleted
                            from active pipeline views and can be restored at any time.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLeadToArchive(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Lead
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert to Client Confirmation Dialog */}
            <Dialog open={!!leadToConvert} onOpenChange={(open) => !open && setLeadToConvert(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-teal-500" />
                            Convert Lead to Client
                        </DialogTitle>
                        <DialogDescription>
                            Convert <strong>{leadToConvert?.name}</strong>{' '}
                            {leadToConvert?.company ? `(${leadToConvert.company})` : ''} into a converted lead. This prepares
                            the contact and company record for automatic onboarding in Module 6 (Clients & Contacts).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                        <div className="font-semibold text-foreground">Module 6 Ready:</div>
                        Status will be set to <strong>Converted</strong> and conversion timestamp recorded.
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLeadToConvert(null)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={confirmConvert}
                        >
                            Confirm Conversion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leads',
        href: leadsRoute.index.url(),
    },
];

LeadsIndex.layout = {
    breadcrumbs,
};
