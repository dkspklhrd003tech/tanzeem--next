"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, XCircle, X, Image as ImageIcon, Link as LinkIcon, GripVertical, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn, resolveMediaUrl } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type HomeSlider = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
};

// --- Sortable Row Component ---
function SortableSliderRow({
    slider,
    onEdit,
    onDelete,
}: {
    slider: HomeSlider;
    onEdit: (s: HomeSlider) => void;
    onDelete: (id: string, title: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slider.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 0,
        position: "relative" as const,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={isDragging ? "bg-muted shadow-lg" : "hover:bg-muted/30 transition-colors"}
        >
            <td className="px-6 py-4 w-12">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 cursor-grab active:cursor-grabbing text-foreground-muted hover:text-foreground"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>
            <td className="px-6 py-4 w-48">
                <div className="w-40 h-16 rounded-md overflow-hidden bg-muted border border-border relative">
                    {slider.imageUrl ? (
                        <img src={resolveMediaUrl(slider.imageUrl)} alt={slider.title} className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-foreground">{slider.title}</div>
                {slider.linkUrl && (
                    <div className="flex items-center gap-1 text-xs text-primary mt-1">
                        <LinkIcon className="w-3 h-3" />
                        <a href={slider.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View Link
                        </a>
                    </div>
                )}
            </td>
            <td className="px-6 py-4 text-foreground-muted">
                <Badge variant="outline" className="font-mono">{slider.order}</Badge>
            </td>
            <td className="px-6 py-4">
                <Badge
                    variant={slider.isActive ? "default" : "secondary"}
                    className={slider.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}
                >
                    {slider.isActive ? "Visible" : "Hidden"}
                </Badge>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(slider)}
                        className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(slider.id, slider.title)}
                        className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                        title="Delete"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function HomeSlidersManagement() {
    const [sliders, setSliders] = useState<HomeSlider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<HomeSlider | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingSliderId, setDeletingSliderId] = useState<{ id: string; title: string } | null>(null);
    const [bannerStyle, setBannerStyle] = useState<"slider" | "fixed">("slider");
    const [fixedBannerData, setFixedBannerData] = useState({ imageUrl: "", title: "", linkUrl: "" });
    const [isSavingFixed, setIsSavingFixed] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        linkUrl: "",
        isActive: true,
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchSliders();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                const homepage = data.settings?.homepage || {};
                setBannerStyle(homepage.hero_banner_style || "slider");
                setFixedBannerData({
                    imageUrl: homepage.hero_fixed_image || "",
                    title: homepage.hero_fixed_title || "",
                    linkUrl: homepage.hero_fixed_link || ""
                });
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        }
    };

    const updateBannerStyle = async (style: "slider" | "fixed") => {
        setBannerStyle(style);
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group: "homepage",
                    settings: { hero_banner_style: style }
                })
            });
            toast({ title: "Updated", description: `Banner style set to ${style === "fixed" ? "Fixed Image" : "Slider"}` });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update banner style." });
        }
    };

    const handleSaveFixedBanner = async () => {
        setIsSavingFixed(true);
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group: "homepage",
                    settings: {
                        hero_fixed_image: fixedBannerData.imageUrl,
                        hero_fixed_title: fixedBannerData.title,
                        hero_fixed_link: fixedBannerData.linkUrl
                    }
                })
            });
            toast({ title: "Success", description: "Fixed banner Saved Successfully." });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save fixed banner." });
        } finally {
            setIsSavingFixed(false);
        }
    };

    const fetchSliders = async () => {
        try {
            const res = await fetch("/api/sliders");
            if (res.ok) {
                const data = await res.json();
                // Sort by order descending (highest order = first)
                setSliders((data as HomeSlider[]).sort((a, b) => b.order - a.order));
            }
        } catch (error) {
            console.error("Failed to load sliders", error);
            toast({ title: "Error", description: "Failed to load sliders.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploading(true);
        try {
            const files = Array.from(e.target.files);
            let addedCount = 0;
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", "uploads");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) continue;
                const data = await res.json();

                await fetch("/api/sliders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: file.name.split('.')[0] || "Slider",
                        imageUrl: data.url,
                        linkUrl: "",
                        isActive: true,
                        order: sliders.length + addedCount + 1
                    }),
                });
                addedCount++;
            }
            if (addedCount > 0) {
                toast({ title: "Success", description: `Uploaded ${addedCount} banners successfully.` });
                fetchSliders();
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to upload banners." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to upload banners." });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sliders.findIndex((i) => i.id === active.id);
            const newIndex = sliders.findIndex((i) => i.id === over.id);
            const newArray = arrayMove(sliders, oldIndex, newIndex);

            // Re-assign orders: top item gets highest order number
            const reorderedArray = newArray.map((item, index) => ({
                ...item,
                order: newArray.length - index,
            }));

            setSliders(reorderedArray);

            try {
                const res = await fetch("/api/sliders", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orders: reorderedArray.map((item) => ({ id: item.id, order: item.order })),
                    }),
                });

                if (!res.ok) throw new Error("Sync failed");

                toast({ title: "Sliders Reordered", description: "The display order has been saved." });
            } catch (err) {
                toast({
                    title: "Reorder Failed",
                    description: "Could not save the new order to the server.",
                    variant: "destructive",
                });
                fetchSliders(); // Revert to server state
            }
        }
    };

    const handleOpenModal = (slider?: HomeSlider) => {
        if (slider) {
            setEditingSlider(slider);
            setFormData({
                title: slider.title,
                imageUrl: slider.imageUrl,
                linkUrl: slider.linkUrl || "",
                isActive: slider.isActive,
            });
        } else {
            setEditingSlider(null);
            setFormData({ title: "", imageUrl: "", linkUrl: "", isActive: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlider(null);
    };

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

            const payload = isEditing
                ? formData
                : { ...formData, order: sliders.length + 1 }; // New sliders go last

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save slider");

            toast({ title: "Success!", description: `Slider ${isEditing ? "updated" : "added"} successfully.` });
            closeModal();
            fetchSliders();
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message || "Failed to save slider.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        setDeletingSliderId(null);
        try {
            const res = await fetch(`/api/sliders/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete slider");
            toast({ title: "Slider Deleted", description: "The slider has been permanently removed." });
            fetchSliders();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete slider.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Home Sliders</h1>
                    <p className="text-sm text-foreground-muted mt-1">
                        Manage homepage carousel images — <span className="font-semibold text-primary">drag rows to reorder</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {bannerStyle === "slider" && (
                        <>
                            <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleBulkUpload} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 border border-border"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                Bulk Upload
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Banner
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border">
                    <button
                        onClick={() => updateBannerStyle("slider")}
                        className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", bannerStyle === "slider" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
                    >
                        Slider (Multiple)
                    </button>
                    <button
                        onClick={() => updateBannerStyle("fixed")}
                        className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", bannerStyle === "fixed" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
                    >
                        Fixed (Single Banner)
                    </button>
                </div>
                {bannerStyle === "fixed" && (
                    <div className="text-sm text-amber-600 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                        In <strong>Fixed mode</strong>, only the banner configured below will be displayed.
                    </div>
                )}
            </div>

            {bannerStyle === "fixed" ? (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6 max-w-3xl">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                <span>Fixed Banner Image</span>
                            </div>
                            <span className="text-xs text-foreground-muted font-normal">(Min size: 1920×450)</span>
                        </label>
                        <ImageUploader
                            value={fixedBannerData.imageUrl}
                            onChange={(url, alt) => {
                                setFixedBannerData({ ...fixedBannerData, imageUrl: url, title: alt || fixedBannerData.title });
                            }}
                            aspectRatio={1920 / 450}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Banner Title (Alt Text)</label>
                        <input
                            type="text"
                            value={fixedBannerData.title}
                            onChange={(e) => setFixedBannerData({ ...fixedBannerData, title: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="e.g. Annual Convention 2026"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Target Link URL (Optional)</label>
                        <input
                            type="text"
                            value={fixedBannerData.linkUrl}
                            onChange={(e) => setFixedBannerData({ ...fixedBannerData, linkUrl: e.target.value })}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveFixedBanner} disabled={isSavingFixed} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                            {isSavingFixed ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Fixed Banner
                        </Button>
                    </div>
                </div>
            ) : isLoading && sliders.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse space-y-4 w-full">
                        <div className="h-16 bg-muted rounded-lg w-full" />
                        <div className="h-16 bg-muted rounded-lg w-full" />
                        <div className="h-16 bg-muted rounded-lg w-full" />
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sliders.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-muted/50 text-foreground-muted text-sm border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 font-medium w-12"></th>
                                            <th className="px-6 py-4 font-medium">Image</th>
                                            <th className="px-6 py-4 font-medium">Details</th>
                                            <th className="px-6 py-4 font-medium">Order</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {sliders.map((slider) => (
                                            <SortableSliderRow
                                                key={slider.id}
                                                slider={slider}
                                                onEdit={handleOpenModal}
                                                onDelete={(id, title) => setDeletingSliderId({ id, title })}
                                            />
                                        ))}
                                        {sliders.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-foreground-muted">
                                                    No sliders found. Click "Add Slider" to create one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
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
                            initial={{ opacity: 0, scale: 0.8, rotateX: 45, y: 50 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: -45, y: -20 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                            className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                    {editingSlider ? "Edit Slider" : "Add New Slider"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-foreground-muted hover:text-foreground transition-all p-2 hover:bg-muted rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form id="slider-form" onSubmit={handleSave} className="p-6 space-y-5">
                                {/* Image Uploader */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-primary" />
                                            <span>Slider Image</span>
                                        </div>
                                        <span className="text-xs text-foreground-muted font-normal">(Min size: 1920×450)</span>
                                    </label>
                                    <ImageUploader
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                        aspectRatio={1920 / 450}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Admin Reference Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="e.g. Ramadan Special 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Target Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="/program/ramadan OR https://youtube.com/..."
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

                                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <ConfirmDialog
                                        title={editingSlider ? "Update Slider" : "Create Slider"}
                                        description={`Are you sure you want to ${editingSlider ? "update" : "create"} this homepage slider?`}
                                        onConfirm={() => {
                                            document.getElementById("slider-form")?.dispatchEvent(
                                                new Event("submit", { cancelable: true, bubbles: true })
                                            );
                                        }}
                                    >
                                        <Button
                                            type="button"
                                            disabled={isLoading || isUploading}
                                            className="px-8 py-2.5 bg-[#0d5844] text-[#fefefc] rounded-xl font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? "Saving..." : editingSlider ? "Update Slider" : "Create Slider"}
                                        </Button>
                                    </ConfirmDialog>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={!!deletingSliderId}
                onOpenChange={(open) => !open && setDeletingSliderId(null)}
                title="Delete Slider"
                description={`Are you sure you want to permanently delete the slider "${deletingSliderId?.title}"?`}
                onConfirm={() => {
                    if (deletingSliderId) {
                        return handleDelete(deletingSliderId.id, deletingSliderId.title);
                    }
                }}
            />
        </div>
    );
}
