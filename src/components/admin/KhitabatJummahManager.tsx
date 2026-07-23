"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle, MapPin, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface KhitabatAddress {
    id: string;
    masjid: string;
    address: string;
    city: string;
    time: string;
    contact: string | null;
    map: string | null;
    isPublished: boolean;
    createdAt: string;
}

export function KhitabatJummahManager() {
    const [addresses, setAddresses] = useState<KhitabatAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<KhitabatAddress | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        masjid: "",
        address: "",
        city: "",
        time: "",
        contact: "",
        map: "",
        isPublished: true,
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/khitabat-e-jummah?admin=true");
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
            }
        } catch (error) {
            console.error("Error fetching Khitabat-e-Jummah addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (address?: KhitabatAddress) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                masjid: address.masjid,
                address: address.address,
                city: address.city,
                time: address.time,
                contact: address.contact || "",
                map: address.map || "",
                isPublished: address.isPublished,
            });
        } else {
            setEditingAddress(null);
            setFormData({
                masjid: "",
                address: "",
                city: "",
                time: "",
                contact: "",
                map: "",
                isPublished: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingAddress ? `/api/khitabat-e-jummah/${editingAddress.id}` : "/api/khitabat-e-jummah";
            const method = editingAddress ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save address");

            toast({
                title: "Success",
                description: `Address for ${formData.masjid} ${editingAddress ? "updated" : "created"} successfully.`,
            });

            setIsModalOpen(false);
            fetchAddresses();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save address. Please try again.",
            });
        }
    };

    const [deletingAddressId, setDeletingAddressId] = useState<{id: string, masjid: string} | null>(null);

    const handleDelete = async (id: string, masjid: string) => {
        setDeletingAddressId(null);
        try {
            const res = await fetch(`/api/khitabat-e-jummah/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete address");
            
            toast({
                title: "Success",
                description: `Address for ${masjid} deleted successfully.`,
            });

            fetchAddresses();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete address. Please try again.",
            });
        }
    };

    const filteredAddresses = addresses.filter(a =>
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Khitabat-e-Jummah Addresses Manager</h1>
                    <p className="text-foreground-muted">Manage Friday sermon venues, schedules, contacts, and locations.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Venue
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by city, masjid, or address..."
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
                                <th className="px-6 py-4 font-medium">Masjid & City</th>
                                <th className="px-6 py-4 font-medium">Address</th>
                                <th className="px-6 py-4 font-medium">Time / Schedule</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading addresses...</td>
                                </tr>
                            ) : filteredAddresses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No venues found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredAddresses.map((addr) => (
                                    <tr key={addr.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">{addr.masjid || "Masjid"}</p>
                                            <Badge variant="outline" className="mt-1">{addr.city}</Badge>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <span className="text-muted-foreground text-xs flex items-center gap-1 truncate" title={addr.address}>
                                                <MapPin className="w-3 h-3 shrink-0 text-primary" />
                                                {addr.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-xs">{addr.time}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-xs">{addr.contact || "No Contact"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={addr.isPublished ? "default" : "secondary"}>
                                                {addr.isPublished ? "Active" : "Hidden"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(addr)}>
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeletingAddressId({id: addr.id, masjid: addr.masjid})}>
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

            {/* Address Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl border border-border rounded-xl shadow-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">{editingAddress ? "Edit Venue Address" : "Create New Venue Address"}</h2>
                            <Button type="button" variant="destructive" size="icon" className="rounded-full w-7 h-7 flex items-center justify-center p-0 bg-destructive text-white" onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-white" /></Button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="khitabat-address-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Masjid Name</label>
                                        <input type="text" required placeholder="e.g. Jamia Masjid Bilal" className="w-full p-2 border border-border rounded bg-background" value={formData.masjid} onChange={e => setFormData({ ...formData, masjid: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">City</label>
                                        <input type="text" required placeholder="e.g. Lahore" className="w-full p-2 border border-border rounded bg-background" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Time / Schedule</label>
                                        <input type="text" required placeholder="e.g. 1:30 PM" className="w-full p-2 border border-border rounded bg-background" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Number</label>
                                        <input type="text" placeholder="e.g. 0300-1234567" className="w-full p-2 border border-border rounded bg-background" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium">Complete Physical Address</label>
                                    <textarea required rows={3} placeholder="Enter full address details..." className="w-full p-2 border border-border rounded bg-background resize-none text-sm" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium">Google Map Location Link</label>
                                    <input type="url" placeholder="https://maps.app.goo.gl/..." className="w-full p-2 border border-border rounded bg-background text-sm" value={formData.map} onChange={e => setFormData({ ...formData, map: e.target.value })} />
                                </div>

                                <div className="flex gap-6 mt-6 p-4 bg-muted/50 rounded-lg border border-border">
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
                                title="Save Address"
                                description="Are you sure you want to save this Friday sermon address?"
                                onConfirm={() => {
                                    document.getElementById("khitabat-address-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                                }}
                             >
                                <Button type="button">Save Address</Button>
                             </ConfirmDialog>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDialog
                open={!!deletingAddressId}
                onOpenChange={(open) => !open && setDeletingAddressId(null)}
                title="Delete Venue Address"
                description={`Are you sure you want to delete the Friday sermon venue "${deletingAddressId?.masjid}"?`}
                onConfirm={() => {
                    if (deletingAddressId) {
                        return handleDelete(deletingAddressId.id, deletingAddressId.masjid);
                    }
                }}
            />
        </div>
    );
}
