import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    DollarSign,
    Loader2,
    Mail,
    Phone,
    Save,
    Target,
    User,
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
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface LeadEditData {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    title: string;
    source: string;
    status: string;
    priority: string;
    estimated_value: number | string;
    currency: string;
    assigned_to: number | null;
    notes: string;
    lost_reason: string;
}

interface LeadsEditProps {
    lead: LeadEditData;
    statuses: Array<{ value: string; label: string }>;
    sources: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
    assignees: Array<{ id: number; name: string; email: string; role: string }>;
}

export default function LeadsEdit({
    lead,
    statuses,
    sources,
    priorities,
    assignees,
}: LeadsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: lead.name || '',
        company: lead.company || '',
        title: lead.title || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        estimated_value: lead.estimated_value !== '' && lead.estimated_value !== null ? String(lead.estimated_value) : '',
        currency: lead.currency || 'USD',
        assigned_to: lead.assigned_to ? String(lead.assigned_to) : '',
        notes: lead.notes || '',
        lost_reason: lead.lost_reason || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(leadsRoute.update.url({ lead: lead.id }));
    };

    return (
        <>
            <Head title={`Edit Lead: ${lead.name}`} />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Lead</h1>
                        <p className="text-sm text-muted-foreground">
                            Update lead information, status transitions, and ownership.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href={leadsRoute.show.url({ lead: lead.id })}>
                            <ArrowLeft className="size-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Primary Contact Details */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="size-4 text-primary" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>Primary prospect and business identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="name">
                                    Contact Name <span className="text-destructive">*</span>
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

                            {/* Company */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="company">Company / Organization</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="company"
                                        type="text"
                                        className="pl-9"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.company} />
                            </div>

                            {/* Job Title */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="title">Job Title / Designation</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email Address</Label>
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

                            {/* Phone */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
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
                        </CardContent>
                    </Card>

                    {/* Pipeline & Valuation */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="size-4 text-primary" />
                                Pipeline & Valuation
                            </CardTitle>
                            <CardDescription>
                                Current sales pipeline stage, priority, and expected monetary value.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Status */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">
                                    Pipeline Stage / Status <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select pipeline stage" />
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

                            {/* Priority */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="priority">
                                    Priority Level <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(val) => setData('priority', val)}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.priority} />
                            </div>

                            {/* Estimated Value */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="estimated_value">Estimated Deal Value</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="estimated_value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-9"
                                        value={data.estimated_value}
                                        onChange={(e) => setData('estimated_value', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.estimated_value} />
                            </div>

                            {/* Currency */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={data.currency}
                                    onValueChange={(val) => setData('currency', val)}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="PKR">PKR (Rs)</SelectItem>
                                        <SelectItem value="AED">AED (AED)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.currency} />
                            </div>

                            {/* Lost Reason (Conditional) */}
                            {data.status === 'lost' && (
                                <div className="flex flex-col gap-2 sm:col-span-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                                    <Label htmlFor="lost_reason" className="text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
                                        <AlertCircle className="size-4" />
                                        Reason Lost <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lost_reason"
                                        type="text"
                                        placeholder="e.g. Budget constraints, selected competitor, project postponed..."
                                        value={data.lost_reason}
                                        onChange={(e) => setData('lost_reason', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.lost_reason} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Attribution & Assignment */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="size-4 text-primary" />
                                Attribution & Assignment
                            </CardTitle>
                            <CardDescription>
                                Source channel and team member assignment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            {/* Source */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="source">
                                    Acquisition Source <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.source}
                                    onValueChange={(val) => setData('source', val)}
                                >
                                    <SelectTrigger id="source">
                                        <SelectValue placeholder="Select lead source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sources.map((src) => (
                                            <SelectItem key={src.value} value={src.value}>
                                                {src.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.source} />
                            </div>

                            {/* Assigned To */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="assigned_to">Assignee / Sales Rep</Label>
                                <Select
                                    value={data.assigned_to || 'unassigned'}
                                    onValueChange={(val) => setData('assigned_to', val === 'unassigned' ? '' : val)}
                                >
                                    <SelectTrigger id="assigned_to">
                                        <SelectValue placeholder="Select team member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {assignees.map((a) => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {a.name} ({a.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.assigned_to} />
                            </div>

                            {/* Notes */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="notes">Notes & Requirements</Label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={leadsRoute.show.url({ lead: lead.id })}>Cancel</Link>
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

LeadsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Leads',
            href: leadsRoute.index.url(),
        },
        {
            title: 'Edit Lead',
            href: '#',
        },
    ],
};
