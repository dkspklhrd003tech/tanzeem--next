"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, XCircle, Search, GripVertical, FileText,
  Settings2, UploadCloud, RefreshCw, ArrowLeft, Image as ImageIcon,
  Video, User, PlayCircle, Eye, EyeOff, Check, X
} from "lucide-react";
import { PageActionBar } from "@/components/admin/PageActionBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { parseVideoInput } from "@/lib/video-parser";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}



interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive?: boolean;
}

interface SpeakerItem {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  videoUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  categoryId?: string;
  speakerId?: string;
  isPublished: boolean;
  order: number;
}

function SortableCategoryCard({ id, item, onEdit, onDelete, onTogglePublish, onClick, videoCount }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 cursor-pointer p-4 select-none",
        isDragging ? "shadow-2xl border-primary scale-[1.02] opacity-90" : "hover:shadow-md hover:border-primary/50"
      )}
      onClick={() => onClick(item)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing transition-colors shrink-0"
            title="Drag to reorder category"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold shrink-0">Category</Badge>
          <Badge variant="secondary" className="text-[10px] uppercase font-semibold shrink-0">{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</Badge>
        </div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-green-600 hover:bg-primary/10" onClick={() => onEdit(item)} title="Edit Category">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", item.isActive !== false ? "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" : "text-red-500 hover:text-red-600 hover:bg-red-500/10")} onClick={(e) => onTogglePublish(e, item)} title={item.isActive !== false ? "Hide from frontend" : "Show on frontend"}>
            {item.isActive !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)} title="Delete Category">
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
        {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
      </div>
    </div>
  );
}

function SortableVideoCard({ id, item, speakerName, onEdit, onDelete, onTogglePublish }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex bg-card rounded-xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="w-32 bg-muted relative border-r border-border shrink-0">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <Video className="w-7 h-7" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] py-0 px-2">
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-600 hover:bg-blue-600/70" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-7 w-7", item.isPublished ? "text-blue-600 hover:text-blue-600 hover:bg-blue-600/70" : "text-red-500 hover:bg-red-500/10")} onClick={() => onTogglePublish(item)} title={item.isPublished ? "Hide from frontend" : "Show on frontend"}>
              {item.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{item.title}</h3>
        {speakerName && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{speakerName}</p>}
      </div>
    </div>
  );
}

