"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Search, Calendar, GripVertical, FileText,
  Settings2, Check, AlertCircle, UploadCloud, Loader2, ArrowLeft,
  ExternalLink, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

// DnD Kit imports
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface AudioBookItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  audioUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AudioBooksPageEditorProps {
  pageId: string;
  initialPageData: PageRecord;
}

const defaultFormData = {
  title: "",
  slug: "",
  content: "MP3 Audio Attached",
  excerpt: "",
  audioUrl: "",
  featuredImage: "",
  isPublished: true,
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
};

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Sortable Card Item Component ─────────────────────────────────────────────
interface SortableItemProps {
  id: string;
  item: AudioBookItem;
  onEdit: (item: AudioBookItem) => void;
  onDelete: (item: AudioBookItem) => void;
}

function SortableCard({ id, item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isAudio = !!item.audioUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className={cn("h-1.5 w-full", isAudio ? "bg-green-500" : "bg-emerald-500")} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-wider rounded-md",
              isAudio
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            )}
          >
            {isAudio ? "MP3 Audio" : "Written Statement"}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
              onClick={() => onEdit(item)}
              title="Edit Details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => onDelete(item)}
              title="Delete audio book"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>

        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 mb-1" dir="auto">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground font-mono truncate mb-4" title={item.slug}>
          /{item.slug}
        </p>

        {/* Bottom meta information */}
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/75" />
            <span>
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
                : "No Date"}
            </span>
          </div>

          <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] px-2 py-0">
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AudioBooksPageEditor({ pageId, initialPageData }: AudioBooksPageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Page Settings (SEO) state
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<Date | null>(null);

  // audio book Items State
  const [items, setItems] = useState<AudioBookItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AudioBookItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AudioBookItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form State
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);

  // Drag and Drop DragActive State
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD Sensors config
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch("/api/admin/audio-books");
      if (res.ok) {
        const data = await res.json();
        // The API now returns them ordered by orderIndex
        setItems(data.items || []);
      } else {
        throw new Error("Failed to fetch audio books");
      }
    } catch (error) {
      console.error("Error fetching audio books:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load audio books. Please try again.",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Sync Slug automatically from Title
  const handleTitleChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, title: val };
      if (!slugManual) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  // Page SEO / Settings Save
  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pageForm.title.trim()) errors.title = "Title is required";
    if (!pageForm.slug.trim()) errors.slug = "Slug is required";
    if (Object.keys(errors).length > 0) {
      setPageErrors(errors);
      return;
    }

    setIsSavingPage(true);
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title,
          slug: pageForm.slug,
          excerpt: pageForm.excerpt,
          content: pageForm.content || "audio books Page",
          isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle,
          metaDescription: pageForm.metaDescription,
          metaKeywords: pageForm.metaKeywords,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update page settings");
      }

      setLastSavedPage(new Date());
      toast({
        title: "Success",
        description: "Page settings updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save page settings. Please try again.",
      });
    } finally {
      setIsSavingPage(false);
    }
  };

  // Drag over / Drag leave handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid MP3 document.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("type", "uploads");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Parse clean default title from the file name
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanedTitle = baseName
        .split(/[-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setEditingItem(null);
      setSlugManual(false);
      setFormData({
        title: cleanedTitle,
        slug: slugify(cleanedTitle),
        audioUrl: data.url,
        isPublished: true,
        publishedAt: new Date().toISOString().split("T")[0],
        metaTitle: cleanedTitle,
        metaDescription: `audio book: ${cleanedTitle}`,
        content: "MP3 Audio Attached",
        excerpt: "",
        featuredImage: "",
      });
      setFormErrors({});
      setIsModalOpen(true);

      toast({
        title: "MP3 Uploaded Successfully",
        description: "Configure details to save this release to the catalog.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload the file to servers. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditModal = (item: AudioBookItem) => {
    setEditingItem(item);
    setSlugManual(true);
    setFormData({
      title: item.title,
      slug: item.slug,
      content: item.content || "MP3 Audio Attached",
      excerpt: item.excerpt || "",
      audioUrl: item.audioUrl || "",
      featuredImage: item.featuredImage || "",
      isPublished: item.isPublished,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setSlugManual(false);
    setFormData({
      ...defaultFormData,
      publishedAt: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Modal CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.slug.trim()) errors.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const isNew = !editingItem;
      const url = isNew ? "/api/admin/audio-books" : `/api/admin/audio-books/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      // If creating new, assign it to the top/bottom order index
      const payload: Record<string, any> = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content || "MP3 Audio Attached",
        excerpt: formData.excerpt || null,
        audioUrl: formData.audioUrl || null,
        featuredImage: formData.featuredImage || null,
        isPublished: formData.isPublished,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
      };

      if (isNew) {
        // Place new items at the beginning of the list (orderIndex = lowest - 1 or 0)
        const minOrder = items.length > 0 ? Math.min(...items.map(i => i.orderIndex)) : 0;
        payload.orderIndex = minOrder - 1;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save audio book");
      }

      toast({
        title: "Success",
        description: `audio book ${isNew ? "created" : "updated"} successfully.`,
      });

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save the audio book.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingItem(null);
    try {
      const res = await fetch(`/api/admin/audio-books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");

      toast({
        title: "Deleted",
        description: "audio book deleted successfully.",
      });

      fetchItems();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete audio book. Please try again.",
      });
    }
  };

  // DnD Reorder handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    // Assign incremental orderIndex values for strict layout parity
    const updated = reordered.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    setItems(updated);

    try {
      const res = await fetch("/api/admin/audio-books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updated.map(item => ({
            id: item.id,
            orderIndex: item.orderIndex,
          })),
        }),
      });

      if (!res.ok) throw new Error("Reorder save failed");

      toast({
        title: "Order Saved",
        description: "audio books grid sequence synchronized.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to save the layout order. Reverting changes...",
      });
      fetchItems(); // Revert back
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            audio books Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Reorder cards, manage metadata, and upload MP3 Statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSavedPage && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Settings Saved {lastSavedPage.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" asChild>
            <a href="/audio-books" target="_blank" rel="noopener noreferrer">
              Preview Page
            </a>
          </Button>
          <Button onClick={handleOpenAddModal} className="bg-primary text-primary-foreground hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Release
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="list" className="flex items-center gap-2 px-4 py-2 rounded">
            <FileText className="w-4 h-4" /> audio books Grid
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 px-4 py-2 rounded">
            <Settings2 className="w-4 h-4" /> Page SEO & Setup
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: List, Uploader & Drag Grid */}
        <TabsContent value="list" className="space-y-6 outline-none">

          {/* File Drag-and-Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative cursor-pointer py-10 px-6 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center text-center",
              dragActive
                ? "border-primary bg-primary/5 scale-[1.005]"
                : "border-border hover:border-muted-foreground/50 bg-card",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="font-semibold text-foreground">Uploading MP3 document...</p>
                <p className="text-xs text-muted-foreground">This will only take a moment.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-bold text-foreground text-lg">
                  Drag & Drop a audio book MP3 here
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Or click anywhere to choose a file from your computer. Titles and metadata will auto-generate.
                </p>
              </div>
            )}
          </div>

          {/* Grid Search Filter */}
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audio books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background focus:outline-none focus:border-primary text-sm h-10"
              />
            </div>

            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              {filteredItems.length} audio book{filteredItems.length !== 1 ? "s" : ""} found
            </div>
          </div>

          {/* Sortable grid container */}
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading audio books...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
              {searchQuery ? "No search results match your criteria." : "No audio books found. Drop a MP3 file above to add one!"}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map(item => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <SortableCard
                      key={item.id}
                      id={item.id}
                      item={item}
                      onEdit={handleOpenEditModal}
                      onDelete={setDeletingItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

        </TabsContent>

        {/* Tab 2: SEO Settings Tab */}
        <TabsContent value="settings" className="outline-none">
          <form onSubmit={handlePageSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main parameters */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl border border-border">
                  <CardHeader>
                    <CardTitle>Page Metadata</CardTitle>
                    <CardDescription>
                      Configure standard page title, path, and excerpt fields.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="page-title">Page Title <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-title"
                          value={pageForm.title}
                          onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                          className={cn(pageErrors.title && "border-destructive")}
                        />
                        {pageErrors.title && <p className="text-xs text-destructive">{pageErrors.title}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page-slug">Url Slug <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-slug"
                          value={pageForm.slug}
                          onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                          className={cn("font-mono", pageErrors.slug && "border-destructive")}
                        />
                        {pageErrors.slug && <p className="text-xs text-destructive">{pageErrors.slug}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="page-excerpt">Brief Excerpt / Summary</Label>
                      <Textarea
                        id="page-excerpt"
                        value={pageForm.excerpt}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border">
                  <CardHeader>
                    <CardTitle>Search Engine Optimization (SEO)</CardTitle>
                    <CardDescription>
                      Configure search meta keywords and descriptions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-title">Meta Title</Label>
                      <Input
                        id="seo-title"
                        value={pageForm.metaTitle}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="Default is Page Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo-desc">Meta Description</Label>
                      <Textarea
                        id="seo-desc"
                        value={pageForm.metaDescription}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Brief summary for Google search listings"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo-kw">Meta Keywords</Label>
                      <Input
                        id="seo-kw"
                        value={pageForm.metaKeywords}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="e.g. audio book, statements, tanzeem, publications"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status and Action Column */}
              <div className="space-y-6">
                <Card className="rounded-2xl border border-border">
                  <CardHeader>
                    <CardTitle>Publishing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Page Visibility</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pageForm.isPublished ? "Live on website" : "Saved as draft"}
                        </p>
                      </div>
                      <Switch
                        checked={pageForm.isPublished}
                        onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, isPublished: checked }))}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingPage}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      {isSavingPage ? "Saving Configuration..." : "Save Page Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingItem ? "Edit audio book Details" : "New audio book Details"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                ×
              </Button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="press-release-form" onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="title">Release Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={cn(formErrors.title && "border-destructive")}
                    placeholder="e.g. audio book on Academic Achievements"
                  />
                  {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugManual(true);
                        setFormData(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      className={cn("font-mono", formErrors.slug && "border-destructive")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSlugManual(false);
                        setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                      }}
                      title="Reset to title slug"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                  {formErrors.slug && <p className="text-xs text-destructive">{formErrors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audioUrl">MP3 URL Reference <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      id="audioUrl"
                      required
                      value={formData.audioUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                      className="font-mono"
                      placeholder="https://your-server.com/uploads/..."
                    />
                    {formData.audioUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={formData.audioUrl} target="_blank" rel="noreferrer" title="Open File">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold mb-2 block">Featured Book Cover <span className="text-destructive">*</span></Label>
                  <ImageUploader
                    value={formData.featuredImage}
                    onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                    aspectRatio={3/4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Published Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="publishedAt"
                      type="date"
                      required
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/10 mt-6 h-[42px]">
                    <span className="text-sm font-medium">Published Visibility</span>
                    <Switch
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt Summary</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    rows={2}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Short description summarizing this audio book..."
                  />
                </div>

                <div className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-3">
                  <span className="text-sm font-bold text-foreground">SEO Information</span>

                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">SEO Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Defaults to release title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">SEO Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      rows={2}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Brief search snippet description..."
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="press-release-form" className="bg-primary text-primary-foreground hover:bg-primary/95">
                {editingItem ? "Save Changes" : "Create Release"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title="Delete audio book"
        description={`Are you sure you want to permanently delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={() => deletingItem && handleDeleteItem(deletingItem.id)}
      />

    </div>
  );
}
