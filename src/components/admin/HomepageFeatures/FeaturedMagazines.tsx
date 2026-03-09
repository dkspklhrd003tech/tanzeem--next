"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function FeaturedMagazines() {
    const [magazines, setMagazines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        coverImage: "",
        isFeatured: true,
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchMagazines();
    }, []);

    const fetchMagazines = async () => {
        try {
            const res = await fetch("/api/magazines");
            if (res.ok) {
                const data = await res.json();
                setMagazines(data.magazines || []);
            }
        } catch (error) {
            console.error("Failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                category: item.category || "Monthly", // Actually category might not exist on mag but this serves as subtitle
                coverImage: item.coverImage || "",
                isFeatured: item.isFeatured,
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "",
                category: "Monthly",
                coverImage: "",
                isFeatured: true,
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setPreviewUrl(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        setPreviewUrl(URL.createObjectURL(file));

        setIsUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("type", "cover");

        try {
            const res = await fetch("/api/upload", { method: "POST", body: form });
            const data = await res.json();
            if (res.ok && data.success) {
                setFormData(prev => ({ ...prev, coverImage: data.url }));
                toast({ title: "Cover Uploaded", description: "Image saved successfully." });
            } else throw new Error(data.error);
        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.coverImage) {
            toast({ title: "Cover Missing", description: "You must upload a cover image.", variant: "destructive" });
            setIsLoading(false); return;
        }

        try {
            const isEditing = !!editingItem;
            const res = await fetch(isEditing ? `/api/magazines/${editingItem.id}` : "/api/magazines", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("API Route Blocked");
            toast({ title: "Success! 🎉", description: "Featured magazine saved." });
            closeModal();
            fetchMagazines();
        } catch (err: any) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            await fetch(`/api/magazines/${id}`, { method: "DELETE" });
            toast({ title: "Deleted", description: "Magazine record removed." });
            fetchMagazines();
        } catch (e) { }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Featured Magazines List</h2>
                <button onClick={() => handleOpenModal()} className="flex gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                    <Plus className="w-4 h-4" /> Add Magazine
                </button>
            </div>

            <table className="w-full text-left bg-background border border-border rounded-xl shadow-sm text-sm">
                <thead className="bg-muted/50 text-foreground-muted border-b border-border">
                    <tr>
                        <th className="px-4 py-3">Cover</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Homepage Feature</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {magazines.map(m => (
                        <tr key={m.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                                <div className="w-12 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                                    {m.coverImage ? <img src={m.coverImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                                {m.title}
                                <div className="text-xs text-foreground-muted font-normal uppercase">{m.category || "Issue"}</div>
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant={m.isFeatured ? "default" : "secondary"}>{m.isFeatured ? "Featured" : "Hidden"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => handleOpenModal(m)} className="p-2 text-foreground-light hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(m.id, m.title)} className="p-2 text-foreground-light hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="p-5 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingItem ? "Edit Magazine" : "Add Magazine"}</h3>
                            <button type="button" onClick={closeModal}><X className="w-5 h-5 text-foreground-light" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div>
                                <label className="text-sm font-medium">Cover (13:18 Size recommended)</label>
                                <div onClick={() => fileInputRef.current?.click()} className="mt-2 w-32 h-44 border-2 border-dashed border-border hover:border-primary flex items-center justify-center rounded cursor-pointer relative overflow-hidden bg-muted/20">
                                    {(formData.coverImage || previewUrl) ? <img src={previewUrl || formData.coverImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                                    {isUploading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center animate-pulse text-xs font-semibold">Uploading...</div>}
                                </div>
                                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Magazine Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-border rounded mt-1 bg-background" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Frequency / Subtitle</label>
                                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border border-border rounded mt-1 bg-background" placeholder="e.g. Monthly" />
                                </div>
                                <div className="w-24">
                                    <label className="text-sm font-medium">Featured</label>
                                    <select value={formData.isFeatured ? "true" : "false"} onChange={e => setFormData({ ...formData, isFeatured: e.target.value === "true" })} className="w-full p-2 border border-border rounded mt-1 bg-background">
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80">Cancel</button>
                                <button type="submit" disabled={isLoading || isUploading} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-dark disabled:opacity-50">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
