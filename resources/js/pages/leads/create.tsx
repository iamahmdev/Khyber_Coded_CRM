import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, DollarSign, Loader2, Mail, Phone, Plus, Target, User } from 'lucide-react';
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

interface LeadsCreateProps {
    statuses: Array<{ value: string; label: string }>;
    sources: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
    assignees: Array<{ id: number; name: string; email: string; role: string }>;
    defaultAssigneeId: number | null;
}

export default function LeadsCreate({
    statuses,
    sources,
    priorities,
    assignees,
    defaultAssigneeId,
}: LeadsCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        source: 'website',
        status: 'new',
        priority: 'medium',
        estimated_value: '',
        currency: 'USD',
        assigned_to: defaultAssigneeId ? String(defaultAssigneeId) : '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(leadsRoute.store.url());
    };

    return (
        <>
            <Head title="Create New Lead" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Lead</h1>
                        <p className="text-sm text-muted-foreground">
                            Record a prospective client inquiry and assign it to your sales pipeline.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href={leadsRoute.index.url()}>
                            <ArrowLeft className="size-4" />
                            Back to Leads
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
                            <CardDescription>
                                Details about the primary prospect or stakeholder.
                            </CardDescription>
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
                                    placeholder="e.g. John Doe or Dr. Sarah Jenkins"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
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
                                        placeholder="e.g. Apex Logistics Ltd"
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
                                    placeholder="e.g. Chief Marketing Officer"
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
                                        placeholder="prospect@company.com"
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
                                        placeholder="+1 (555) 000-0000"
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
                                Set pipeline stage, deal priority, and expected monetary value.
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
                                        placeholder="5000.00"
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
                                Source attribution and sales representative owner.
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
                                    placeholder="Enter initial client conversation details, project scope, or requirements..."
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
                            <Link href={leadsRoute.index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            Create Lead
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leads',
        href: leadsRoute.index.url(),
    },
    {
        title: 'Create Lead',
        href: leadsRoute.create.url(),
    },
];

LeadsCreate.layout = {
    breadcrumbs,
};
