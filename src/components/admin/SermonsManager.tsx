"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Mic2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SermonItem {
    id: string;
    title: string;
    slug: string;
    speakerName: string | null;
    sermonDate: string | null;
    audioUrl: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    description: string | null;
    isPublished: boolean;
    createdAt: string;
}

const defaultFormData = {
    title: "",
    slug: "",
    speakerName: "",
    sermonDate: "",
    description: "",
    audioUrl: "",
    videoUrl: "",
    thumbnailUrl: "",
    isPublished: true,
};

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function SermonsManager() {
    const [sermons, setSermons] = useState<SermonItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSermon, setEditingSermon] = useState<SermonItem | null>(null);
    const [deletingId, setDeletingId] = useState<{ id: string; title: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState(defaultFormData);
    const { toast } = useToast();

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/sermons");
            if (res.ok) {
                const data = await res.json();
                setSermons(data.items || []);
            } else {
                throw new Error("Failed to fetch sermons");
            }
        } catch (error) {
            console.error("Error fetching sermons:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load sermons. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (sermon?: SermonItem) => {
        if (sermon) {
            setEditingSermon(sermon);
            setFormData({
                title: sermon.title,
                slug: sermon.slug,
                speakerName: sermon.speakerName || "",
                sermonDate: sermon.sermonDate
                    ? sermon.sermonDate.split("T")[0]
                    : "",
                description: sermon.description || "",
                audioUrl: sermon.audioUrl || "",
                videoUrl: sermon.videoUrl || "",
                thumbnailUrl: sermon.thumbnailUrl || "",
                isPublished: sermon.isPublished,
            });
        } else {
            setEditingSermon(null);
            setFormData(defaultFormData);
        }
        setIsModalOpen(true);
    };

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: generateSlug(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title: formData.title,
            slug: formData.slug,
            speakerName: formData.speakerName || null,
            sermonDate: formData.sermonDate || null,
            description: formData.description || null,
            audioUrl: formData.audioUrl || null,
            videoUrl: formData.videoUrl || null,
            thumbnailUrl: formData.thumbnailUrl || null,
            isPublished: formData.isPublished,
        };

        try {
            const url = editingSermon
                ? `/api/admin/sermons/${editingSermon.id}`
                : "/api/admin/sermons";
            const method = editingSermon ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to save sermon");
            }

            toast({
                title: "Success",
                description: `Sermon "${formData.title}" ${editingSermon ? "updated" : "created"} successfully.`,
            });

            setIsModalOpen(false);
            fetchSermons();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save sermon. Please try again.",
            });
        }
    };

    const handleDelete = async (id: string, title: string) => {
        setDeletingId(null);
        try {
            const res = await fetch(`/api/admin/sermons/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete sermon");

            toast({
                title: "Success",
                description: `Sermon "${title}" deleted successfully.`,
            });

            fetchSermons();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete sermon. Please try again.",
            });
        }
    };

    const filteredSermons = sermons.filter(
        (s) =>
            s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.speakerName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Sermons Manager</h1>
                    <p className="text-foreground-muted">Manage Khitab-e-Jum&apos;ah sermons, speakers, and media links.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Sermon
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by title or speaker..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Speaker</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        <span className="flex items-center justify-center gap-2">
                                            <Mic2 className="w-4 h-4 animate-pulse" />
                                            Loading sermons...
                                        </span>
                                    </td>
                                </tr>
                            ) : filteredSermons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No sermons found{searchTerm ? " matching your search" : ""}. Click &quot;Add New Sermon&quot; to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredSermons.map((sermon) => (
                                    <tr key={sermon.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-foreground">{sermon.title}</p>
                                            <p className="text-muted-foreground text-xs mt-0.5">{sermon.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{sermon.speakerName || <span className="text-muted-foreground">—</span>}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-muted-foreground">{formatDate(sermon.sermonDate)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={sermon.isPublished ? "default" : "secondary"}>
                                                {sermon.isPublished ? "Published" : "Draft"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenModal(sermon)}
                                                    aria-label={`Edit ${sermon.title}`}
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingId({ id: sermon.id, title: sermon.title })}
                                                    aria-label={`Delete ${sermon.title}`}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
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

            {/* Sermon Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-3xl border border-border rounded-xl shadow-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">
                                {editingSermon ? "Edit Sermon" : "Add New Sermon"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                ×
                            </Button>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="sermon-form" onSubmit={handleSubmit} className="space-y-5">
                                {/* Title + Slug */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Iqamat-e-Deen — Hamari Zimmedari"
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Slug <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="auto-generated-from-title"
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm font-mono"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Speaker + Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Speaker Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Shujauddin Sheikh"
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                            value={formData.speakerName}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, speakerName: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Sermon Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                            value={formData.sermonDate}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, sermonDate: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Audio URL + Video URL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Audio URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/audio.mp3"
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                            value={formData.audioUrl}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, audioUrl: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Video URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                            value={formData.videoUrl}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Thumbnail URL */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/thumbnail.jpg"
                                        className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-primary text-sm"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <RichTextEditor
                                        content={formData.description}
                                        onChange={(content) =>
                                            setFormData((prev) => ({ ...prev, description: content }))
                                        }
                                        placeholder="Enter sermon description, notes, or summary..."
                                    />
                                </div>

                                {/* Published toggle */}
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={formData.isPublished}
                                            onChange={(e) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    isPublished: e.target.checked,
                                                }));
                                            }}
                                        />
                                        <span className="text-sm font-medium">Visible to Public</span>
                                    </label>
                                    <span className="text-xs text-muted-foreground">
                                        (Uncheck to save as draft)
                                    </span>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="sermon-form"
                            >
                                {editingSermon ? "Update Sermon" : "Create Sermon"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title="Delete Sermon"
                description={`Are you sure you want to delete "${deletingId?.title}"? This action cannot be undone.`}
                onConfirm={() => deletingId && handleDelete(deletingId.id, deletingId.title)}
            />
        </div>
    );
}
