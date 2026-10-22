import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, DollarSign, Layers, Plus, Save, Target, User } from 'lucide-react';
import { useState } from 'react';
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
import dealsRoute from '@/routes/deals';
import type { BreadcrumbItem } from '@/types';

interface ClientItem {
    id: number;
    name: string;
    contacts: Array<{
        id: number;
        name: string;
        title: string | null;
    }>;
}

interface LeadItem {
    id: number;
    name: string;
    company: string | null;
}

interface StageOption {
    value: string;
    label: string;
    default_probability: number;
}

interface PriorityOption {
    value: string;
    label: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface DealsCreateProps {
    clients: ClientItem[];
    leads: LeadItem[];
    teamMembers: TeamMember[];
    stages: StageOption[];
    priorities: PriorityOption[];
    defaultClientId: number | null;
    defaultLeadId: number | null;
    defaultAssigneeId: number | null;
}

export default function DealsCreate({
    clients,
    leads,
    teamMembers,
    stages,
    priorities,
    defaultClientId,
    defaultLeadId,
    defaultAssigneeId,
}: DealsCreateProps) {
    const defaultStage = 'new';
    const initialProb = stages.find((s) => s.value === defaultStage)?.default_probability ?? 10;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        client_id: defaultClientId ? defaultClientId.toString() : '',
        lead_id: defaultLeadId ? defaultLeadId.toString() : '',
        contact_id: '',
        stage: defaultStage,
        priority: 'medium',
        amount: '',
        currency: 'USD',
        probability: initialProb.toString(),
        expected_close_date: '',
        assigned_to: defaultAssigneeId ? defaultAssigneeId.toString() : '',
        notes: '',
    });

    const selectedClient = clients.find((c) => c.id.toString() === data.client_id);

    const handleStageChange = (newStage: string) => {
        const found = stages.find((s) => s.value === newStage);
        setData((prev) => ({
            ...prev,
            stage: newStage,
            probability: found ? found.default_probability.toString() : prev.probability,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(dealsRoute.store.url());
    };

    return (
        <>
            <Head title="Create New Sales Opportunity" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="icon" className="size-9 shrink-0">
                        <Link href={dealsRoute.index.url()}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Sales Opportunity</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new prospective deal, assign ownership, and define target close value.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Deal Identification */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Deal Overview</CardTitle>
                            <CardDescription>Opportunity title and client/lead linkage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">
                                    Opportunity Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Enterprise Cloud ERP Migration & SLA"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Client Selection */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="client_id">Client Company / Organization</Label>
                                    <Select
                                        value={data.client_id}
                                        onValueChange={(val) => {
                                            setData((prev) => ({
                                                ...prev,
                                                client_id: val === 'none' ? '' : val,
                                                contact_id: '',
                                            }));
                                        }}
                                    >
                                        <SelectTrigger id="client_id">
                                            <SelectValue placeholder="Select existing client..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Individual / Unassigned)</SelectItem>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.client_id} />
                                </div>

                                {/* Contact Person Selection (based on client) */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact_id">Primary Deal Contact</Label>
                                    <Select
                                        value={data.contact_id}
                                        disabled={!selectedClient || selectedClient.contacts.length === 0}
                                        onValueChange={(val) => setData('contact_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="contact_id">
                                            <SelectValue
                                                placeholder={
                                                    !selectedClient
                                                        ? 'Select a client first'
                                                        : selectedClient.contacts.length === 0
                                                          ? 'No contacts on this client'
                                                          : 'Select contact person...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {selectedClient?.contacts.map((contact) => (
                                                <SelectItem key={contact.id} value={contact.id.toString()}>
                                                    {contact.name} {contact.title ? `(${contact.title})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.contact_id} />
                                </div>
                            </div>

                            {/* Originating Lead (Optional) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="lead_id">Linked Lead Origin (Optional)</Label>
                                <Select
                                    value={data.lead_id}
                                    onValueChange={(val) => setData('lead_id', val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger id="lead_id">
                                        <SelectValue placeholder="Select originating lead if applicable..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {leads.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>
                                                #{l.id} - {l.name} {l.company ? `(${l.company})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.lead_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financials & Probability */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Deal Financials & Pipeline Stage</CardTitle>
                            <CardDescription>Value projection, win likelihood, and pipeline position</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Deal Amount */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="amount">
                                        Deal Amount ($) <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="15000.00"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.amount} />
                                </div>

                                {/* Currency */}
                                <div className="space-y-1.5">
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
                                            <SelectItem value="AED">AED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.currency} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Stage Selection */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="stage">
                                        Pipeline Stage <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.stage} onValueChange={handleStageChange}>
                                        <SelectTrigger id="stage">
                                            <SelectValue placeholder="Stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stages.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.stage} />
                                </div>

                                {/* Win Probability */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="probability">Win Probability (%)</Label>
                                    <Input
                                        id="probability"
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="50"
                                        value={data.probability}
                                        onChange={(e) => setData('probability', e.target.value)}
                                    />
                                    <InputError message={errors.probability} />
                                </div>

                                {/* Priority */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="priority">
                                        Priority <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(val) => setData('priority', val)}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Priority" />
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
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Expected Close Date */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="expected_close_date">Expected Target Close Date</Label>
                                    <Input
                                        id="expected_close_date"
                                        type="date"
                                        value={data.expected_close_date}
                                        onChange={(e) => setData('expected_close_date', e.target.value)}
                                    />
                                    <InputError message={errors.expected_close_date} />
                                </div>

                                {/* Deal Owner */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="assigned_to">Assigned Deal Owner</Label>
                                    <Select
                                        value={data.assigned_to}
                                        onValueChange={(val) => setData('assigned_to', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="assigned_to">
                                            <SelectValue placeholder="Assign account manager / sales rep..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {teamMembers.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name} ({m.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.assigned_to} />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="notes">Deal Scope & Commercial Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    placeholder="Enter initial client requirements, key milestones, proposal highlights, or discussion points..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={dealsRoute.index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="size-4" />
                            {processing ? 'Saving Deal...' : 'Create Sales Opportunity'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales Pipeline',
        href: dealsRoute.index.url(),
    },
    {
        title: 'New Deal',
        href: '#',
    },
];

DealsCreate.layout = {
    breadcrumbs,
};
