"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DarseQuranEvent {
    id: string;
    city: string;
    time: string;
    address: string;
    type: string;
    hasLadiesArrangement: boolean;
    mudarris: string;
    contact: string;
    isPublished: boolean;
    createdAt: string;
}

export function DarseQuranManager() {
    const [events, setEvents] = useState<DarseQuranEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<DarseQuranEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        city: "",
        time: "",
        address: "",
        type: "Dora-e-Tarjuma-e-Quran",
        hasLadiesArrangement: false,
        mudarris: "",
        contact: "",
        isPublished: true,
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/darse-quran?admin=true");
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error("Error fetching Dars-e-Quran events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (event?: DarseQuranEvent) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                city: event.city,
                time: event.time,
                address: event.address,
                type: event.type,
                hasLadiesArrangement: event.hasLadiesArrangement,
                mudarris: event.mudarris,
                contact: event.contact || "",
                isPublished: event.isPublished,
            });
        } else {
            setEditingEvent(null);
            setFormData({
                city: "",
                time: "",
                address: "",
                type: "Dora-e-Tarjuma-e-Quran",
                hasLadiesArrangement: false,
                mudarris: "",
                contact: "",
                isPublished: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingEvent ? `/api/darse-quran/${editingEvent.id}` : "/api/darse-quran";
            const method = editingEvent ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });


            if (!res.ok) throw new Error("Failed to save event");

            toast({
                title: "Success",
                description: `Event in ${formData.city} ${editingEvent ? "updated" : "created"} successfully.`,
            });

            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save event. Please try again.",
            });
        }
    };

    const [deletingEventId, setDeletingEventId] = useState<{id: string, city: string} | null>(null);

    const handleDelete = async (id: string, city: string) => {
        setDeletingEventId(null);
        try {
            const res = await fetch(`/api/darse-quran/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete event");
            
            toast({
                title: "Success",
                description: `Event in ${city} deleted successfully.`,
            });

            fetchEvents();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete event. Please try again.",
            });
        }
    };

    const filteredEvents = events.filter(e =>
        e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.mudarris.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dars-e-Quran Manager</h1>
                    <p className="text-foreground-muted">Manage global event schedules, mudarris assignments, and locations.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Event
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by city, mudarris, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-sm"
                    />
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Type / Schedule</th>
                                <th className="px-6 py-4 font-medium">Mudarris</th>
                                <th className="px-6 py-4 font-medium">Status / Details</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading events...</td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No events found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">{event.city}</p>
                                            <span className="text-muted-foreground text-xs flex items-center gap-1 mt-1 truncate max-w-[200px]" title={event.address}>
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {event.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{event.type}</p>
                                            <Badge variant="outline" className="mt-1">{event.time}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{event.mudarris}</p>
                                            <p className="text-muted-foreground text-xs">{event.contact || "No Contact"}</p>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <Badge variant={event.isPublished ? "default" : "secondary"}>
                                                {event.isPublished ? "Active" : "Hidden"}
                                            </Badge>
                                            {event.hasLadiesArrangement && (
                                                <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-700 border-pink-200">
                                                    Ladies Space
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(event)}>
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeletingEventId({id: event.id, city: event.city})}>
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl border border-border rounded-xl shadow-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
                            <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsModalOpen(false)}>×</Button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="darse-quran-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">City</label>
                                        <input type="text" required placeholder="e.g. Lahore - لاہور" className="w-full p-2 border border-border rounded bg-background" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Program Type</label>
                                        <select className="w-full p-2 border border-border rounded bg-background" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="Dora-e-Tarjuma-e-Quran">Dora-e-Tarjuma-e-Quran</option>
                                            <option value="Khulasa-e-Tarjuma-e-Quran">Khulasa-e-Tarjuma-e-Quran</option>
                                            <option value="Dora-e-Namaz">Dora-e-Namaz</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Time / Schedule</label>
                                        <input type="text" required placeholder="e.g. بعد نماز عشاء" className="w-full p-2 border border-border rounded bg-background" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mudarris (Instructor)</label>
                                        <input type="text" required placeholder="e.g. Dr. Ahmed Bilal" className="w-full p-2 border border-border rounded bg-background" value={formData.mudarris} onChange={e => setFormData({ ...formData, mudarris: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium">Complete Physical Address</label>
                                    <RichTextEditor 
                                        content={formData.address} 
                                        onChange={(content) => setFormData({ ...formData, address: content })}
                                        placeholder="Enter the full address and location details..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Number</label>
                                        <input type="text" placeholder="e.g. 0300-1234567" className="w-full p-2 border border-border rounded bg-background" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex gap-6 mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.hasLadiesArrangement} onChange={e => setFormData({ ...formData, hasLadiesArrangement: e.target.checked })} />
                                        <span className="text-sm font-medium">Ladies Arrangement Available</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                                        <span className="text-sm font-medium">Visible to Public</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                             <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                             <ConfirmDialog
                                title="Save Program"
                                description="Are you sure you want to save this Dars-e-Quran program?"
                                onConfirm={() => document.getElementById("darse-quran-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                             >
                                <Button type="button">Save Program</Button>
                             </ConfirmDialog>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDialog
                open={!!deletingEventId}
                onOpenChange={(open) => !open && setDeletingEventId(null)}
                title="Delete Event"
                description={`Are you sure you want to delete the Dars-e-Quran event in ${deletingEventId?.city}?`}
                onConfirm={() => deletingEventId && handleDelete(deletingEventId.id, deletingEventId.city)}
            />
        </div>
    );
}
