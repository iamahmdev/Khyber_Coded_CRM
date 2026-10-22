import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    Briefcase,
    Building2,
    CheckCircle2,
    Edit,
    Globe,
    Mail,
    MapPin,
    Phone,
    Plus,
    RotateCcw,
    Sparkles,
    Star,
    Trash2,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { type FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
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
import clientsRoute from '@/routes/clients';
import leadsRoute from '@/routes/leads';
import type { BreadcrumbItem } from '@/types';

interface ContactItem {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    department: string | null;
    is_primary: boolean;
    notes: string | null;
    created_at: string;
}

interface ClientDetail {
    id: number;
    name: string;
    industry: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string;
    status: string;
    status_label: string;
    status_badge_class: string;
    notes: string | null;
    account_manager: {
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
    source_lead: {
        id: number;
        name: string;
        company: string | null;
        email: string | null;
        status_label: string;
    } | null;
    contacts: ContactItem[];
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    can: {
        update: boolean;
        delete: boolean;
        restore: boolean;
    };
}

interface ClientsShowProps {
    client: ClientDetail;
}

export default function ClientsShow({ client }: ClientsShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string; info?: string } }>().props;

    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<ContactItem | null>(null);

    const contactForm = useForm({
        name: '',
        email: '',
        phone: '',
        title: '',
        department: '',
        is_primary: false,
        notes: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    const openCreateContact = () => {
        setEditingContact(null);
        contactForm.reset();
        setContactModalOpen(true);
    };

    const openEditContact = (c: ContactItem) => {
        setEditingContact(c);
        contactForm.setData({
            name: c.name,
            email: c.email || '',
            phone: c.phone || '',
            title: c.title || '',
            department: c.department || '',
            is_primary: c.is_primary,
            notes: c.notes || '',
        });
        setContactModalOpen(true);
    };

    const submitContact: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingContact) {
            contactForm.put(`/contacts/${editingContact.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setContactModalOpen(false);
                    contactForm.reset();
                },
            });
        } else {
            contactForm.post(`/clients/${client.id}/contacts`, {
                preserveScroll: true,
                onSuccess: () => {
                    setContactModalOpen(false);
                    contactForm.reset();
                },
            });
        }
    };

    const deleteContact = (contactId: number) => {
        if (confirm('Are you sure you want to remove this contact person?')) {
            router.delete(`/contacts/${contactId}`, {
                preserveScroll: true,
            });
        }
    };

    const makePrimaryContact = (contactId: number) => {
        router.post(`/contacts/${contactId}/make-primary`, {}, {
            preserveScroll: true,
        });
    };

    const confirmArchive = () => {
        router.delete(clientsRoute.destroy.url({ client: client.id }), {
            onSuccess: () => setShowArchiveDialog(false),
        });
    };

    const confirmRestore = () => {
        router.post(clientsRoute.restore.url({ id: client.id }), {});
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
            <Head title={`Client: ${client.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="size-8 p-0">
                            <Link href={clientsRoute.index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                                <span
                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${client.status_badge_class}`}
                                >
                                    {client.status_label}
                                </span>
                                {client.source_lead && (
                                    <Badge variant="outline" className="text-teal-600 border-teal-500/20 bg-teal-500/10 text-xs">
                                        <Sparkles className="mr-1 size-3" />
                                        From Converted Lead
                                    </Badge>
                                )}
                                {client.is_archived && (
                                    <Badge variant="destructive" className="text-xs">
                                        Archived
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {client.industry || 'Client Organization'} • {client.city ? `${client.city}, ` : ''}{client.country}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {client.can.update && !client.is_archived && (
                            <Button size="sm" className="gap-1.5" onClick={openCreateContact}>
                                <Plus className="size-4" />
                                Add Contact
                            </Button>
                        )}

                        {client.can.update && !client.is_archived && (
                            <Button variant="outline" size="sm" asChild className="gap-1.5">
                                <Link href={clientsRoute.edit.url({ client: client.id })}>
                                    <Edit className="size-4" />
                                    Edit Client
                                </Link>
                            </Button>
                        )}

                        {client.is_archived && client.can.restore && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={confirmRestore}
                                className="gap-1.5 text-blue-600 dark:text-blue-400"
                            >
                                <RotateCcw className="size-4" />
                                Restore
                            </Button>
                        )}

                        {!client.is_archived && client.can.delete && (
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

                {/* Main 2-Column Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column (2 spans) */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Company Profile Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Organization Overview</CardTitle>
                                <CardDescription>Company profile and primary coordinates</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Company Name</span>
                                    <div className="text-sm font-semibold text-foreground mt-0.5">{client.name}</div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Industry / Sector</span>
                                    <div className="text-sm font-medium text-foreground mt-0.5">
                                        {client.industry || <span className="text-muted-foreground/60">—</span>}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Website</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {client.website ? (
                                            <a
                                                href={client.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                <Globe className="size-3.5 text-muted-foreground" />
                                                {client.website}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Corporate Email</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {client.email ? (
                                            <a
                                                href={`mailto:${client.email}`}
                                                className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                <Mail className="size-3.5 text-muted-foreground" />
                                                {client.email}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Phone</span>
                                    <div className="text-sm text-foreground mt-0.5">
                                        {client.phone ? (
                                            <a
                                                href={`tel:${client.phone}`}
                                                className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                <Phone className="size-3.5 text-muted-foreground" />
                                                {client.phone}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Office Address</span>
                                    <div className="text-sm text-foreground mt-0.5 flex items-start gap-1.5">
                                        <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <span>
                                            {[client.address, client.city, client.state, client.country]
                                                .filter(Boolean)
                                                .join(', ') || <span className="text-muted-foreground/60">—</span>}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacts Section */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        Contact Persons ({client.contacts.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Direct stakeholder contacts and authorized representatives
                                    </CardDescription>
                                </div>

                                {client.can.update && !client.is_archived && (
                                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={openCreateContact}>
                                        <Plus className="size-3.5" />
                                        Add Contact
                                    </Button>
                                )}
                            </CardHeader>

                            <CardContent>
                                {client.contacts.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No contact persons recorded for this client yet.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {client.contacts.map((contact) => (
                                            <div
                                                key={contact.id}
                                                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9 border border-border/60">
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                            {getInitials(contact.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-foreground">
                                                                {contact.name}
                                                            </span>
                                                            {contact.is_primary && (
                                                                <Badge variant="default" className="text-[10px] py-0 px-1.5 gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                                                                    <Star className="size-2.5 fill-current" />
                                                                    Primary
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {contact.title ? `${contact.title}` : ''}
                                                            {contact.department ? ` (${contact.department})` : ''}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            {contact.email && (
                                                                <a
                                                                    href={`mailto:${contact.email}`}
                                                                    className="hover:underline flex items-center gap-1"
                                                                >
                                                                    <Mail className="size-3" />
                                                                    {contact.email}
                                                                </a>
                                                            )}
                                                            {contact.phone && (
                                                                <a
                                                                    href={`tel:${contact.phone}`}
                                                                    className="hover:underline flex items-center gap-1"
                                                                >
                                                                    <Phone className="size-3" />
                                                                    {contact.phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {client.can.update && !client.is_archived && (
                                                    <div className="flex items-center gap-1 self-end sm:self-auto">
                                                        {!contact.is_primary && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                                                onClick={() => makePrimaryContact(contact.id)}
                                                            >
                                                                Set Primary
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => openEditContact(contact)}
                                                        >
                                                            <Edit className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => deleteContact(contact.id)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Client Notes */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Internal Notes & History</CardTitle>
                                <CardDescription>Contractual requirements, context, and background</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {client.notes ? (
                                    <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                        {client.notes}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-xs text-muted-foreground">
                                        No internal notes recorded.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 span) */}
                    <div className="flex flex-col gap-6">
                        {/* Account Management Card */}
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base">Account Management</CardTitle>
                                <CardDescription>Internal CRM team responsibility</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">Account Manager</span>
                                    {client.account_manager ? (
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border p-3">
                                            <Avatar className="size-9">
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                    {getInitials(client.account_manager.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {client.account_manager.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {client.account_manager.email} • {client.account_manager.role}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground text-center">
                                            Account is unassigned
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>Onboarded by:</span>
                                        <span className="font-medium text-foreground">
                                            {client.creator?.name || 'System / Conversion'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Client Since:</span>
                                        <span className="font-medium text-foreground">{client.created_at}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Last Updated:</span>
                                        <span className="font-medium text-foreground">{client.updated_at}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Origin Lead Card (if converted) */}
                        {client.source_lead && (
                            <Card className="border-teal-500/30 bg-teal-500/5 shadow-xs">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                        <Sparkles className="size-4" />
                                        Converted Lead Origin
                                    </CardTitle>
                                    <CardDescription>Traced back to initial sales inquiry</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 text-xs">
                                    <div className="rounded-lg border bg-background/80 p-3 flex flex-col gap-1.5">
                                        <div className="font-semibold text-foreground flex items-center justify-between">
                                            <span>{client.source_lead.name}</span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {client.source_lead.status_label}
                                            </Badge>
                                        </div>
                                        {client.source_lead.email && (
                                            <span className="text-muted-foreground">{client.source_lead.email}</span>
                                        )}
                                    </div>

                                    <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-1">
                                        <Link href={leadsRoute.show.url({ lead: client.source_lead.id })}>
                                            View Source Lead # {client.source_lead.id}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Create / Edit Modal Dialog */}
            <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingContact ? 'Edit Contact Person' : 'Add Contact Person'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingContact
                                ? 'Update stakeholder details and communication coordinates.'
                                : `Add a new contact person associated with ${client.name}.`}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitContact} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="contact_name">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="contact_name"
                                value={contactForm.data.name}
                                onChange={(e) => contactForm.setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={contactForm.errors.name} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact_email">Email Address</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={contactForm.data.email}
                                    onChange={(e) => contactForm.setData('email', e.target.value)}
                                />
                                <InputError message={contactForm.errors.email} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact_phone">Phone Number</Label>
                                <Input
                                    id="contact_phone"
                                    type="tel"
                                    value={contactForm.data.phone}
                                    onChange={(e) => contactForm.setData('phone', e.target.value)}
                                />
                                <InputError message={contactForm.errors.phone} />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact_title">Job Title</Label>
                                <Input
                                    id="contact_title"
                                    placeholder="e.g. Chief Technical Officer"
                                    value={contactForm.data.title}
                                    onChange={(e) => contactForm.setData('title', e.target.value)}
                                />
                                <InputError message={contactForm.errors.title} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact_dept">Department</Label>
                                <Input
                                    id="contact_dept"
                                    placeholder="e.g. Engineering, Executive"
                                    value={contactForm.data.department}
                                    onChange={(e) => contactForm.setData('department', e.target.value)}
                                />
                                <InputError message={contactForm.errors.department} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="is_primary"
                                type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary size-4"
                                checked={contactForm.data.is_primary}
                                onChange={(e) => contactForm.setData('is_primary', e.target.checked)}
                            />
                            <Label htmlFor="is_primary" className="text-xs cursor-pointer">
                                Set as primary contact for this client
                            </Label>
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setContactModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={contactForm.processing}>
                                {editingContact ? 'Update Contact' : 'Save Contact'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Dialog */}
            <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{client.name}</strong>? It will be moved to archived
                            clients and can be restored at any time.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ClientsShow.layout = {
    breadcrumbs: [
        {
            title: 'Clients & Contacts',
            href: clientsRoute.index.url(),
        },
        {
            title: 'Client Details',
            href: '#',
        },
    ],
};
