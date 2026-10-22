import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Globe,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
} from 'lucide-react';
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
import clientsRoute from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

interface ClientEditData {
    id: number;
    name: string;
    industry: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    status: string;
    account_manager_id: number | null;
    notes: string;
}

interface ClientsEditProps {
    client: ClientEditData;
    statuses: Array<{ value: string; label: string }>;
    industries: string[];
    teamMembers: Array<{ id: number; name: string; email: string; role: string }>;
}

export default function ClientsEdit({
    client,
    statuses,
    industries,
    teamMembers,
}: ClientsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: client.name || '',
        industry: client.industry || '',
        website: client.website || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        postal_code: client.postal_code || '',
        country: client.country || 'Pakistan',
        status: client.status || 'active',
        account_manager_id: client.account_manager_id ? String(client.account_manager_id) : '',
        notes: client.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(clientsRoute.update.url({ client: client.id }));
    };

    return (
        <>
            <Head title={`Edit Client: ${client.name}`} />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Client</h1>
                        <p className="text-sm text-muted-foreground">
                            Update company profile details, addresses, and account management.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href={clientsRoute.show.url({ client: client.id })}>
                            <ArrowLeft className="size-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Organization Details */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="size-4 text-primary" />
                                Organization Details
                            </CardTitle>
                            <CardDescription>
                                Legal or trading entity name, industry, and account status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Client Name */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="name">
                                    Client / Company Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Industry */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="industry">Industry / Sector</Label>
                                <Select
                                    value={data.industry || 'none'}
                                    onValueChange={(val) => setData('industry', val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger id="industry">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not Specified</SelectItem>
                                        {industries.map((ind) => (
                                            <SelectItem key={ind} value={ind}>
                                                {ind}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.industry} />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">
                                    Client Status <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
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

                            {/* Website */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="website">Website URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        type="url"
                                        className="pl-9"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.website} />
                            </div>

                            {/* Corporate Email */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Company Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Corporate Phone */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">Company Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="pl-9"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            {/* Account Manager */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="account_manager_id">Account Manager</Label>
                                <Select
                                    value={data.account_manager_id || 'unassigned'}
                                    onValueChange={(val) => setData('account_manager_id', val === 'unassigned' ? '' : val)}
                                >
                                    <SelectTrigger id="account_manager_id">
                                        <SelectValue placeholder="Assign team member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {teamMembers.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.name} ({m.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.account_manager_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address & Location */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="size-4 text-primary" />
                                Address & Billing Location
                            </CardTitle>
                            <CardDescription>Primary operating office and jurisdiction.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                                <InputError message={errors.city} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="state">State / Province</Label>
                                <Input
                                    id="state"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                />
                                <InputError message={errors.state} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                />
                                <InputError message={errors.postal_code} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                />
                                <InputError message={errors.country} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase className="size-4 text-primary" />
                                Internal Notes & Briefing
                            </CardTitle>
                            <CardDescription>Internal agency background, project details, or terms.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                id="notes"
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            <InputError message={errors.notes} />
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={clientsRoute.show.url({ client: client.id })}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            <Save className="size-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ClientsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Clients & Contacts',
            href: clientsRoute.index.url(),
        },
        {
            title: 'Edit Client',
            href: '#',
        },
    ],
};
