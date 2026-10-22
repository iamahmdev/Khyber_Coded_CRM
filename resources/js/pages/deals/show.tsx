import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    ArrowRight,
    Award,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit,
    Globe,
    History,
    Mail,
    Phone,
    Share2,
    Sparkles,
    Target,
    TrendingUp,
    User,
    XCircle,
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import clientsRoute from '@/routes/clients';
import dealsRoute from '@/routes/deals';
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface StageHistoryItem {
    id: number;
    from_stage: string | null;
    to_stage: string;
    from_stage_label: string | null;
    to_stage_label: string;
    notes: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface DealDetail {
    id: number;
    title: string;
    client_id: number | null;
    lead_id: number | null;
    contact_id: number | null;
    assigned_to: number | null;
    created_by: number;
    stage: string;
    priority: string;
    amount: string | number;
    currency: string;
    probability: number;
    weighted_amount: number;
    expected_close_date: string | null;
    actual_close_date: string | null;
    loss_reason: string | null;
    notes: string | null;
    stage_updated_at: string | null;
    created_at: string;
    updated_at: string;
    client?: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
        industry: string | null;
    } | null;
    contact?: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        title: string | null;
    } | null;
    lead?: {
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        status: string;
    } | null;
    assigned_to_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
    creator?: {
        id: number;
        name: string;
        email: string;
    } | null;
    stage_histories: StageHistoryItem[];
}

interface StageMeta {
    value: string;
    label: string;
    badge_class: string;
    default_probability: number;
    is_closed: boolean;
    is_won: boolean;
    is_lost: boolean;
}

