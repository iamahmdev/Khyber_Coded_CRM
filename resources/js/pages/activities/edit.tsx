import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, MapPin, Save, User } from 'lucide-react';
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
import activitiesRoute from '@/routes/activities';
import type { BreadcrumbItem } from '@/types';

interface ClientItem {
    id: number;
    name: string;
}

interface LeadItem {
    id: number;
    name: string;
    company: string | null;
}

interface DealItem {
    id: number;
    title: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface TypeOption {
    value: string;
    label: string;
}

interface PriorityOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface ActivityItem {
    id: number;
    title: string;
    type: string;
    status: string;
    priority: string;
    due_at: string;
    client_id: number | null;
    lead_id: number | null;
    deal_id: number | null;
    assigned_to: number | null;
    location: string | null;
    notes: string | null;
    outcome: string | null;
}

interface ActivitiesEditProps {
    activity: ActivityItem;
    clients: ClientItem[];
    leads: LeadItem[];
    deals: DealItem[];
    teamMembers: TeamMember[];
    types: TypeOption[];
    priorities: PriorityOption[];
    statuses: StatusOption[];
}

export default function ActivitiesEdit({
    activity,
    clients,
    leads,
    deals,
    teamMembers,
    types,
    priorities,
    statuses,
}: ActivitiesEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: activity.title || '',
        type: activity.type || 'call',
        status: activity.status || 'pending',
        priority: activity.priority || 'medium',
        due_at: activity.due_at || '',
        client_id: activity.client_id ? activity.client_id.toString() : '',
        lead_id: activity.lead_id ? activity.lead_id.toString() : '',
        deal_id: activity.deal_id ? activity.deal_id.toString() : '',
        assigned_to: activity.assigned_to ? activity.assigned_to.toString() : '',
        location: activity.location || '',
        notes: activity.notes || '',
        outcome: activity.outcome || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(activitiesRoute.update({ activity: activity.id }).url);
    };

    return (
        <>
            <Head title={`Edit Activity: ${activity.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="icon" className="size-9 shrink-0">
                        <Link href={activitiesRoute.show({ activity: activity.id }).url}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Activity</h1>
                        <p className="text-sm text-muted-foreground">
                            Update activity schedule, status, outcome notes, or linked CRM records.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Activity Details */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Activity Specifications</CardTitle>
                            <CardDescription>Subject, classification, and timing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">
                                    Subject / Activity Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Follow-up Call regarding API Architecture and SLA"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                {/* Type */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="type">
                                        Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Status" />
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
                                <div className="space-y-1.5">
                                    <Label htmlFor="priority">
                                        Priority <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
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

                                {/* Due Date & Time */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="due_at">
                                        Due Date & Time <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="due_at"
                                        type="datetime-local"
                                        value={data.due_at}
                                        onChange={(e) => setData('due_at', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.due_at} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Location / URL */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="location">Meeting Location or Video URL</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Google Meet link, Zoom, or Office Room A"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                    />
                                    <InputError message={errors.location} />
                                </div>

                                {/* Assigned Owner */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="assigned_to">Assigned Team Member</Label>
                                    <Select
                                        value={data.assigned_to}
                                        onValueChange={(val) => setData('assigned_to', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="assigned_to">
                                            <SelectValue placeholder="Assign team member..." />
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
                        </CardContent>
                    </Card>

                    {/* Linked Entity / CRM Context */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">CRM Context & Linked Records</CardTitle>
                            <CardDescription>Associate this activity with a client, lead, or sales deal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Client Selection */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="client_id">Client Company</Label>
                                    <Select
                                        value={data.client_id}
                                        onValueChange={(val) => setData('client_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="client_id">
                                            <SelectValue placeholder="Select client..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.client_id} />
                                </div>

                                {/* Lead Selection */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="lead_id">Originating Lead</Label>
                                    <Select
                                        value={data.lead_id}
                                        onValueChange={(val) => setData('lead_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="lead_id">
                                            <SelectValue placeholder="Select lead..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {leads.map((l) => (
                                                <SelectItem key={l.id} value={l.id.toString()}>
                                                    {l.name} {l.company ? `(${l.company})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.lead_id} />
                                </div>

                                {/* Deal Selection */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="deal_id">Sales Deal</Label>
                                    <Select
                                        value={data.deal_id}
                                        onValueChange={(val) => setData('deal_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="deal_id">
                                            <SelectValue placeholder="Select deal..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {deals.map((d) => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.deal_id} />
                                </div>
                            </div>

                            {/* Pre-activity notes / agenda */}
                            <div className="space-y-1.5">
                                <Label htmlFor="notes">Meeting Agenda & Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    placeholder="Enter points to cover, questions to ask, or preparation materials needed..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            {/* Outcome notes */}
                            <div className="space-y-1.5 border-t border-border/40 pt-3">
                                <Label htmlFor="outcome">Discussion Outcome & Debrief Notes</Label>
                                <textarea
                                    id="outcome"
                                    rows={3}
                                    placeholder="Discussion summary, minutes of meeting, or next steps agreed..."
                                    value={data.outcome}
                                    onChange={(e) => setData('outcome', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <InputError message={errors.outcome} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={activitiesRoute.show({ activity: activity.id }).url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="size-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Follow-ups & Activities',
        href: activitiesRoute.index.url(),
    },
    {
        title: 'Edit Activity',
        href: '#',
    },
];

ActivitiesEdit.layout = {
    breadcrumbs,
};
