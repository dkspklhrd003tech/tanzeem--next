"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon, Video, GripVertical, Youtube, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "../ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableVideoRow({ vid, onEdit, onDelete }: { vid: VideoRecord; onEdit: (v: VideoRecord) => void; onDelete: (id: string, title: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: vid.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-muted/30 transition-colors group">
            <td className="px-6 py-4 w-10">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-primary transition-colors">
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>
            <td className="px-6 py-4 w-48">
                <div className="w-32 h-20 rounded-md overflow-hidden bg-muted border border-border relative flex items-center justify-center">
                    {vid.thumbnailUrl ? (
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground"><Video className="w-6 h-6" /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/50 text-[#fefefc] flex items-center justify-center backdrop-blur-sm shadow-sm pl-1">
                            ▶
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-foreground">{vid.title}</div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-xs text-primary max-w-[200px] truncate">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <a href={vid.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{vid.videoUrl}</a>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(vid)} className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10" title="Edit">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(vid.id, vid.title)} className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function FeaturedVideos() {
    const [videos, setVideos] = useState<VideoRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        videoUrl: "",
        thumbnailUrl: "",
        isFeatured: true, // Auto-flag to display on homepage
        isPublished: true,
    });

    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
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

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = videos.findIndex((v) => v.id === active.id);
            const newIndex = videos.findIndex((v) => v.id === over.id);

            const newOrder = arrayMove(videos, oldIndex, newIndex);
            setVideos(newOrder);

            // Sync with backend
            try {
                const patchPayload = newOrder.map((v, index) => ({
                    id: v.id,
                    order: index,
                }));

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
            } catch (error) {
                toast({ title: "Sync Failed", description: "Could not persist reordering.", variant: "destructive" });
                fetchVideos(); // Rollback
            }
        }
    };

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
            setFormData({
                title: "",
                slug: "",
                videoUrl: "",
                thumbnailUrl: "",
                isFeatured: true,
                isPublished: true,
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVideo(null);
        setPreviewUrl(null);
    };

    // Removed handleFileUpload as we use ImageUploader now

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.title) {
                toast({ title: "Missing Fields", description: "Title is required.", variant: "destructive" });
                setIsLoading(false);
                return;
            }

            const isEditing = !!editingVideo;
            const url = isEditing ? `/api/videos/${editingVideo.id}` : "/api/videos";
            const method = isEditing ? "PUT" : "POST";

            // Enforce slug generation internally if missing
            const activeSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
                description: `Featured Video successfully ${isEditing ? "updated" : "added"}.`,
            });

            closeModal();
            fetchVideos();
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const [deletingVideo, setDeletingVideo] = useState<{id: string, title: string} | null>(null);

    const handleDelete = async (id: string, title: string) => {
        setDeletingVideo(null);

        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete video");

            toast({ title: "Video Deleted", description: "The featured broadcast has been removed." });
            fetchVideos();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Auto-generate generic thumbnail from Youtube if provided link
    const extractYTThumbnail = () => {
        const url = formData.videoUrl;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            const ytid = match[2];
            const mq = `https://img.youtube.com/vi/${ytid}/mqdefault.jpg`;
            setPreviewUrl(mq);
            setFormData(prev => ({ ...prev, thumbnailUrl: mq }));
            toast({ title: "Thumbnail Generated", description: "Successfully ripped standard YouTube Thumbnail." });
        } else {
            toast({ title: "Invalid Link", description: "Could not parse YouTube ID.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Featured Video Broadcasts</h2>
                    <p className="text-sm text-foreground-muted mt-1">Directly manage and Spotlight "Regular Video Broadcasts" on the Landing Page.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:bg-primary-dark active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Spotlight Video
                </button>
            </div>

            {isLoading && videos.length === 0 ? (
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 text-foreground font-semibold text-xs uppercase tracking-wider border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10"></th>
                                        <th className="px-6 py-4">Cover frame</th>
                                        <th className="px-6 py-4">Broadcast Title</th>
                                        <th className="px-6 py-4">Direct Link</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={videos.map(v => v.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <tbody className="divide-y divide-border">
                                        {videos.map((vid) => (
                                            <SortableVideoRow key={vid.id} vid={vid} onEdit={handleOpenModal} onDelete={handleDelete} />
                                        ))}
                                        {videos.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                                    No featured videos found. Click "Feature Video" to spotlight your first broadcast.
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

            {/* Video Editor Modal */}
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
                                    {editingVideo ? "Edit Video" : "Feature New Video"}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground-muted hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="videoForm" onSubmit={handleSave} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">Broadcast Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="e.g. Khutba e Jummah"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground">URL</label>
                                            <input
                                                type="text"
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="https://youtube.com/watch?..."
                                            />
                                        </div>
                                    </div>

                                    {/* Thumbnail Generator/Upload Area */}
                                    <div className="bg-muted/10 p-5 rounded-xl border border-border">
                                        <label className="block text-sm font-medium text-foreground mb-3">Custom Thumbnail Cover <span className="text-xs font-normal text-foreground-muted">(255x144 recommended)</span></label>
                                        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                                            <div className="flex-shrink-0 w-full max-w-[200px]">
                                                <ImageUploader
                                                    value={formData.thumbnailUrl}
                                                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                                                    aspectRatio={16 / 9}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-3 justify-center text-sm text-foreground-muted w-full">
                                                <p>Manually upload a 16:9 thumbnail frame, OR attempt to fetch the cover payload directly from YouTube.</p>
                                                <button
                                                    type="button"
                                                    onClick={extractYTThumbnail}
                                                    className="w-auto self-start px-3 py-1.5 border border-border rounded shadow-sm bg-background hover:bg-muted font-medium transition-colors text-primary"
                                                >
                                                    Auto-fetch YouTube Thumbnail
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-all active:scale-95">
                                    Cancel
                                </button>
                                <ConfirmDialog
                                    title={editingVideo ? "Update Video" : "Feature Video"}
                                    description={`Are you sure you want to ${editingVideo ? "update" : "feature"} this video broadcast?`}
                                    onConfirm={() => document.getElementById("videoForm")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                                >
                                    <button type="button" disabled={isLoading || isUploading} className="px-8 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-dark transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[140px]">
                                        {isLoading ? <div className="mx-auto w-5 h-5 border-2 border-white/30 border-t-[#fefefc] rounded-full animate-spin"></div> : "Deploy Video"}
                                    </button>
                                </ConfirmDialog>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmDialog
                open={!!deletingVideo}
                onOpenChange={(open) => !open && setDeletingVideo(null)}
                title="Delete Video"
                description={`Are you sure you want to permanently delete the featured video broadcast "${deletingVideo?.title}"?`}
                onConfirm={() => deletingVideo && handleDelete(deletingVideo.id, deletingVideo.title)}
            />
        </div>
    );
}