interface DealShowProps {
    deal: DealDetail;
    stages: StageMeta[];
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function DealShow({ deal, stages, can }: DealShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [lossDialogOpen, setLossDialogOpen] = useState(false);
    const [lossReason, setLossReason] = useState('Budget constraints');
    const [lossNotes, setLossNotes] = useState('');
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const formatCurrency = (val: number | string, currency = 'USD') => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const handleStageAdvance = (targetStage: string) => {
        router.patch(
            dealsRoute.stage({ deal: deal.id }).url,
            { stage: targetStage },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Stage moved to ${targetStage} successfully!`),
                onError: () => toast.error('Failed to update stage.'),
            }
        );
    };

    const confirmMarkLost = () => {
        router.patch(
            dealsRoute.stage({ deal: deal.id }).url,
            {
                stage: 'lost',
                loss_reason: lossReason,
                notes: lossNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLossDialogOpen(false);
                    toast.success('Opportunity marked as Closed Lost.');
                },
                onError: () => toast.error('Failed to update stage.'),
            }
        );
    };

    const confirmArchive = () => {
        router.delete(dealsRoute.destroy({ deal: deal.id }).url, {
            onSuccess: () => toast.success('Deal archived successfully.'),
            onError: () => toast.error('Failed to archive deal.'),
        });
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'high':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const activeStagesFlow = ['new', 'qualified', 'proposal', 'negotiation', 'won'];
    const currentStageIndex = activeStagesFlow.indexOf(deal.stage);

    return (
        <>
            <Head title={`Deal: ${deal.title}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon" className="size-9 shrink-0">
                            <Link href={dealsRoute.index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
                                <Badge
                                    variant="outline"
                                    className={`capitalize ${
                                        deal.stage === 'won'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : deal.stage === 'lost'
                                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                              : 'bg-primary/10 text-primary border-primary/20'
                                    }`}
                                >
                                    {deal.stage}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`capitalize ${getPriorityBadgeClass(deal.priority)}`}
                                >
                                    {deal.priority} priority
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Opportunity ID #{deal.id} &bull; Created on {new Date(deal.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {can.update && (
                            <Button asChild variant="outline" size="sm" className="gap-1.5">
                                <Link href={dealsRoute.edit({ deal: deal.id }).url}>
                                    <Edit className="size-3.5" />
                                    Edit Opportunity
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-rose-600 hover:text-rose-600 hover:bg-rose-500/10"
                                onClick={() => setArchiveDialogOpen(true)}
                            >
                                <Archive className="size-3.5" />
                                Archive
                            </Button>
                        )}
                    </div>
                </div>

                {/* Pipeline Progression Stepper Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-sm font-medium">Pipeline Progression</CardTitle>
                            <div className="flex items-center gap-2">
                                {deal.stage !== 'won' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                        onClick={() => handleStageAdvance('won')}
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Mark Closed Won
                                    </Button>
                                )}
                                {deal.stage !== 'lost' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                                        onClick={() => setLossDialogOpen(true)}
                                    >
                                        <XCircle className="size-3.5" />
                                        Mark Closed Lost
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {deal.stage === 'lost' ? (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <XCircle className="size-4 shrink-0" />
                                    Deal Closed as Lost
                                </div>
                                <p className="mt-1">
                                    <strong>Primary Reason:</strong> {deal.loss_reason || 'Not specified'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                {activeStagesFlow.map((stageKey, idx) => {
                                    const meta = stages.find((s) => s.value === stageKey);
                                    const isCurrent = deal.stage === stageKey;
                                    const isPast = currentStageIndex > idx;

                                    return (
                                        <button
                                            key={stageKey}
                                            onClick={() => handleStageAdvance(stageKey)}
                                            disabled={isCurrent}
                                            className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all ${
                                                isCurrent
                                                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30'
                                                    : isPast
                                                      ? 'border-emerald-500/30 bg-emerald-500/5 text-muted-foreground hover:bg-emerald-500/10'
                                                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                {isPast ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                                ) : isCurrent ? (
                                                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                                                ) : (
                                                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                                                )}
                                                <span className={isCurrent ? 'text-primary font-bold' : ''}>
                                                    {meta?.label || stageKey}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">
                                                {meta?.default_probability}% probability
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns: Deal Financials, Notes, and History */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Financials & Overview Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Opportunity Financials</CardTitle>
                                <CardDescription>Deal economics and win probability forecast</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Deal Amount</div>
                                        <div className="mt-1 text-xl font-bold text-foreground">
                                            {formatCurrency(deal.amount, deal.currency)}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Win Probability</div>
                                        <div className="mt-1 text-xl font-bold text-blue-600">
                                            {deal.probability}%
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Weighted Forecast</div>
                                        <div className="mt-1 text-xl font-bold text-emerald-600">
                                            {formatCurrency(deal.weighted_amount, deal.currency)}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Target Close Date</div>
                                        <div className="mt-1 text-sm font-semibold text-foreground">
                                            {deal.expected_close_date || 'Not set'}
                                        </div>
                                    </div>
                                </div>

                                {deal.notes && (
                                    <div className="mt-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase">
                                            Deal Notes & Scope Summary
                                        </div>
                                        <p className="mt-2 text-sm text-foreground whitespace-pre-line leading-relaxed">
                                            {deal.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stage Transition History Timeline */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <History className="size-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">Stage History Timeline</CardTitle>
                                </div>
                                <CardDescription>
                                    Audit trail of stage movements, timestamps, and transition notes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {deal.stage_histories.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-muted-foreground">
                                        No stage transitions recorded yet.
                                    </div>
                                ) : (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                        {deal.stage_histories.map((hist) => (
                                            <div key={hist.id} className="relative">
                                                <div className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-primary bg-background" />
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                                        {hist.from_stage_label ? (
                                                            <>
                                                                <span className="font-semibold text-muted-foreground">
                                                                    {hist.from_stage_label}
                                                                </span>
                                                                <ArrowRight className="size-3 text-muted-foreground" />
                                                                <span className="font-bold text-foreground">
                                                                    {hist.to_stage_label}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-foreground">
                                                                Created in stage: {hist.to_stage_label}
                                                            </span>
                                                        )}
                                                        <span className="text-muted-foreground/60">&bull;</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(hist.created_at).toLocaleString()}
                                                        </span>
                                                        {hist.user && (
                                                            <span className="text-muted-foreground">
                                                                by <strong>{hist.user.name}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {hist.notes && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 bg-muted/30 p-2 rounded border border-border/40">
                                                            {hist.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 1 Column: Associated Relationships */}
                    <div className="flex flex-col gap-6">
                        {/* Associated Client / Organization Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 className="size-4 text-blue-500" />
                                    Client Organization
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {deal.client ? (
                                    <div className="space-y-3">
                                        <div>
                                            <Link
                                                href={clientsRoute.show({ client: deal.client.id }).url}
                                                className="font-bold text-base text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                            >
                                                {deal.client.name}
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                            {deal.client.industry && (
                                                <Badge variant="outline" className="text-[10px] mt-1">
                                                    {deal.client.industry}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                                            {deal.client.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="size-3.5 text-muted-foreground/70" />
                                                    <span>{deal.client.email}</span>
                                                </div>
                                            )}
                                            {deal.client.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="size-3.5 text-muted-foreground/70" />
                                                    <span>{deal.client.phone}</span>
                                                </div>
                                            )}
                                            {deal.client.website && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="size-3.5 text-muted-foreground/70" />
                                                    <a
                                                        href={deal.client.website}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="hover:underline text-primary"
                                                    >
                                                        {deal.client.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">
                                        No client company linked to this opportunity yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Associated Contact Person Card */}
                        {deal.contact && (
                            <Card className="border-border/60 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <User className="size-4 text-emerald-500" />
                                        Primary Deal Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="font-semibold text-sm text-foreground">{deal.contact.name}</div>
                                            {deal.contact.title && (
                                                <div className="text-xs text-muted-foreground">{deal.contact.title}</div>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-xs text-muted-foreground border-t border-border/40 pt-2">
                                            {deal.contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="size-3 text-muted-foreground" />
                                                    <span>{deal.contact.email}</span>
                                                </div>
                                            )}
                                            {deal.contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="size-3 text-muted-foreground" />
                                                    <span>{deal.contact.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Origin Lead Card */}
                        {deal.lead && (
                            <Card className="border-border/60 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Target className="size-4 text-amber-500" />
                                        Originating Lead
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-xs">
                                        <Link
                                            href={leadsRoute.show({ lead: deal.lead.id }).url}
                                            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            {deal.lead.name}
                                            <ArrowRight className="size-3" />
                                        </Link>
                                        <div className="text-muted-foreground">
                                            Status: <Badge variant="outline" className="text-[10px] uppercase">{deal.lead.status}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Deal Owner & Creator */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <User className="size-4 text-indigo-500" />
                                    Opportunity Ownership
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Deal Owner (Assignee):</span>
                                        {deal.assigned_to_user ? (
                                            <div className="mt-1 flex items-center gap-2">
                                                <Avatar className="size-6 border border-border">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                        {getInitials(deal.assigned_to_user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-foreground">
                                                        {deal.assigned_to_user.name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {deal.assigned_to_user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic mt-0.5">Unassigned</div>
                                        )}
                                    </div>

                                    {deal.creator && (
                                        <div className="border-t border-border/40 pt-2.5">
                                            <span className="text-muted-foreground">Created By:</span>
                                            <div className="font-medium text-foreground mt-0.5">
                                                {deal.creator.name} ({deal.creator.email})
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal: Mark Closed Lost */}
            <Dialog open={lossDialogOpen} onOpenChange={setLossDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <XCircle className="size-5" />
                            Mark Opportunity as Closed Lost
                        </DialogTitle>
                        <DialogDescription>
                            Please provide the primary reason for losing this opportunity.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="lossReason">Reason for Loss</Label>
                            <Select value={lossReason} onValueChange={setLossReason}>
                                <SelectTrigger id="lossReason">
                                    <SelectValue placeholder="Select primary reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Budget constraints">Budget constraints</SelectItem>
                                    <SelectItem value="Competitor selected">Competitor selected</SelectItem>
                                    <SelectItem value="Chose internal team">Chose internal team</SelectItem>
                                    <SelectItem value="Project delayed or cancelled">Project delayed or cancelled</SelectItem>
                                    <SelectItem value="Feature / scope mismatch">Feature / scope mismatch</SelectItem>
                                    <SelectItem value="Unresponsive client">Unresponsive client</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lossNotes">Debrief Notes (Optional)</Label>
                            <Input
                                id="lossNotes"
                                placeholder="Additional details or context..."
                                value={lossNotes}
                                onChange={(e) => setLossNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLossDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmMarkLost}>
                            Confirm Closed Lost
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Archive Deal */}
            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Archive Sales Deal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive this deal? It can be restored later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Deal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales Pipeline',
        href: dealsRoute.index.url(),
    },
    {
        title: 'Deal Details',
        href: '#',
    },
];

DealShow.layout = {
    breadcrumbs,
};
