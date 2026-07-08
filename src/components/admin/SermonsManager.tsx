"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, GripVertical, FileText,
  UploadCloud, Loader2, ArrowLeft, Mic, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// TYPES
// ==========================================

interface CategoryItem {
  id: string;
  name: string;
  urduName?: string;
  slug: string;
  description?: string;
  order: number;
}

interface SermonItem {
  id: string;
  categoryId?: string;
  title: string;
  titleUrdu?: string;
  slug: string;
  excerpt?: string;
  description?: string;
  audioUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  order: number;
}

// ==========================================
// SORTABLE COMPONENTS
// ==========================================

function SortableCategoryCard({ id, item, onEdit, onDelete, onClick, sermonCount }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 cursor-pointer",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-primary/50"
      )}
      onClick={() => onClick(item)}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">Category</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{sermonCount} Audios</Badge>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
        <h3 className="font-bold text-lg text-foreground leading-snug line-clamp-1">{item.name}</h3>
        {item.urduName && (
          <h4 className="font-bold text-base text-foreground mt-1 font-amiri" dir="rtl">{item.urduName}</h4>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
}

function SortableSermonCard({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="h-1.5 w-full bg-emerald-500" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Audio
          </Badge>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 mb-1">{item.title}</h3>
        {item.titleUrdu && (
            <h4 className="font-bold text-sm text-foreground leading-snug line-clamp-2 mb-2 font-amiri" dir="rtl">{item.titleUrdu}</h4>
        )}
        <p className="text-xs text-muted-foreground font-mono truncate mb-4" title={item.slug}>
          /{item.slug}
        </p>

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

// ==========================================
// MAIN COMPONENT
// ==========================================

export function SermonsManager() {
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: "", urduName: "", slug: "", description: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [sermonFormData, setSermonFormData] = useState({ title: "", titleUrdu: "", slug: "", excerpt: "", description: "", audioUrl: "", isPublished: true, publishedAt: "" });
  const [editingSermonId, setEditingSermonId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation dialogs
  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);
  const [deletingSermon, setDeletingSermon] = useState<SermonItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchCategories();
    fetchSermons();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/khitab-audio-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories((data.items || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchSermons = async () => {
    try {
      const res = await fetch("/api/admin/khitab-audios");
      if (res.ok) {
        const data = await res.json();
        setSermons((data.items || []));
      }
    } catch (e) { console.error(e); }
  };

  // --- Category CRUD ---
  const handleCatSave = async () => {
    if (!catFormData.name || !catFormData.slug) return;
    try {
      const url = editingCatId ? `/api/admin/khitab-audio-categories/${editingCatId}` : "/api/admin/khitab-audio-categories";
      const method = editingCatId ? "PUT" : "POST";
      const payload: any = { ...catFormData };
      if (!editingCatId) payload.order = categories.length;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Category saved" });
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleCatDelete = async (item: CategoryItem) => {
    try {
      await fetch(`/api/admin/khitab-audio-categories/${item.id}`, { method: "DELETE" });
      fetchCategories();
      toast({ title: "Category deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete category" });
    } finally {
      setDeletingCat(null);
    }
  };

  const handleCatDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex(i => i.id === active.id);
    const newIndex = categories.findIndex(i => i.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));
    setCategories(reordered);
    await fetch("/api/admin/khitab-audio-categories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map(i => ({ id: i.id, orderIndex: i.order })) }),
    });
  };

  // --- Sermon CRUD ---
  const handleSermonSave = async () => {
    if (!sermonFormData.title || !sermonFormData.slug) return;
    try {
      const url = editingSermonId ? `/api/admin/khitab-audios/${editingSermonId}` : "/api/admin/khitab-audios";
      const method = editingSermonId ? "PUT" : "POST";
      const payload: any = { 
        ...sermonFormData, 
        categoryId: activeCategory?.id,
        publishedAt: sermonFormData.publishedAt ? new Date(sermonFormData.publishedAt).toISOString() : null,
      };
      
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
         const errorData = await res.json().catch(() => ({}));
         throw new Error(errorData.error || "Failed");
      }
      toast({ title: "Success", description: "Audio saved" });
      setIsSermonModalOpen(false);
      fetchSermons();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message || "Save failed." }); }
  };

  const handleSermonDelete = async (item: SermonItem) => {
    try {
      await fetch(`/api/admin/khitab-audios/${item.id}`, { method: "DELETE" });
      fetchSermons();
      toast({ title: "Audio deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete audio" });
    } finally {
      setDeletingSermon(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleAudioUploadDirectly(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleAudioUploadDirectly(e.target.files[0]);
    }
  };

  const { uploadFile: chunkedUpload } = useChunkedUpload();

  const handleAudioUploadDirectly = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a valid audio file." });
      return;
    }
    setIsUploading(true);
    try {
      // Use chunked upload to bypass Vercel's 4.5MB serverless function limit.
      // Files are split into 3MB chunks and assembled server-side before FTP transfer.
      const data = await chunkedUpload(file, {
        onProgress: (pct) => console.log(`[SermonsManager] Upload progress: ${pct}%`),
      });

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanedTitle = baseName.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

      setEditingSermonId(null);
      setSermonFormData({
        title: cleanedTitle,
        titleUrdu: "",
        slug: slugify(cleanedTitle),
        excerpt: "",
        description: "",
        audioUrl: data.url,
        isPublished: true,
        publishedAt: new Date().toISOString().split("T")[0]
      });
      setIsSermonModalOpen(true);
      toast({ title: "Audio Uploaded Successfully", description: "Configure details to save this audio." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message || "Failed to upload the file." });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeSermons = sermons.filter(s => s.categoryId === activeCategory?.id).filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            {activeCategory && (
              <Button variant="outline" size="icon" onClick={() => { setActiveCategory(null); setSearchQuery(""); }} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {activeCategory ? `${activeCategory.name} Audios` : "Friday Sermons (Khitab-e-Jum'ah)"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {activeCategory ? "Manage audios inside this category." : "Manage categories and their associated audios."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!activeCategory ? (
            <Button onClick={() => { setEditingCatId(null); setCatFormData({ name: "", urduName: "", slug: "", description: "" }); setIsCatModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          ) : (
            <Button onClick={() => { setEditingSermonId(null); setSermonFormData({ title: "", titleUrdu: "", slug: "", excerpt: "", description: "", audioUrl: "", isPublished: true, publishedAt: new Date().toISOString().split("T")[0] }); setIsSermonModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Audio
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">

          {!activeCategory ? (
            // CATEGORIES GRID
            isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin text-primary mr-2" /> Loading Categories...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-card rounded-2xl border p-12 text-center text-muted-foreground">No Categories Found.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                <SortableContext items={filteredCategories.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCategories.map(cat => (
                      <SortableCategoryCard key={cat.id} id={cat.id} item={cat} onClick={setActiveCategory}
                        sermonCount={sermons.filter(s => s.categoryId === cat.id).length}
                        onEdit={(item: any) => { setEditingCatId(item.id); setCatFormData({ name: item.name, urduName: item.urduName || "", slug: item.slug, description: item.description || "" }); setIsCatModalOpen(true); }}
                        onDelete={(item: CategoryItem) => setDeletingCat(item)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : (
            // SERMONS GRID
            <div className="space-y-6">
              {/* File Drag-and-Drop Area for Audio */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer py-10 px-6 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center text-center",
                  dragActive ? "border-primary bg-primary/5 scale-[1.005]" : "border-border hover:border-muted-foreground/50 bg-card",
                  isUploading && "pointer-events-none opacity-60"
                )}
              >
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="font-semibold text-foreground">Uploading Audio...</p>
                    <p className="text-xs text-muted-foreground">This will only take a moment.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-foreground text-lg">Drag & Drop an Audio File here</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Or click anywhere to choose a file from your computer. Titles will auto-generate.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSermons.map(sermon => (
                  <SortableSermonCard key={sermon.id} id={sermon.id} item={sermon}
                    onEdit={(item: any) => { 
                      setEditingSermonId(item.id); 
                      setSermonFormData({ 
                        title: item.title, 
                        titleUrdu: item.titleUrdu || "", 
                        slug: item.slug, 
                        excerpt: item.excerpt || "", 
                        description: item.description || "", 
                        audioUrl: item.audioUrl || "", 
                        isPublished: item.isPublished,
                        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : "",
                      }); 
                      setIsSermonModalOpen(true); 
                    }}
                    onDelete={(item: SermonItem) => setDeletingSermon(item)} />
                ))}
                {activeSermons.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-xl">No audios found in this category.</div>}
              </div>
            </div>
          )}
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingCatId ? "Edit Category" : "Add Category"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsCatModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2"><Label>Name (e.g. Khitab-e-Jum'ah 2026)</Label><Input value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value, slug: editingCatId ? catFormData.slug : slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Urdu Name (Optional)</Label><Input value={catFormData.urduName} onChange={e => setCatFormData({ ...catFormData, urduName: e.target.value })} dir="rtl" /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={catFormData.slug} onChange={e => setCatFormData({ ...catFormData, slug: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
              <ConfirmDialog
                title={editingCatId ? "Update Category" : "Create Category"}
                description={`Are you sure you want to ${editingCatId ? "update" : "create"} this category?`}
                onConfirm={handleCatSave}
              >
                <Button disabled={isUploading} className="bg-primary text-primary-foreground hover:bg-primary/95">
                  {editingCatId ? "Update Category" : "Save Category"}
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        </div>
      )}

      {/* Sermon Modal */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                {editingSermonId ? "Edit Audio" : "Add Audio"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsSermonModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title (English)</Label><Input value={sermonFormData.title} onChange={e => setSermonFormData({ ...sermonFormData, title: e.target.value, slug: editingSermonId ? sermonFormData.slug : slugify(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Title (Urdu)</Label><Input value={sermonFormData.titleUrdu} onChange={e => setSermonFormData({ ...sermonFormData, titleUrdu: e.target.value })} dir="rtl" /></div>
              </div>
              <div className="space-y-2"><Label>Slug</Label><Input value={sermonFormData.slug} onChange={e => setSermonFormData({ ...sermonFormData, slug: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <div className="flex gap-2">
                  <Input value={sermonFormData.audioUrl} onChange={e => setSermonFormData({ ...sermonFormData, audioUrl: e.target.value })} placeholder="Enter URL or upload file..." />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="h-4 w-4 mr-2" /> Upload
                  </Button>
                </div>
              </div>
              <div className="space-y-2"><Label>Excerpt</Label><Textarea value={sermonFormData.excerpt} onChange={e => setSermonFormData({ ...sermonFormData, excerpt: e.target.value })} rows={2} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={sermonFormData.description} onChange={e => setSermonFormData({ ...sermonFormData, description: e.target.value })} rows={4} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Publish Date</Label><Input type="date" value={sermonFormData.publishedAt} onChange={e => setSermonFormData({ ...sermonFormData, publishedAt: e.target.value })} /></div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSermonModalOpen(false)}>Cancel</Button>
              <ConfirmDialog
                title={editingSermonId ? "Update Audio" : "Add Audio"}
                description={`Are you sure you want to ${editingSermonId ? "update" : "add"} this audio?`}
                onConfirm={handleSermonSave}
              >
                <Button disabled={isUploading} className="bg-primary text-primary-foreground hover:bg-primary/95">
                  {editingSermonId ? "Update Audio" : "Save Audio"}
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={!!deletingCat}
        onOpenChange={(open) => !open && setDeletingCat(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deletingCat?.name}"? All audios inside will also be removed.`}
        onConfirm={() => { if (deletingCat) handleCatDelete(deletingCat); }}
      />

      {/* Delete Sermon Confirmation */}
      <ConfirmDialog
        open={!!deletingSermon}
        onOpenChange={(open) => !open && setDeletingSermon(null)}
        title="Delete Audio"
        description={`Are you sure you want to delete "${deletingSermon?.title}"?`}
        onConfirm={() => { if (deletingSermon) handleSermonDelete(deletingSermon); }}
      />
    </div>
  );
}
