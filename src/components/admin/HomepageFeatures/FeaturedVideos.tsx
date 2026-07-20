"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, XCircle, X, Link as LinkIcon, Video, GripVertical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "../ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type VideoRecord = {
    id: string;
    title: string;
    slug: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    isFeatured: boolean;
    isPublished: boolean;
    order: number;
    createdAt: string;
};

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableVideoRow({
    vid,
    isDeleting,
    onEdit,
    onDelete,
}: {
    vid: VideoRecord;
    isDeleting: boolean;
    onEdit: (v: VideoRecord) => void;
    onDelete: (id: string, title: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: vid.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-muted/30 transition-colors group">
            {/* Drag handle */}
            <td className="px-6 py-4 w-10">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-primary transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>

            {/* Thumbnail */}
            <td className="px-6 py-4 w-48">
                <div className="w-32 h-20 rounded-md overflow-hidden bg-muted border border-border relative flex items-center justify-center">
                    {vid.thumbnailUrl ? (
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground">
                            <Video className="w-7 h-7" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-black/50 text-[#fefefc] flex items-center justify-center backdrop-blur-sm shadow-sm pl-1">
                            ▶
                        </div>
                    </div>
                </div>
            </td>

            {/* Title */}
            <td className="px-6 py-4">
                <div className="font-medium text-foreground">{vid.title}</div>
            </td>

            {/* Link */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-xs text-primary max-w-[200px] truncate">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <a
                        href={vid.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                    >
                        {vid.videoUrl}
                    </a>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(vid)}
                        disabled={isDeleting}
                        className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10 disabled:opacity-40"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(vid.id, vid.title)}
                        disabled={isDeleting}
                        className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50 disabled:opacity-40"
                        title="Delete"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeaturedVideos() {
    const [videos, setVideos] = useState<VideoRecord[]>([]);
    // isLoading controls the initial full-page skeleton only
    const [isLoading, setIsLoading] = useState(true);
    // isSaving controls the Deploy button spinner — does NOT re-show the skeleton
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        videoUrl: "",
        thumbnailUrl: "",
        isFeatured: true,
        isPublished: true,
    });

    const [deletingVideo, setDeletingVideo] = useState<{ id: string; title: string } | null>(null);

    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch("/api/videos?featured=true");
            if (res.ok) {
                const data = await res.json();
                setVideos(data.videos || []);
            }
        } catch (error) {
            console.error("Failed to load featured videos", error);
            toast({ title: "Error", description: "Failed to load featured videos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Drag-to-reorder ──────────────────────────────────────────────────────

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = videos.findIndex((v) => v.id === active.id);
        const newIndex = videos.findIndex((v) => v.id === over.id);
        const newOrder = arrayMove(videos, oldIndex, newIndex);

        // Optimistic UI update
        setVideos(newOrder);

        try {
            const patchPayload = newOrder.map((v, index) => ({ id: v.id, order: index }));
            const res = await fetch("/api/videos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orders: patchPayload }),
            });

            if (res.ok) {
                toast({ title: "Order Updated", description: "Videos reordered successfully." });
            } else {
                throw new Error("Failed to sync order");
            }
        } catch {
            toast({ title: "Sync Failed", description: "Could not persist reordering.", variant: "destructive" });
            fetchVideos(); // Rollback to server state
        }
    };

    // ── Modal open/close ─────────────────────────────────────────────────────

    const handleOpenModal = (video?: VideoRecord) => {
        if (video) {
            setEditingVideo(video);
            setFormData({
                title: video.title,
                slug: video.slug,
                videoUrl: video.videoUrl,
                thumbnailUrl: video.thumbnailUrl || "",
                isFeatured: video.isFeatured,
                isPublished: video.isPublished,
            });
        } else {
            setEditingVideo(null);
            setFormData({ title: "", slug: "", videoUrl: "", thumbnailUrl: "", isFeatured: true, isPublished: true });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVideo(null);
        setPreviewUrl(null);
    };

    // ── Save (create / update) ───────────────────────────────────────────────

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── Client-side validation ──
        if (!formData.title.trim()) {
            toast({ title: "Missing Fields", description: "Broadcast title is required.", variant: "destructive" });
            return;
        }
        if (!formData.videoUrl.trim()) {
            toast({ title: "Missing Fields", description: "Video URL is required.", variant: "destructive" });
            return;
        }

        setIsSaving(true);

        try {
            const isEditing = !!editingVideo;
            const url = isEditing ? `/api/videos/${editingVideo.id}` : "/api/videos";
            const method = isEditing ? "PUT" : "POST";

            const activeSlug =
                formData.slug ||
                formData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");

            const payload = { ...formData, slug: activeSlug };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save video");

            toast({
                title: "Success!",
                description: `Featured video successfully ${isEditing ? "updated" : "added"}.`,
            });

            closeModal();

            if (!isEditing && data.video) {
                // Optimistic prepend — new entry is visible immediately
                setVideos((prev) => [data.video as VideoRecord, ...prev]);
            }

            // Background sync to get the authoritative server order
            fetchVideos();
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = async (id: string, title: string) => {
        setDeletingVideo(null);
        setDeletingId(id);

        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete video");

            // Remove optimistically from local state
            setVideos((prev) => prev.filter((v) => v.id !== id));
            toast({ title: "Video Deleted", description: "The featured broadcast has been removed." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            fetchVideos(); // Restore if deletion failed
        } finally {
            setDeletingId(null);
        }
    };

    // ── YouTube helpers ──────────────────────────────────────────────────────

    const extractYouTubeId = (rawUrl: string): string | null => {
        if (!rawUrl?.trim()) return null;
        try {
            const urlStr = rawUrl.trim().startsWith("http") ? rawUrl.trim() : `https://${rawUrl.trim()}`;
            const parsed = new URL(urlStr);
            const host = parsed.hostname.replace(/^(www\.|m\.|music\.)/, "");

            if (host === "youtu.be") {
                const id = parsed.pathname.split("/")[1]?.split("?")[0];
                return id?.length === 11 ? id : null;
            }
            if (host === "youtube.com") {
                const parts = parsed.pathname.split("/").filter(Boolean);
                if (parts[0] === "shorts" && parts[1]?.length === 11) return parts[1];
                if (parts[0] === "embed" && parts[1]?.length === 11) return parts[1];
                if (parts[0] === "v" && parts[1]?.length === 11) return parts[1];
                const v = parsed.searchParams.get("v");
                return v?.length === 11 ? v : null;
            }
        } catch {
            // fall through to regex
        }
        const m = rawUrl.match(/(?:v=|\/)([\w-]{11})(?:[?&]|$)/);
        return m ? m[1] : null;
    };

    const extractYTThumbnail = () => {
        const ytid = extractYouTubeId(formData.videoUrl);
        if (ytid) {
            const mq = `https://img.youtube.com/vi/${ytid}/mqdefault.jpg`;
            setPreviewUrl(mq);
            setFormData((prev) => ({ ...prev, thumbnailUrl: mq }));
            toast({ title: "Thumbnail Generated", description: "Successfully fetched YouTube thumbnail." });
        } else {
            toast({
                title: "Invalid Link",
                description: "Could not extract a YouTube video ID from the provided URL.",
                variant: "destructive",
            });
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Featured Video Broadcasts</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                        Directly manage and Spotlight &quot;Regular Video Broadcasts&quot; on the Landing Page.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Spotlight Video
                </button>
            </div>

            {/* Table (skeleton only on first load, not on save) */}
            {isLoading && videos.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse space-y-4 w-full">
                        <div className="h-12 bg-muted rounded-lg w-full" />
                        <div className="h-12 bg-muted rounded-lg w-full" />
                        <div className="h-12 bg-muted rounded-lg w-full" />
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
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 text-foreground font-semibold text-xs uppercase tracking-wider border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10" />
                                        <th className="px-6 py-4">Thumbnails</th>
                                        <th className="px-6 py-4">Broadcast Title</th>
                                        <th className="px-6 py-4">Direct Link</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={videos.map((v) => v.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <tbody className="divide-y divide-border">
                                        {videos.map((vid) => (
                                            <SortableVideoRow
                                                key={vid.id}
                                                vid={vid}
                                                isDeleting={deletingId === vid.id}
                                                onEdit={handleOpenModal}
                                                onDelete={(id, title) => setDeletingVideo({ id, title })}
                                            />
                                        ))}
                                        {videos.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                                    No featured videos found. Click &quot;Spotlight Video&quot; to add your first broadcast.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    </div>
                </div>
            )}

            {/* ── Feature / Edit Modal ───────────────────────────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]"
                        >
                            {/* Modal header */}
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                                <h3 className="text-xl font-bold text-foreground">
                                    {editingVideo ? "Edit Video" : "Feature New Video"}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-foreground-muted hover:text-foreground"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form body */}
                            <div className="p-6 overflow-y-auto">
                                <form id="videoForm" onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">
                                                Broadcast Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="e.g. Khutba e Jummah"
                                            />
                                        </div>

                                        {/* URL */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">
                                                URL <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="https://youtube.com/watch?..."
                                            />
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="bg-muted/10 p-5 rounded-xl border border-border">
                                        <label className="block text-sm font-medium text-foreground mb-3">
                                            Custom Thumbnail Cover{" "}
                                            <span className="text-xs font-normal text-foreground-muted">(255x144 recommended)</span>
                                        </label>
                                        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                                            <div className="flex-shrink-0 w-full max-w-[200px]">
                                                <ImageUploader
                                                    value={formData.thumbnailUrl}
                                                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                                                    aspectRatio={16 / 9}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3 justify-center text-sm text-foreground-muted w-full">
                                                <p>
                                                    Manually upload a 16:9 thumbnail frame, OR attempt to fetch the cover
                                                    payload directly from YouTube.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={extractYTThumbnail}
                                                    className="w-auto self-start px-3 py-1.5 border border-border rounded-full shadow-sm bg-background hover:bg-muted font-medium transition-colors text-primary"
                                                >
                                                    Auto-fetch YouTube Thumbnail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 text-sm font-semibold text-foreground bg-background border border-border rounded-full hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <ConfirmDialog
                                    title={editingVideo ? "Update Video" : "Feature Video"}
                                    description={`Are you sure you want to ${editingVideo ? "update" : "feature"} this video broadcast?`}
                                    onConfirm={() => {
                                        document
                                            .getElementById("videoForm")
                                            ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                                    }}
                                >
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving…
                                            </>
                                        ) : (
                                            "Deploy Video"
                                        )}
                                    </button>
                                </ConfirmDialog>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete confirm dialog ──────────────────────────────────────── */}
            <ConfirmDialog
                open={!!deletingVideo}
                onOpenChange={(open) => !open && setDeletingVideo(null)}
                title="Delete Video"
                description={`Are you sure you want to permanently delete "${deletingVideo?.title}"?`}
                onConfirm={() => {
                    if (deletingVideo) handleDelete(deletingVideo.id, deletingVideo.title);
                }}
            />
        </div>
    );
}
