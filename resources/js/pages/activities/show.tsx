import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ArrowLeft,
    Bell,
    Briefcase,
    Calendar,
    CheckCircle2,
    CheckSquare,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Phone,
    Share2,
    Sparkles,
    Target,
    TrendingUp,
    User,
    Video,
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
import { Label } from '@/components/ui/label';
import activitiesRoute from '@/routes/activities';
import clientsRoute from '@/routes/clients';
import dealsRoute from '@/routes/deals';
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface ActivityDetail {
    id: number;
    title: string;
    type: string;
    type_label: string;
    type_badge_class: string;
    status: string;
    status_label: string;
    status_badge_class: string;
    priority: string;
    priority_label: string;
    priority_badge_class: string;
    due_at: string;
    due_at_formatted: string;
    is_overdue: boolean;
    completed_at: string | null;
    location: string | null;
    notes: string | null;
    outcome: string | null;
    created_at: string;
    client?: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        website: string | null;
    } | null;
    lead?: {
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        phone: string | null;
    } | null;
    deal?: {
        id: number;
        title: string;
        stage: string;
        amount: string | number;
    } | null;
    assigned_to?: {
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
}

interface ActivityShowProps {
    activity: ActivityDetail;
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function ActivityShow({ activity, can }: ActivityShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [outcomeNotes, setOutcomeNotes] = useState(activity.outcome || '');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const confirmComplete = () => {
        router.patch(
            activitiesRoute.complete({ activity: activity.id }).url,
            {
                status: 'completed',
                outcome: outcomeNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCompleteModalOpen(false);
                    toast.success('Activity marked as completed!');
                },
                onError: () => toast.error('Failed to update activity.'),
            }
        );
    };

    const confirmDelete = () => {
        router.delete(activitiesRoute.destroy({ activity: activity.id }).url, {
            onSuccess: () => toast.success('Activity removed successfully.'),
            onError: () => toast.error('Failed to delete activity.'),
        });
    };

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="size-5 text-emerald-500" />;
            case 'meeting':
                return <Video className="size-5 text-purple-500" />;
            case 'email':
                return <Mail className="size-5 text-blue-500" />;
            case 'reminder':
                return <Bell className="size-5 text-amber-500" />;
            case 'task':
                return <CheckSquare className="size-5 text-indigo-500" />;
            default:
                return <FileText className="size-5 text-zinc-500" />;
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

