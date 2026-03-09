"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type HomeCampaign = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
};

export function CampaignsManager() {
    const [campaigns, setCampaigns] = useState<HomeCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<HomeCampaign | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        linkUrl: "",
        order: 0,
        isActive: true,
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error("Failed to load campaigns", error);
            toast({
                title: "Error",
                description: "Failed to load campaigns.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (campaign?: HomeCampaign) => {
        if (campaign) {
            setEditingCampaign(campaign);
            setFormData({
                title: campaign.title,
                imageUrl: campaign.imageUrl,
                linkUrl: campaign.linkUrl || "",
                order: campaign.order,
                isActive: campaign.isActive,
            });
        } else {
            setEditingCampaign(null);
            setFormData({
                title: "",
                imageUrl: "",
                linkUrl: "",
                order: campaigns.length,
                isActive: true,
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
        setPreviewUrl(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setPreviewUrl(URL.createObjectURL(file));

        setIsUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("type", "campaign");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
                toast({
                    title: "Image Uploaded",
                    description: "Campaign image securely uploaded to server.",
                });
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (err: any) {
            toast({
                title: "Upload Failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.imageUrl) {
                toast({ title: "Image Required", description: "You must upload a campaign image.", variant: "destructive" });
                setIsLoading(false);
                return;
            }

            const isEditing = !!editingCampaign;
            const url = isEditing ? `/api/campaigns/${editingCampaign.id}` : "/api/campaigns";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save campaign");

            toast({
                title: "Success! 🎉",
                description: `Campaign successfully ${isEditing ? "updated" : "added"}.`,
            });

            closeModal();
            fetchCampaigns();
        } catch (error: any) {
            toast({
                title: "Operation Failed",
                description: error.message || "Failed to save campaign.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete campaign "${title}"?`)) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete campaign");

            toast({
                title: "Campaign Deleted",
                description: "The campaign has been permanently removed.",
            });

            fetchCampaigns();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete campaign.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Spotlight Campaigns</h2>
                    <p className="text-foreground-muted text-sm mt-1">Manage the 3x2 grid of featured events and campaigns.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Campaign
                </button>
            </div>

            {isLoading && campaigns.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse space-y-4 w-full">
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-foreground-muted text-sm border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Image</th>
                                    <th className="px-6 py-4 font-medium">Details</th>
                                    <th className="px-6 py-4 font-medium">Sort Order</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 w-48">
                                            <div className="w-32 h-20 rounded-md overflow-hidden bg-muted border border-border relative">
                                                {campaign.imageUrl ? (
                                                    <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{campaign.title}</div>
                                            {campaign.linkUrl && (
                                                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                    <LinkIcon className="w-3 h-3" />
                                                    <a href={campaign.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">View Link</a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-foreground-muted">{campaign.order}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={campaign.isActive ? "default" : "secondary"} className={campaign.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                                                {campaign.isActive ? "Active" : "Hidden"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(campaign)}
                                                    className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(campaign.id, campaign.title)}
                                                    className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                            No campaigns found. Click "Add Campaign" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Campaign Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                                <h3 className="text-xl font-bold text-foreground">
                                    {editingCampaign ? "Edit Campaign" : "Add New Campaign"}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground-muted hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="campaignForm" onSubmit={handleSave} className="space-y-6">

                                    {/* Image Upload Area */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Campaign Image (Card format) *</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-full aspect-[3/2] max-w-sm rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                                        >
                                            {(previewUrl || formData.imageUrl) ? (
                                                <img src={previewUrl || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-foreground-muted">
                                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-sm">Click to upload image</span>
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Display Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="e.g. Free Palestine"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Target Link URL</label>
                                            <input
                                                type="text"
                                                value={formData.linkUrl}
                                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="/path or https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Sort Order</label>
                                            <input
                                                type="number"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-foreground-muted">Lower numbers appear first</p>
                                        </div>

                                        <div className="flex flex-col justify-center pt-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    />
                                                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-muted border border-border'}`}></div>
                                                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'translate-x-6 shadow-sm' : ''}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">Active Status</div>
                                                    <div className="text-xs text-foreground-muted">{formData.isActive ? 'Visible on homepage' : 'Hidden from homepage'}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                                    disabled={isLoading || isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    form="campaignForm"
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "Save Campaign"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
