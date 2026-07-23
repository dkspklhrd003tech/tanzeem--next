"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, XCircle, Search, GripVertical, FileText,
  Settings2, UploadCloud, RefreshCw, ArrowLeft, Image as ImageIcon,
  Video, User, PlayCircle, Eye, EyeOff, Check
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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

interface AudioItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  audioUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  categoryId?: string;
  speakerId?: string;
  isPublished: boolean;
  order: number;
}

function SortableCategoryCard({ id, item, onEdit, onDelete, onTogglePublish, onClick, audioCount }: any) {
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
          <Badge variant="secondary" className="text-[10px] uppercase font-semibold shrink-0">{audioCount} {audioCount === 1 ? 'Audio' : 'Audios'}</Badge>
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

function SortableAudioCard({ id, item, speakerName, onEdit, onDelete, onTogglePublish }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 min-h-[96px]",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="w-24 bg-muted relative border-r border-border shrink-0 flex items-center justify-center">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center text-muted-foreground/50">
            <Video className="w-6 h-6" />
          </div>
        )}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1.5 left-1.5 p-1 bg-background/80 backdrop-blur rounded border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground"
          title="Drag to reorder audio"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] py-0 px-1.5">
              {item.isPublished ? "Published" : "Draft"}
            </Badge>
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-green-600 hover:bg-primary/10" onClick={() => onEdit(item)} title="Edit">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-6 w-6", item.isPublished ? "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" : "text-red-500 hover:text-red-600 hover:bg-red-500/10")} onClick={() => onTogglePublish(item)} title={item.isPublished ? "Unpublish" : "Publish"}>
                {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)} title="Delete">
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <h4 className="font-semibold text-sm text-foreground line-clamp-1 leading-tight">{item.title}</h4>
          {speakerName && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{speakerName}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AudiosPageEditor({ pageId, initialPageData }: { pageId: string, initialPageData: PageRecord }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [speakersList, setSpeakersList] = useState<SpeakerItem[]>([]);
  const [audioList, setaudioList] = useState<AudioItem[]>([]);

  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<SpeakerItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<AudioItem | null>(null);

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
        fetch("/api/admin/audio-categories"),
        fetch("/api/admin/speakers"),
        fetch("/api/admin/audio")
      ]);
      if (catsRes.ok) setCategories((await catsRes.json()).items || []);
      if (speakersRes.ok) setSpeakersList((await speakersRes.json()).items || []);
      if (vidsRes.ok) setaudioList((await vidsRes.json()).items || []);
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

  const handleAudioTogglePublish = async (item: AudioItem) => {
    try {
      const res = await fetch(`/api/admin/audio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isPublished: !item.isPublished }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: `Audio is now ${!item.isPublished ? 'Published' : 'Hidden'}.` });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not update visibility." });
    }
  };

  const handleCatTogglePublish = async (e: React.MouseEvent, item: CategoryItem) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/audio-categories/${item.id}`, {
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



  const handleVideoDelete = async (item: AudioItem) => {
    try {
      await fetch(`/api/admin/audio/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Video deleted" });
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete video" }); }
    finally { setDeletingVideo(null); }
  };

  const handleVideoDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const catVideos = audioList.filter(b => b.categoryId === activeCategory?.id);
    const oldIndex = catVideos.findIndex(i => i.id === active.id);
    const newIndex = catVideos.findIndex(i => i.id === over.id);
    const reordered = arrayMove(catVideos, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));

    setaudioList(prev => {
      const otherVids = prev.filter(b => b.categoryId !== activeCategory?.id);
      return [...otherVids, ...reordered].sort((a, b) => a.order - b.order);
    });

    await fetch("/api/admin/audio", {
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
      await fetch("/api/admin/audio-categories", {
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
  const activeVideos = audioList.filter(b => b.categoryId === activeCategory?.id).filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 max-w-7xl">
      <PageActionBar
        mode="edit"
        title={activeCategory ? `${activeCategory.name} Audios` : pageForm.title}
        authorName={initialPageData.authorName}
        updatedAt={initialPageData.updatedAt}
        previewUrl="/audios-by-category"
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
          <Button onClick={() => router.push("/sitemanager/media/category/new?type=audio-categories")} className="ml-2 bg-primary text-white hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        ) : (
          <Button onClick={() => router.push(`/sitemanager/media/audio/new?category=${activeCategory.id}`)} className="ml-2 bg-primary text-white hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Audio Card
          </Button>
        )}
      </PageActionBar>

      {/* Hidden button for triggering page save since the action bar is outside the form */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="list" variant="pill" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="flex-1">
            <Video className="w-4 h-4 mr-2" /> Audio Categories
          </TabsTrigger>
          {!activeCategory && (
            <TabsTrigger value="settings" className="flex-1">
              <Settings2 className="w-4 h-4 mr-2" /> Page Setup
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {!activeCategory ? (
            isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground"><RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" /> Loading Audios...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">No Audios Found.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={filteredCategories.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {filteredCategories.map(cat => (
                      <SortableCategoryCard key={cat.id} id={cat.id} item={cat} onClick={setActiveCategory}
                        audioCount={audioList.filter(b => b.categoryId === cat.id).length}
                        onEdit={(item: any) => router.push(`/sitemanager/media/category/${item.id}?type=audio-categories`)}
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
                      <SortableAudioCard key={vid.id} id={vid.id} item={vid}
                        speakerName={speakersList.find(s => s.id === vid.speakerId)?.name}
                        onEdit={(item: any) => router.push(`/sitemanager/media/audio/${item.id}`)}
                        onDelete={(item: AudioItem) => setDeletingVideo(item)}
                        onTogglePublish={handleAudioTogglePublish} />
                    ))}
                    {activeVideos.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-xl">No videos found in this category.</div>}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
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



      {/* Delete Dialogs */}
      <ConfirmDialog
        open={!!deletingCat}
        onOpenChange={(open) => !open && setDeletingCat(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deletingCat?.name}"?`}
        onConfirm={async () => { if (deletingCat) { await fetch(`/api/admin/audio-categories/${deletingCat.id}`, { method: 'DELETE' }); fetchData(); setDeletingCat(null); } }}
      />
      <ConfirmDialog
        open={!!deletingSpeaker}
        onOpenChange={(open) => !open && setDeletingSpeaker(null)}
        title="Delete Speaker"
        description={`Are you sure you want to delete "${deletingSpeaker?.name}"?`}
        onConfirm={async () => { if (deletingSpeaker) { await fetch(`/api/admin/speakers/${deletingSpeaker.id}`, { method: 'DELETE' }); fetchData(); setDeletingSpeaker(null); } }}
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