export default function VideosPageEditor({ pageId, initialPageData }: { pageId: string, initialPageData: PageRecord }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [speakersList, setSpeakersList] = useState<SpeakerItem[]>([]);
  const [videosList, setVideosList] = useState<VideoItem[]>([]);

  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: "", slug: "", description: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catFormErrors, setCatFormErrors] = useState<Record<string, string>>({});

  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [speakerFormData, setSpeakerFormData] = useState({ name: "", slug: "", bio: "", avatar: "" });
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [speakerFormErrors, setSpeakerFormErrors] = useState<Record<string, string>>({});

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState({ title: "", slug: "", description: "", videoUrl: "", embedUrl: "", thumbnailUrl: "", speakerId: "", isPublished: true });
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoFormErrors, setVideoFormErrors] = useState<Record<string, string>>({});

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<SpeakerItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, speakersRes, vidsRes] = await Promise.all([
        fetch("/api/admin/video-categories"),
        fetch("/api/admin/speakers"),
        fetch("/api/admin/videos")
      ]);
      if (catsRes.ok) setCategories((await catsRes.json()).items || []);
      if (speakersRes.ok) setSpeakersList((await speakersRes.json()).items || []);
      if (vidsRes.ok) setVideosList((await vidsRes.json()).items || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPage(true);
    try {
      await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title, slug: pageForm.slug, excerpt: pageForm.excerpt,
          content: pageForm.content, isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle, metaDescription: pageForm.metaDescription,
        }),
      });
      toast({ title: "Saved", description: "Page settings updated." });
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to save settings." }); }
    finally { setIsSavingPage(false); }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch("/api/sitemanager/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pageForm, title: `${pageForm.title} (Copy)`, slug: `${pageForm.slug}-copy`, isPublished: false, duplicateFromId: pageId }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Page duplicated." });
        window.location.href = `/sitemanager/pages/${json.page.id}/edit`;
      } else {
        toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Duplicate failed." });
    }
  };

  // --- Category CRUD ---
  const handleCatSave = async () => {
    const errors: Record<string, string> = {};
    if (!catFormData.name.trim()) errors.name = "Name is required";
    if (!catFormData.slug.trim()) errors.slug = "Slug is required";

    if (Object.keys(errors).length > 0) {
      setCatFormErrors(errors);
      return;
    }

    try {
      const url = editingCatId ? `/api/admin/video-categories/${editingCatId}` : "/api/admin/video-categories";
      const method = editingCatId ? "PUT" : "POST";
      const payload: any = { ...catFormData };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Category saved" });
      setIsCatModalOpen(false);
      fetchData();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleCatDelete = async (item: CategoryItem) => {
    try {
      await fetch(`/api/admin/video-categories/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Category deleted" });
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete category" }); }
    finally { setDeletingCat(null); }
  };

  const handleCatTogglePublish = async (e: React.MouseEvent, item: CategoryItem) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/video-categories/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isActive: item.isActive === false ? true : false }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: `Category is now ${item.isActive === false ? 'Visible' : 'Hidden'}.` });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not update visibility." });
    }
  };

  // --- Speaker CRUD ---
  const handleSpeakerSave = async () => {
    const errors: Record<string, string> = {};
    if (!speakerFormData.name.trim()) errors.name = "Name is required";
    if (!speakerFormData.slug.trim()) errors.slug = "Slug is required";

    if (Object.keys(errors).length > 0) {
      setSpeakerFormErrors(errors);
      return;
    }

    try {
      const url = editingSpeakerId ? `/api/admin/speakers/${editingSpeakerId}` : "/api/admin/speakers";
      const method = editingSpeakerId ? "PUT" : "POST";
      const payload: any = { ...speakerFormData };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Speaker saved" });
      setIsSpeakerModalOpen(false);
      fetchData();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleSpeakerDelete = async (item: SpeakerItem) => {
    try {
      await fetch(`/api/admin/speakers/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Speaker deleted" });
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete speaker" }); }
    finally { setDeletingSpeaker(null); }
  };

  // --- Video CRUD ---
  const handleVideoSave = async () => {
    const errors: Record<string, string> = {};
    if (!videoFormData.title.trim()) errors.title = "Title is required";
    if (!videoFormData.slug.trim()) errors.slug = "Slug is required";
    if (!videoFormData.videoUrl.trim()) errors.videoUrl = "Video URL is required";

    if (Object.keys(errors).length > 0) {
      setVideoFormErrors(errors);
      return;
    }

    try {
      const url = editingVideoId ? `/api/admin/videos/${editingVideoId}` : "/api/admin/videos";
      const method = editingVideoId ? "PUT" : "POST";
      const payload: any = { ...videoFormData, categoryId: activeCategory?.id || null };
      if (!editingVideoId) payload.order = videosList.filter(v => v.categoryId === activeCategory?.id).length;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Video saved" });
      setIsVideoModalOpen(false);
      fetchData();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleVideoDelete = async (item: VideoItem) => {
    try {
      await fetch(`/api/admin/videos/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Video deleted" });
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete video" }); }
    finally { setDeletingVideo(null); }
  };

  const handleVideoTogglePublish = async (item: VideoItem) => {
    try {
      const res = await fetch(`/api/admin/videos/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isPublished: !item.isPublished }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: `Video is now ${!item.isPublished ? 'Published' : 'Hidden'}.` });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not update visibility." });
    }
  };

  const handleVideoDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const catVideos = videosList.filter(b => b.categoryId === activeCategory?.id);
    const oldIndex = catVideos.findIndex(i => i.id === active.id);
    const newIndex = catVideos.findIndex(i => i.id === over.id);
    const reordered = arrayMove(catVideos, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));

    setVideosList(prev => {
      const otherVids = prev.filter(b => b.categoryId !== activeCategory?.id);
      return [...otherVids, ...reordered].sort((a, b) => a.order - b.order);
    });

    await fetch("/api/admin/videos", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map(i => ({ id: i.id, orderIndex: i.order })) }),
    });
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex(i => i.id === active.id);
    const newIndex = categories.findIndex(i => i.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));
    setCategories(reordered);
    try {
      await fetch("/api/admin/video-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: reordered.map(i => ({ id: i.id, orderIndex: i.order })) }),
      });
      toast({ title: "Category Order saved", description: "The new category order has been saved." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save category order." });
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => (a.order || 0) - (b.order || 0));
  const activeVideos = videosList
    .filter(b => b.categoryId === activeCategory?.id)
    .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 max-w-7xl">
      <PageActionBar
        mode="edit"
        title={activeCategory ? `${activeCategory.name} Videos` : pageForm.title}
        authorName={initialPageData.authorName}
        updatedAt={initialPageData.updatedAt}
        previewUrl="/videos-by-category"
        seoUrl={`/sitemanager/pages/${pageId}/edit/seo`}
        isPublished={pageForm.isPublished}
        saving={isSavingPage}
        onDuplicate={handleDuplicate}
        onSaveDraft={() => {
          setPageForm({ ...pageForm, isPublished: false });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
        onPublish={() => {
          setPageForm({ ...pageForm, isPublished: true });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
      >
        {!activeCategory ? (
          <Button onClick={() => { setEditingCatId(null); setCatFormData({ name: "", slug: "", description: "" }); setCatFormErrors({}); setIsCatModalOpen(true); }} className="ml-2 bg-primary text-white hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        ) : (
          <Button onClick={() => { setEditingVideoId(null); setVideoFormData({ title: "", slug: "", description: "", videoUrl: "", embedUrl: "", thumbnailUrl: "", speakerId: "", isPublished: true }); setVideoFormErrors({}); setIsVideoModalOpen(true); }} className="ml-2 bg-primary text-white hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Video Card
          </Button>
        )}
      </PageActionBar>

      {/* Hidden button for triggering page save since the action bar is outside the form */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="list" variant="pill" className="space-y-6">
        <TabsList>
          {!activeCategory && (
            <>
              <TabsTrigger value="list" className="flex-1">
                <Video className="w-4 h-4 mr-2" /> Video Categories
              </TabsTrigger>
              <TabsTrigger value="speakers" className="flex-1">
                <User className="w-4 h-4 mr-2" /> Speakers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings2 className="w-4 h-4 mr-2" /> Page Setup
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {!activeCategory ? (
            isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground"><RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" /> Loading Videos...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">No Videos Found.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={filteredCategories.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {filteredCategories.map(cat => (
                      <SortableCategoryCard key={cat.id} id={cat.id} item={cat} onClick={setActiveCategory}
                        videoCount={videosList.filter(b => b.categoryId === cat.id).length}
                        onEdit={(item: any) => { setEditingCatId(item.id); setCatFormData({ name: item.name, slug: item.slug, description: item.description || "" }); setCatFormErrors({}); setIsCatModalOpen(true); }}
                        onDelete={(item: CategoryItem) => setDeletingCat(item)}
                        onTogglePublish={handleCatTogglePublish} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : (
            <div className="space-y-6">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVideoDragEnd}>
                <SortableContext items={activeVideos.map(b => b.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeVideos.map(vid => (
                      <SortableVideoCard key={vid.id} id={vid.id} item={vid}
                        speakerName={speakersList.find(s => s.id === vid.speakerId)?.name}
                        onEdit={(item: any) => { setEditingVideoId(item.id); setVideoFormData({ title: item.title, slug: item.slug, description: item.description || "", videoUrl: item.videoUrl || "", embedUrl: item.embedUrl || "", thumbnailUrl: item.thumbnailUrl || "", speakerId: item.speakerId || "", isPublished: item.isPublished }); setVideoFormErrors({}); setIsVideoModalOpen(true); }}
                        onDelete={(item: VideoItem) => setDeletingVideo(item)}
                        onTogglePublish={handleVideoTogglePublish} />
                    ))}
                    {activeVideos.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-xl">No videos found in this category.</div>}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </TabsContent>

        <TabsContent value="speakers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Speakers Management</h2>
            <Button size="sm" onClick={() => { setEditingSpeakerId(null); setSpeakerFormData({ name: "", slug: "", bio: "", avatar: "" }); setSpeakerFormErrors({}); setIsSpeakerModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Speaker
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {speakersList.map(speaker => (
              <div key={speaker.id} className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
                <div className="aspect-square bg-muted relative border-b border-border">
                  {speaker.avatar ? (
                    <img src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base line-clamp-1">{speaker.name}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => { setEditingSpeakerId(speaker.id); setSpeakerFormData({ name: speaker.name, slug: speaker.slug, bio: speaker.bio || "", avatar: speaker.avatar || "" }); setSpeakerFormErrors({}); setIsSpeakerModalOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setDeletingSpeaker(speaker)}><XCircle className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{speaker.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <form onSubmit={handlePageSave} className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader><CardTitle>Page SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} /></div>
                <Button type="submit" disabled={isSavingPage}>{isSavingPage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}</Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                {editingCatId ? "Edit Category" : "Add Category"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-7 h-7 flex items-center justify-center p-0 bg-destructive text-white" onClick={() => setIsCatModalOpen(false)}><X className="w-4 h-4 text-white" /></Button>
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input className={cn(catFormErrors.name && "border-destructive")} value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value, slug: editingCatId ? catFormData.slug : slugify(e.target.value) })} />
                {catFormErrors.name && <p className="text-xs text-destructive">{catFormErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input className={cn(catFormErrors.slug && "border-destructive")} value={catFormData.slug} onChange={e => setCatFormData({ ...catFormData, slug: e.target.value })} />
                {catFormErrors.slug && <p className="text-xs text-destructive">{catFormErrors.slug}</p>}
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} /></div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCatSave} className="bg-primary text-white hover:bg-primary/95 hover:text-white">
                {editingCatId ? "Update Category" : "Save Category"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {isSpeakerModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {editingSpeakerId ? "Edit Speaker" : "Add Speaker"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-7 h-7 flex items-center justify-center p-0 bg-destructive text-white" onClick={() => setIsSpeakerModalOpen(false)}><X className="w-4 h-4 text-white" /></Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input className={cn(speakerFormErrors.name && "border-destructive")} value={speakerFormData.name} onChange={e => setSpeakerFormData({ ...speakerFormData, name: e.target.value, slug: editingSpeakerId ? speakerFormData.slug : slugify(e.target.value) })} />
                {speakerFormErrors.name && <p className="text-xs text-destructive">{speakerFormErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input className={cn(speakerFormErrors.slug && "border-destructive")} value={speakerFormData.slug} onChange={e => setSpeakerFormData({ ...speakerFormData, slug: e.target.value })} />
                {speakerFormErrors.slug && <p className="text-xs text-destructive">{speakerFormErrors.slug}</p>}
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={speakerFormData.bio} onChange={e => setSpeakerFormData({ ...speakerFormData, bio: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Speaker Photo</Label>
                <ImageUploader
                  value={speakerFormData.avatar}
                  onChange={(url) => setSpeakerFormData(prev => ({ ...prev, avatar: url }))}
                  aspectRatio={1}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSpeakerModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSpeakerSave} className="bg-primary text-white">
                {editingSpeakerId ? "Update Speaker" : "Save Speaker"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                {editingVideoId ? "Edit Video" : "Add Video"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-7 h-7 flex items-center justify-center p-0 bg-destructive text-white" onClick={() => setIsVideoModalOpen(false)}><X className="w-4 h-4 text-white" /></Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Title <span className="text-destructive">*</span></Label>
                  <Input className={cn(videoFormErrors.title && "border-destructive")} value={videoFormData.title} onChange={e => setVideoFormData({ ...videoFormData, title: e.target.value, slug: editingVideoId ? videoFormData.slug : slugify(e.target.value) })} />
                  {videoFormErrors.title && <p className="text-xs text-destructive">{videoFormErrors.title}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Slug <span className="text-destructive">*</span></Label>
                  <Input className={cn(videoFormErrors.slug && "border-destructive")} value={videoFormData.slug} onChange={e => setVideoFormData({ ...videoFormData, slug: e.target.value })} />
                  {videoFormErrors.slug && <p className="text-xs text-destructive">{videoFormErrors.slug}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Video URL <span className="text-destructive">*</span></Label>
                  <Input
                    className={cn(videoFormErrors.videoUrl && "border-destructive")}
                    placeholder="https://youtube.com/..."
                    value={videoFormData.videoUrl}
                    onChange={e => {
                      const val = e.target.value;
                      const parsed = parseVideoInput(val);
                      setVideoFormData({ ...videoFormData, videoUrl: val, embedUrl: parsed.embedSrc || videoFormData.embedUrl, thumbnailUrl: videoFormData.thumbnailUrl || parsed.thumbnailUrl });
                    }}
                  />
                  {videoFormErrors.videoUrl && <p className="text-xs text-destructive">{videoFormErrors.videoUrl}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Embed URL (Optional)</Label>
                  <Input
                    placeholder="<iframe src='...' /> or URL"
                    value={videoFormData.embedUrl}
                    onChange={e => {
                      const val = e.target.value;
                      const parsed = parseVideoInput(val);
                      setVideoFormData({ ...videoFormData, embedUrl: parsed.embedSrc || val, videoUrl: videoFormData.videoUrl || parsed.videoUrl, thumbnailUrl: videoFormData.thumbnailUrl || parsed.thumbnailUrl });
                    }}
                  />
                </div>

                {/* Iframe Preview */}
                {(parseVideoInput(videoFormData.videoUrl || videoFormData.embedUrl || "").embedSrc || videoFormData.videoUrl) && (
                  <div className="space-y-2 col-span-2 pt-2">
                    <Label>Video Preview</Label>
                    <div className="rounded-md overflow-hidden bg-black aspect-video relative">
                      {parseVideoInput(videoFormData.videoUrl || videoFormData.embedUrl || "").embedSrc ? (
                        <iframe
                          src={parseVideoInput(videoFormData.videoUrl || videoFormData.embedUrl || "").embedSrc}
                          title="Video Preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video controls src={videoFormData.videoUrl} className="w-full h-full">
                          Your browser does not support the video element.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 col-span-2">
                  <Label>Thumbnail</Label>
                  <ImageUploader
                    value={videoFormData.thumbnailUrl}
                    onChange={(url) => setVideoFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                    aspectRatio={16 / 9}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)}>Cancel</Button>
              <Button onClick={handleVideoSave} className="bg-primary text-white">
                {editingVideoId ? "Update Video" : "Save Video"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialogs */}
      <ConfirmDialog
        open={!!deletingCat}
        onOpenChange={(open) => !open && setDeletingCat(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deletingCat?.name}"?`}
        onConfirm={() => { if (deletingCat) handleCatDelete(deletingCat); }}
      />
      <ConfirmDialog
        open={!!deletingSpeaker}
        onOpenChange={(open) => !open && setDeletingSpeaker(null)}
        title="Delete Speaker"
        description={`Are you sure you want to delete "${deletingSpeaker?.name}"?`}
        onConfirm={() => { if (deletingSpeaker) handleSpeakerDelete(deletingSpeaker); }}
      />
      <ConfirmDialog
        open={!!deletingVideo}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
        title="Delete Video"
        description={`Are you sure you want to delete "${deletingVideo?.title}"?`}
        onConfirm={() => { if (deletingVideo) handleVideoDelete(deletingVideo); }}
      />
    </div>
  );
}
