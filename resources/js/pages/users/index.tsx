import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Edit,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    Users as UsersIcon,
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import usersRoute from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

interface UserListItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    role_label: string;
    status: string;
    status_label: string;
    created_at: string;
    can: {
        update: boolean;
        delete: boolean;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: UserListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface UsersIndexProps {
    users: PaginatedUsers;
    filters: {
        search: string;
        role: string;
        status: string;
        sort: string;
        direction: string;
    };
    metrics: {
        total: number;
        active: number;
        admins: number;
        staff: number;
    };
    roles: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    canCreate: boolean;
}

export default function UsersIndex({
    users,
    filters,
    metrics,
    roles,
    statuses,
    canCreate,
}: UsersIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);

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
        role?: string;
        status?: string;
    }) => {
        const query: Record<string, string> = {};

        const s = params.search !== undefined ? params.search : search;
        const r = params.role !== undefined ? params.role : selectedRole;
        const st = params.status !== undefined ? params.status : selectedStatus;

        if (s) query.search = s;
        if (r && r !== 'all') query.role = r;
        if (st && st !== 'all') query.status = st;

        router.get(usersRoute.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get(usersRoute.index.url(), {}, { preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!userToDelete) return;

        router.delete(usersRoute.destroy.url({ user: userToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setUserToDelete(null);
            },
        });
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

    const getStatusBadgeClass = (status: string) => {
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <Head title="Users & Roles" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage team members, define access levels, and maintain organizational security.
                        </p>
                    </div>

                    {canCreate && (
                        <Button asChild className="gap-2 self-start sm:self-auto">
                            <Link href={usersRoute.create.url()}>
                                <Plus className="size-4" />
                                Add New User
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <UsersIcon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total}</div>
                            <CardDescription>All accounts in CRM</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                            <UserCheck className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.active}</div>
                            <CardDescription>Currently authorized</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                            <Shield className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.admins}</div>
                            <CardDescription>Full access permissions</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                            <UsersIcon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.staff}</div>
                            <CardDescription>Operational CRM users</CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilterChange({ search });
                                }
                            }}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={selectedRole}
                            onValueChange={(val) => {
                                setSelectedRole(val);
                                handleFilterChange({ role: val });
                            }}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedStatus}
                            onValueChange={(val) => {
                                setSelectedStatus(val);
                                handleFilterChange({ status: val });
                            }}
                        >
                            <SelectTrigger className="w-[140px]">
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

                        {(search || selectedRole !== 'all' || selectedStatus !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="gap-1 text-muted-foreground"
                            >
                                <X className="size-4" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5">User</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Phone</th>
                                    <th className="px-6 py-3.5">Joined</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="transition-colors hover:bg-muted/30">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9 border">
                                                        <AvatarFallback className="text-xs font-semibold">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-foreground">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role_label}
                                                </Badge>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                                        user.status
                                                    )}`}
                                                >
                                                    {user.status_label}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground">
                                                {user.phone || '—'}
                                            </td>

                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {user.created_at}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {user.can.update && (
                                                        <Button asChild variant="ghost" size="icon" className="size-8">
                                                            <Link href={usersRoute.edit.url({ user: user.id })}>
                                                                <Edit className="size-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {user.can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setUserToDelete(user)}
                                                            className="size-8 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
                            <div className="text-xs text-muted-foreground">
                                Showing {users.from || 0} to {users.to || 0} of {users.total} users
                            </div>

                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            className="px-2 py-1.5 text-xs text-muted-foreground/50"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users & Roles',
        href: usersRoute.index.url(),
    },
];

UsersIndex.layout = {
    breadcrumbs,
};
