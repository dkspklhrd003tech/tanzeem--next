"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type VideoRecord = {
    id: string;
    title: string;
    slug: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    isFeatured: boolean;
    isPublished: boolean;
    createdAt: string;
};

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

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            // We only want to manage the featured ones from here
            // But for fullness, we can filter or just fetch featured natively.
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setPreviewUrl(URL.createObjectURL(file));

        setIsUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("type", "video-thumbnail");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
                toast({ title: "Thumbnail Uploaded", description: "Video thumbnail saved securely." });
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.title || !formData.videoUrl) {
                toast({ title: "Missing Fields", description: "Title and Video URL are required.", variant: "destructive" });
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
                title: "Success! 🎉",
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

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Featured Videos</h2>
                    <p className="text-foreground-muted text-sm mt-1">Manage the "Regular Video Broadcasts" highlighted on the Homepage.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Feature Video
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
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-foreground-muted text-sm border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Cover</th>
                                    <th className="px-6 py-4 font-medium">Broadcast Title</th>
                                    <th className="px-6 py-4 font-medium">Video Link</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {videos.map((vid) => (
                                    <tr key={vid.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 w-48">
                                            <div className="w-32 h-20 rounded-md overflow-hidden bg-muted border border-border relative flex items-center justify-center">
                                                {vid.thumbnailUrl ? (
                                                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-muted-foreground"><Video className="w-6 h-6" /></div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm shadow-sm pl-1">
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
                                        <td className="px-6 py-4">
                                            <Badge variant={vid.isFeatured ? "default" : "secondary"} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
                                                Featured
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(vid)} className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(vid.id, vid.title)} className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {videos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                            No featured videos found. Click "Feature Video" to spotlight your first broadcast.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                            <label className="text-sm font-medium text-foreground">Video Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="Khutba e Jummah"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Video URL (YouTube) *</label>
                                            <input
                                                type="text"
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                                placeholder="https://youtube.com/watch?..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Thumbnail Generator/Upload Area */}
                                    <div className="bg-muted/10 p-5 rounded-xl border border-border">
                                        <label className="block text-sm font-medium text-foreground mb-3">Custom Thumbnail Cover</label>
                                        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative w-full max-w-[200px] aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group flex-shrink-0"
                                            >
                                                {(previewUrl || formData.thumbnailUrl) ? (
                                                    <img src={previewUrl || formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-foreground-muted p-2 text-center text-xs">
                                                        <ImageIcon className="w-6 h-6 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        <span>Upload Cover</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

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
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                                <button form="videoForm" type="submit" disabled={isLoading || isUploading} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-dark transition-colors min-w-[120px]">
                                    {isLoading ? <div className="mx-auto w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Save Video"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
