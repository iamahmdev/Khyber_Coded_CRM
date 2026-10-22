import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit,
    Mail,
    Phone,
    RotateCcw,
    Shield,
    Sparkles,
    Target,
    User,
    UserCheck,
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
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface LeadDetail {
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
    notes: string | null;
    lost_reason: string | null;
    converted_at: string | null;
    is_converted: boolean;
    is_convertible: boolean;
    assigned_to: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
    creator: {
        id: number;
        name: string;
        email: string;
    } | null;
    created_at: string;
    created_at_relative: string;
    updated_at: string;
    is_archived: boolean;
    can: {
        update: boolean;
        delete: boolean;
        restore: boolean;
        convert: boolean;
    };
}

interface LeadsShowProps {
    lead: LeadDetail;
}

export default function LeadsShow({ lead }: LeadsShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const confirmArchive = () => {
        router.delete(leadsRoute.destroy.url({ lead: lead.id }), {
            onSuccess: () => setShowArchiveDialog(false),
        });
    };

    const confirmRestore = () => {
        router.post(leadsRoute.restore.url({ id: lead.id }), {});
    };

    const confirmConvert = () => {
        router.post(leadsRoute.convert.url({ lead: lead.id }), {}, {
            onSuccess: () => setShowConvertDialog(false),
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

    const pipelineStages = [
        { key: 'new', label: 'New' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'qualified', label: 'Qualified' },
        { key: 'proposal', label: 'Proposal' },
        { key: 'converted', label: 'Converted' },
    ];

    const currentStageIndex = pipelineStages.findIndex((s) => s.key === lead.status);

    return (
        <>
            <Head title={`Lead: ${lead.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Back Link & Top Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="size-8 p-0">
                            <Link href={leadsRoute.index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                                <span
                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${lead.status_badge_class}`}
                                >
                                    {lead.status_label}
                                </span>
                                <span
                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${lead.priority_badge_class}`}
                                >
                                    {lead.priority_label}
                                </span>
                                {lead.is_archived && (
                                    <Badge variant="destructive" className="text-xs">
                                        Archived
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {lead.title ? `${lead.title} • ` : ''}
                                {lead.company || 'Individual Contact'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {lead.can.convert && !lead.is_archived && !lead.is_converted && (
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm"
                                size="sm"
                                onClick={() => setShowConvertDialog(true)}
                            >
                                <CheckCircle2 className="size-4" />
                                Convert to Client
                            </Button>
                        )}

                        {lead.can.update && !lead.is_archived && (
                            <Button variant="outline" size="sm" asChild className="gap-1.5">
                                <Link href={leadsRoute.edit.url({ lead: lead.id })}>
                                    <Edit className="size-4" />
                                    Edit Lead
                                </Link>
                            </Button>
                        )}

                        {lead.is_archived && lead.can.restore && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={confirmRestore}
                                className="gap-1.5 text-blue-600 dark:text-blue-400"
                            >
                                <RotateCcw className="size-4" />
                                Restore Lead
                            </Button>
                        )}

                        {!lead.is_archived && lead.can.delete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowArchiveDialog(true)}
                                className="gap-1.5 text-destructive hover:bg-destructive/10"
                            >
                                <Archive className="size-4" />
                                Archive
                            </Button>
                        )}
                    </div>
                </div>

                {/* Pipeline Progression Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Pipeline Progression</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                            {pipelineStages.map((stage, idx) => {
                                const isPassed = currentStageIndex >= idx;
                                const isCurrent = lead.status === stage.key;

                                return (
                                    <div key={stage.key} className="flex flex-col gap-1">
                                        <div
                                            className={`h-2 rounded-full transition-colors ${
                                                isCurrent
                                                    ? 'bg-primary'
                                                    : isPassed
                                                      ? 'bg-primary/50'
                                                      : 'bg-muted'
                                            }`}
                                        />
                                        <span
                                            className={`text-xs font-medium text-center truncate ${
                                                isCurrent
                                                    ? 'text-primary font-bold'
                                                    : isPassed
                                                      ? 'text-foreground'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {stage.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Main 2-Column Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column (2 spans) */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Contact Information Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Contact & Organization</CardTitle>
                                <CardDescription>Key contact coordinates and business info</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Full Name</span>
                                    <div className="text-sm font-semibold text-foreground mt-0.5">{lead.name}</div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Organization / Company</span>
                                    <div className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                                        <Building2 className="size-3.5 text-muted-foreground" />
                                        {lead.company || <span className="text-muted-foreground/60">—</span>}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Job Title / Role</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {lead.title || <span className="text-muted-foreground/60">—</span>}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Email Address</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {lead.email ? (
                                            <a
                                                href={`mailto:${lead.email}`}
                                                className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                <Mail className="size-3.5 text-muted-foreground" />
                                                {lead.email}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {lead.phone ? (
                                            <a
                                                href={`tel:${lead.phone}`}
                                                className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                <Phone className="size-3.5 text-muted-foreground" />
                                                {lead.phone}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Acquisition Source</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                            {lead.source_label}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Valuation Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Valuation & Pipeline Details</CardTitle>
                                <CardDescription>Estimated business impact and qualification status</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <span className="text-xs font-medium text-muted-foreground">Estimated Deal Value</span>
                                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                                        {lead.formatted_value || 'Not set'}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{lead.currency} Currency</span>
                                </div>

                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <span className="text-xs font-medium text-muted-foreground">Current Stage</span>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${lead.status_badge_class}`}
                                        >
                                            {lead.status_label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block mt-1">
                                        {lead.is_convertible ? 'Qualified for conversion' : 'Active review'}
                                    </span>
                                </div>

                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <span className="text-xs font-medium text-muted-foreground">Priority Rating</span>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${lead.priority_badge_class}`}
                                        >
                                            {lead.priority_label} Priority
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block mt-1">
                                        Sales team routing
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Requirements */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Notes & Client Requirements</CardTitle>
                                <CardDescription>Internal agency discussion, project scope, and initial notes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lead.notes ? (
                                    <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                        {lead.notes}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-xs text-muted-foreground">
                                        No notes recorded for this lead yet.
                                    </div>
                                )}

                                {lead.lost_reason && (
                                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm">
                                        <div className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                            <AlertCircle className="size-4" />
                                            Lost Reason
                                        </div>
                                        <p className="mt-1 text-red-700 dark:text-red-300">{lead.lost_reason}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 span) */}
                    <div className="flex flex-col gap-6">
                        {/* Assignment & Ownership Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Lead Ownership</CardTitle>
                                <CardDescription>Team assignment and audit record</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Assigned Sales Rep</span>
                                    {lead.assigned_to ? (
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border p-3">
                                            <Avatar className="size-9">
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                    {getInitials(lead.assigned_to.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {lead.assigned_to.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lead.assigned_to.email} • {lead.assigned_to.role}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground text-center">
                                            Lead is currently unassigned
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>Captured by:</span>
                                        <span className="font-medium text-foreground">
                                            {lead.creator?.name || 'System / Inquiry'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Date Created:</span>
                                        <span className="font-medium text-foreground">{lead.created_at}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Last Updated:</span>
                                        <span className="font-medium text-foreground">{lead.updated_at}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Module 6 Integration Readiness Card */}
                        <Card className="border-teal-500/30 bg-teal-500/5 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                    <Sparkles className="size-4" />
                                    Module 6: Client Readiness
                                </CardTitle>
                                <CardDescription>Integration point for client and contact onboarding</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 text-xs">
                                <p className="text-muted-foreground">
                                    When this lead qualifies and agrees to proceed, convert it to create an official client record
                                    in Module 6 (Clients & Contacts) without losing contact history.
                                </p>

                                {lead.is_converted ? (
                                    <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-teal-800 dark:text-teal-300">
                                        <div className="font-semibold flex items-center gap-1.5">
                                            <CheckCircle2 className="size-4 text-teal-500" />
                                            Lead Converted
                                        </div>
                                        <div className="text-xs mt-1">
                                            Converted on {lead.converted_at}. Record is prepared for Module 6 client onboarding.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="rounded-lg border bg-background/80 p-3 text-xs">
                                            <div className="font-medium text-foreground">Current Status:</div>
                                            <span className="text-muted-foreground">
                                                {lead.is_convertible
                                                    ? 'Ready for conversion to Client'
                                                    : 'Lead should ideally reach Qualified or Proposal stage first'}
                                            </span>
                                        </div>

                                        {lead.can.convert && !lead.is_archived && (
                                            <Button
                                                onClick={() => setShowConvertDialog(true)}
                                                className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                                                size="sm"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                Convert to Client
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Archive Confirmation Dialog */}
            <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Lead</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{lead.name}</strong>? It will be moved to archived leads
                            and can be restored later.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Lead
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Confirmation Dialog */}
            <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-teal-500" />
                            Convert Lead to Client
                        </DialogTitle>
                        <DialogDescription>
                            Are you ready to convert <strong>{lead.name}</strong>{' '}
                            {lead.company ? `(${lead.company})` : ''}? This locks the qualification stage and prepares this
                            record for Module 6 (Clients & Contacts) client creation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                        <div className="font-semibold text-foreground">Module 6 Integration Note:</div>
                        This lead will remain linked as the origin source of the prospective client relationship.
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
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

LeadsShow.layout = {
    breadcrumbs: [
        {
            title: 'Leads',
            href: leadsRoute.index.url(),
        },
        {
            title: 'Lead Details',
            href: '#',
        },
    ],
};
