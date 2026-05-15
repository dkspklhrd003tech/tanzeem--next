"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "./ImageUploader";

type HomeSlider = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
};

export function HomeSlidersManagement() {
    const [sliders, setSliders] = useState<HomeSlider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<HomeSlider | null>(null);
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
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            const res = await fetch("/api/sliders");
            if (res.ok) {
                const data = await res.json();
                setSliders(data);
            }
        } catch (error) {
            console.error("Failed to load sliders", error);
            toast({
                title: "Error",
                description: "Failed to load sliders.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (slider?: HomeSlider) => {
        if (slider) {
            setEditingSlider(slider);
            setFormData({
                title: slider.title,
                imageUrl: slider.imageUrl,
                linkUrl: slider.linkUrl || "",
                order: slider.order,
                isActive: slider.isActive,
            });
        } else {
            setEditingSlider(null);
            setFormData({
                title: "",
                imageUrl: "",
                linkUrl: "",
                order: sliders.length,
                isActive: true,
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlider(null);
        setPreviewUrl(null);
    };

    // Removed handleFileUpload as we use ImageUploader now

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.imageUrl) {
                toast({ title: "Image Required", description: "You must upload a slider image.", variant: "destructive" });
                setIsLoading(false);
                return;
            }

            const isEditing = !!editingSlider;
            const url = isEditing ? `/api/sliders/${editingSlider.id}` : "/api/sliders";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save slider");

            toast({
                title: "Success!",
                description: `Slider Successfully ${isEditing ? "Updated" : "Added"}.`,
            });

            closeModal();
            fetchSliders();
        } catch (error: any) {
            toast({
                title: "Operation Failed",
                description: error.message || "Failed to save slider.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to Delete Slider?"${title}"?`)) return;

        try {
            const res = await fetch(`/api/sliders/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to Delete Slider");

            toast({
                title: "Slider Deleted",
                description: "The Slider has been Permanently Removed.",
            });

            fetchSliders();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete slider.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Home Sliders</h1>
                    <p className="text-sm text-foreground-muted mt-1">Manage the Large Carousel Images running on the Homepage</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:bg-primary-dark active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add New Slider
                </button>
            </div>

            {isLoading && sliders.length === 0 ? (
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
                                {sliders.map((slider) => (
                                    <tr key={slider.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 w-48">
                                            <div className="w-40 h-16 rounded-md overflow-hidden bg-muted border border-border relative">
                                                {slider.imageUrl ? (
                                                    <img src={slider.imageUrl} alt={slider.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{slider.title}</div>
                                            {slider.linkUrl && (
                                                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                    <LinkIcon className="w-3 h-3" />
                                                    <a href={slider.linkUrl} target="_blank" className="hover:underline">Link Output</a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {slider.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={slider.isActive ? "default" : "secondary"}>
                                                {slider.isActive ? "Visible" : "Hidden"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(slider)}
                                                    className="p-2 text-foreground-light hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                                                    title="Edit Slider"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(slider.id, slider.title)}
                                                    className="p-2 text-foreground-light hover:text-destructive transition-colors hover:bg-destructive/10 rounded-md"
                                                    title="Delete Slider"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sliders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                            No sliders found. Click "Add Slider" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cinematic 3D Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 45, y: 50, z: -100 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, z: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: -45, y: -20, z: -100 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                    {editingSlider ? "Edit Slider Details" : "Add New Slider"}
                                </h1>
                                <button
                                    onClick={closeModal}
                                    className="text-foreground-muted hover:text-foreground transition-all p-2 hover:bg-muted rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-5">

                                {/* Image Uploader */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-primary" />
                                            <span>Slider Image</span>
                                        </div>
                                        <span className="text-xs text-foreground-muted font-normal">(Ratio: 1351x374 recommended)</span>
                                    </label>

                                    <ImageUploader
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                        aspectRatio={1351 / 374}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Admin Reference Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="e.g. Ramadan Special 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Target Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        className="w-full py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="/program/ramadan OR https://youtube.com/..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">Sort Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">Visibility</label>
                                        <select
                                            value={formData.isActive ? "true" : "false"}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="true">Active (Visible)</option>
                                            <option value="false">Hidden (Disabled)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || isUploading}
                                        className="px-8 py-2.5 bg-[#0d5844] text-[#fefefc] rounded-xl font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? "Saving..." : editingSlider ? "Update Slider" : "Create Slider"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
