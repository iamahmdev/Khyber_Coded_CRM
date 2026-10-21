import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import usersRoute from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

interface UsersCreateProps {
    roles: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
}

export default function UsersCreate({ roles, statuses }: UsersCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        status: 'active',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(usersRoute.store.url());
    };

    return (
        <>
            <Head title="Add New User" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new user account and set their role and permissions.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href={usersRoute.index.url()}>
                            <ArrowLeft className="size-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">User Information</CardTitle>
                        <CardDescription>
                            All fields marked with an asterisk (*) are required.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g. Sarah Khan"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="sarah@example.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+92 300 1234567"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(val) => setData('role', val)}
                                    >
                                        <SelectTrigger id="role" className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="status">Account Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val) => setData('status', val)}
                                    >
                                        <SelectTrigger id="status" className="w-full">
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <Button asChild variant="outline">
                                    <Link href={usersRoute.index.url()}>Cancel</Link>
                                </Button>

                                <Button type="submit" disabled={processing} className="gap-2">
                                    {processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="size-4" />
                                    )}
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users & Roles',
        href: usersRoute.index.url(),
    },
    {
        title: 'Add New User',
        href: usersRoute.create.url(),
    },
];

UsersCreate.layout = {
    breadcrumbs,
};