    return (
        <>
            <Head title={`Activity: ${activity.title}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon" className="size-9 shrink-0">
                            <Link href={activitiesRoute.index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{activity.title}</h1>
                                <Badge variant="outline" className={`text-xs ${activity.type_badge_class}`}>
                                    {activity.type_label}
                                </Badge>
                                <Badge variant="outline" className={`text-xs capitalize ${activity.priority_badge_class}`}>
                                    {activity.priority_label}
                                </Badge>
                                <Badge variant="outline" className={`text-xs capitalize ${activity.status_badge_class}`}>
                                    {activity.status_label}
                                </Badge>
                                {activity.is_overdue && (
                                    <Badge variant="destructive" className="text-xs gap-1 font-semibold">
                                        <AlertCircle className="size-3" />
                                        Overdue
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Scheduled for {activity.due_at_formatted} &bull; Created {activity.created_at}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {activity.status !== 'completed' && (
                            <Button
                                size="sm"
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => setCompleteModalOpen(true)}
                            >
                                <CheckCircle2 className="size-4" />
                                Mark Completed
                            </Button>
                        )}
                        {can.update && (
                            <Button asChild variant="outline" size="sm" className="gap-1.5">
                                <Link href={activitiesRoute.edit({ activity: activity.id }).url}>
                                    <Edit className="size-3.5" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-rose-600 hover:text-rose-600 hover:bg-rose-500/10"
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                <Archive className="size-3.5" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns: Main Details, Location, Outcome */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Schedule & Location Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    {renderTypeIcon(activity.type)}
                                    <CardTitle className="text-base font-semibold">Activity Specifications</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Due Date & Time</div>
                                        <div className="mt-1 font-semibold text-sm text-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-primary" />
                                            {activity.due_at_formatted}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Current Status</div>
                                        <div className="mt-1 font-semibold text-sm capitalize">
                                            {activity.status}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                        <div className="text-xs text-muted-foreground">Completion Date</div>
                                        <div className="mt-1 font-semibold text-sm text-foreground">
                                            {activity.completed_at || 'Pending'}
                                        </div>
                                    </div>
                                </div>

                                {activity.location && (
                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <MapPin className="size-4 text-primary shrink-0" />
                                            <div>
                                                <div className="text-xs text-muted-foreground font-medium">Location / Meeting URL</div>
                                                <div className="font-semibold text-foreground mt-0.5">{activity.location}</div>
                                            </div>
                                        </div>
                                        {activity.location.startsWith('http') && (
                                            <Button asChild size="sm" className="gap-1.5">
                                                <a href={activity.location} target="_blank" rel="noreferrer">
                                                    Join Meeting
                                                    <ExternalLink className="size-3.5" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {activity.notes && (
                                    <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase">
                                            Agenda & Pre-meeting Notes
                                        </div>
                                        <p className="mt-2 text-sm text-foreground whitespace-pre-line leading-relaxed">
                                            {activity.notes}
                                        </p>
                                    </div>
                                )}

                                {activity.outcome && (
                                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                                            <CheckCircle2 className="size-4" />
                                            Discussion Outcome & Minutes
                                        </div>
                                        <p className="mt-2 text-sm text-foreground whitespace-pre-line leading-relaxed">
                                            {activity.outcome}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 1 Column: Related Entities */}
                    <div className="flex flex-col gap-6">
                        {/* Associated Client Organization Card */}
                        {activity.client && (
                            <Card className="border-border/60 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Briefcase className="size-4 text-blue-500" />
                                        Associated Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    <Link
                                        href={clientsRoute.show({ client: activity.client.id }).url}
                                        className="font-bold text-base text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {activity.client.name}
                                        <ExternalLink className="size-3" />
                                    </Link>
                                    {activity.client.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="size-3" />
                                            <span>{activity.client.phone}</span>
                                        </div>
                                    )}
                                    {activity.client.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="size-3" />
                                            <span>{activity.client.email}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Associated Sales Deal Card */}
                        {activity.deal && (
                            <Card className="border-border/60 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="size-4 text-indigo-500" />
                                        Associated Sales Deal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    <Link
                                        href={dealsRoute.show({ deal: activity.deal.id }).url}
                                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {activity.deal.title}
                                        <ExternalLink className="size-3" />
                                    </Link>
                                    <div className="text-muted-foreground">
                                        Stage: <Badge variant="outline" className="text-[10px] capitalize">{activity.deal.stage}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Associated Lead Card */}
                        {activity.lead && (
                            <Card className="border-border/60 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Target className="size-4 text-amber-500" />
                                        Originating Lead
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    <Link
                                        href={leadsRoute.show({ lead: activity.lead.id }).url}
                                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {activity.lead.name} {activity.lead.company ? `(${activity.lead.company})` : ''}
                                        <ExternalLink className="size-3" />
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Ownership Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Activity Ownership
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Assigned To:</span>
                                    {activity.assigned_to ? (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Avatar className="size-6 border border-border">
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                    {getInitials(activity.assigned_to.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {activity.assigned_to.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {activity.assigned_to.email}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground italic mt-0.5">Unassigned</div>
                                    )}
                                </div>

                                {activity.creator && (
                                    <div className="border-t border-border/40 pt-2.5">
                                        <span className="text-muted-foreground">Scheduled By:</span>
                                        <div className="font-medium text-foreground mt-0.5">
                                            {activity.creator.name} ({activity.creator.email})
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal: Complete Activity */}
            <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="size-5" />
                            Complete Activity
                        </DialogTitle>
                        <DialogDescription>
                            Mark this activity as completed and document minutes of meeting or discussion outcome.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="outcomeNotes">Outcome & Debrief Notes</Label>
                            <textarea
                                id="outcomeNotes"
                                rows={4}
                                placeholder="Meeting takeaways, action items agreed, or call summary..."
                                value={outcomeNotes}
                                onChange={(e) => setOutcomeNotes(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Mark Completed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Delete Activity */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Activity</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this activity? It can be restored later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Activity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Follow-ups & Activities',
        href: activitiesRoute.index.url(),
    },
    {
        title: 'Activity Details',
        href: '#',
    },
];

ActivityShow.layout = {
    breadcrumbs,
};
