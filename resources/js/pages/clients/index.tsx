import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    Briefcase,
    Building2,
    Eye,
    Globe,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Sparkles,
    User,
    UserCheck,
    Users,
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
import clientsRoute from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

interface ClientItem {
    id: number;
    name: string;
    industry: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string;
    status: string;
    status_label: string;
    status_badge_class: string;
    contacts_count: number;
    primary_contact: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        title: string | null;
    } | null;
    account_manager: {
        id: number;
        name: string;
        email: string;
    } | null;
    is_from_lead: boolean;
    created_at: string;
    is_archived: boolean;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedClients {
    data: ClientItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface ClientsIndexProps {
    clients: PaginatedClients;
    filters: {
        search: string;
        status: string;
        industry: string;
        account_manager: string;
        view: string;
        sort: string;
        direction: string;
    };
    metrics: {
        total: number;
        active: number;
        new_this_month: number;
        from_leads: number;
        total_contacts: number;
    };
    statuses: Array<{ value: string; label: string; badgeClass: string }>;
    industries: string[];
    teamMembers: Array<{ id: number; name: string; email: string; role: string }>;
    canCreate: boolean;
}

export default function ClientsIndex({
    clients,
    filters,
    metrics,
    statuses,
    industries,
    teamMembers,
    canCreate,
}: ClientsIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; info?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedIndustry, setSelectedIndustry] = useState(filters.industry || 'all');
    const [selectedManager, setSelectedManager] = useState(filters.account_manager || 'all');
    const [selectedView, setSelectedView] = useState(filters.view || 'active');

    const [clientToArchive, setClientToArchive] = useState<ClientItem | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    const handleFilterChange = (params: {
        search?: string;
        status?: string;
        industry?: string;
        account_manager?: string;
        view?: string;
    }) => {
        const query: Record<string, string> = {};

        const s = params.search !== undefined ? params.search : search;
        const st = params.status !== undefined ? params.status : selectedStatus;
        const ind = params.industry !== undefined ? params.industry : selectedIndustry;
        const mgr = params.account_manager !== undefined ? params.account_manager : selectedManager;
        const vw = params.view !== undefined ? params.view : selectedView;

        if (s) query.search = s;
        if (st && st !== 'all') query.status = st;
        if (ind && ind !== 'all') query.industry = ind;
        if (mgr && mgr !== 'all') query.account_manager = mgr;
        if (vw && vw !== 'active') query.view = vw;

        router.get(clientsRoute.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedIndustry('all');
        setSelectedManager('all');
        setSelectedView('active');
        router.get(clientsRoute.index.url(), {}, { preserveScroll: true, replace: true });
    };

    const confirmArchive = () => {
        if (!clientToArchive) return;

        router.delete(clientsRoute.destroy.url({ client: clientToArchive.id }), {
            preserveScroll: true,
            onSuccess: () => setClientToArchive(null),
        });
    };

    const confirmRestore = (clientId: number) => {
        router.post(clientsRoute.restore.url({ id: clientId }), {}, {
            preserveScroll: true,
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
        selectedIndustry !== 'all' ? selectedIndustry : '',
        selectedManager !== 'all' ? selectedManager : '',
        selectedView !== 'active' ? selectedView : '',
    ].filter(Boolean).length;

    return (
        <>
            <Head title="Clients & Contacts" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Clients & Contacts</h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                Module 6
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manage organizations, client company profiles, and key stakeholder contacts.
                        </p>
                    </div>

                    {canCreate && (
                        <Button asChild className="gap-2 self-start sm:self-auto shadow-sm">
                            <Link href={clientsRoute.create.url()}>
                                <Plus className="size-4" />
                                Add New Client
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Building2 className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total}</div>
                            <CardDescription className="text-xs">Client organizations</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                            <UserCheck className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {metrics.active}
                            </div>
                            <CardDescription className="text-xs">In active contract/service</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                            <Users className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_contacts}</div>
                            <CardDescription className="text-xs">Associated people</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">From Converted Leads</CardTitle>
                            <Sparkles className="size-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {metrics.from_leads}
                            </div>
                            <CardDescription className="text-xs">Won via pipeline</CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                            <Briefcase className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.new_this_month}</div>
                            <CardDescription className="text-xs">Recent acquisitions</CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Search */}
                            <div className="relative sm:col-span-2 lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by client name, email, phone, city..."
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

                            {/* Industry */}
                            <div>
                                <Select
                                    value={selectedIndustry}
                                    onValueChange={(val) => {
                                        setSelectedIndustry(val);
                                        handleFilterChange({ industry: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Industries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Industries</SelectItem>
                                        {industries.map((ind) => (
                                            <SelectItem key={ind} value={ind}>
                                                {ind}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Account Manager */}
                            <div>
                                <Select
                                    value={selectedManager}
                                    onValueChange={(val) => {
                                        setSelectedManager(val);
                                        handleFilterChange({ account_manager: val });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Account Managers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Account Managers</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {teamMembers.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* View Options & Clear */}
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
                                    Active Clients
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

                {/* Clients Table Card */}
                <Card className="border-border/60 shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5">Client Organization</th>
                                    <th className="px-6 py-3.5">Industry</th>
                                    <th className="px-6 py-3.5">Primary Contact</th>
                                    <th className="px-6 py-3.5">Location</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Account Manager</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {clients.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Building2 className="size-10 text-muted-foreground/40" />
                                                <h3 className="text-base font-medium text-foreground">
                                                    No clients found
                                                </h3>
                                                <p className="max-w-sm text-sm text-muted-foreground">
                                                    {activeFilterCount > 0
                                                        ? 'No clients matched your filter criteria.'
                                                        : 'Start by creating client accounts or converting qualified leads.'}
                                                </p>
                                                {canCreate && (
                                                    <Button asChild size="sm" className="mt-2 gap-1.5">
                                                        <Link href={clientsRoute.create.url()}>
                                                            <Plus className="size-4" />
                                                            Add New Client
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    clients.data.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="transition-colors hover:bg-muted/30 group"
                                        >
                                            {/* Client Organization */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9 border border-border/60">
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={clientsRoute.show.url({ client: client.id })}
                                                                className="font-medium text-foreground hover:underline"
                                                            >
                                                                {client.name}
                                                            </Link>
                                                            {client.is_from_lead && (
                                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-teal-600 border-teal-500/20 bg-teal-500/10">
                                                                    From Lead
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {client.website && (
                                                                <a
                                                                    href={client.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:underline flex items-center gap-1"
                                                                >
                                                                    <Globe className="size-3" />
                                                                    Website
                                                                </a>
                                                            )}
                                                            {client.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="size-3" />
                                                                    {client.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Industry */}
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {client.industry ? (
                                                    <span className="rounded bg-muted px-2 py-1">
                                                        {client.industry}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/60">—</span>
                                                )}
                                            </td>

                                            {/* Primary Contact */}
                                            <td className="px-6 py-4">
                                                {client.primary_contact ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground text-xs">
                                                            {client.primary_contact.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {client.primary_contact.title || client.primary_contact.email || client.primary_contact.phone || 'Primary'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">
                                                        No contacts
                                                    </span>
                                                )}
                                            </td>

                                            {/* Location */}
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {client.city ? (
                                                    <span>{client.city}, {client.country}</span>
                                                ) : (
                                                    <span>{client.country}</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${client.status_badge_class}`}
                                                >
                                                    {client.status_label}
                                                </span>
                                            </td>

                                            {/* Account Manager */}
                                            <td className="px-6 py-4">
                                                {client.account_manager ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                        <User className="size-3 text-muted-foreground" />
                                                        <span>{client.account_manager.name}</span>
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
                                                        {client.can.view && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={clientsRoute.show.url({ client: client.id })}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="size-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {client.can.update && !client.is_archived && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={clientsRoute.edit.url({ client: client.id })}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Briefcase className="size-4" />
                                                                    Edit Client
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        {client.is_archived && client.can.restore && (
                                                            <DropdownMenuItem
                                                                onClick={() => confirmRestore(client.id)}
                                                                className="gap-2 cursor-pointer text-blue-600 dark:text-blue-400"
                                                            >
                                                                <RotateCcw className="size-4" />
                                                                Restore Client
                                                            </DropdownMenuItem>
                                                        )}

                                                        {!client.is_archived && client.can.delete && (
                                                            <DropdownMenuItem
                                                                onClick={() => setClientToArchive(client)}
                                                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                            >
                                                                <Archive className="size-4" />
                                                                Archive Client
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
                    {clients.total > clients.per_page && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row text-xs text-muted-foreground">
                            <div>
                                Showing <span className="font-medium text-foreground">{clients.from}</span> to{' '}
                                <span className="font-medium text-foreground">{clients.to}</span> of{' '}
                                <span className="font-medium text-foreground">{clients.total}</span> clients
                            </div>

                            <div className="flex items-center gap-1">
                                {clients.links.map((link, idx) => {
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
            <Dialog open={!!clientToArchive} onOpenChange={(open) => !open && setClientToArchive(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{clientToArchive?.name}</strong>? The client organization
                            and its contacts will be archived and can be restored at any time.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClientToArchive(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients & Contacts',
        href: clientsRoute.index.url(),
    },
];

ClientsIndex.layout = {
    breadcrumbs,
};
