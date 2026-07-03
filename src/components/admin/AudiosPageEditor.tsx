"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Search, GripVertical, FileText,
  Settings2, UploadCloud, Loader2, ArrowLeft, Image as ImageIcon,
  Video, User, PlayCircle, Eye, Check
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

function SortableCategoryCard({ id, item, onEdit, onDelete, onClick, videoCount }: any) {
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">Category</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{videoCount} Videos</Badge>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
}

function SortableAudioCard({ id, item, speakerName, onEdit, onDelete }: any) {
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
            <Video className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] py-0 px-2">
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
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
          metaTitle: pageForm.metaTitle, metaDescription: pageForm.metaDescription, metaKeywords: pageForm.metaKeywords,
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

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
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
          <Button onClick={() => router.push("/sitemanager/media/category/new?type=audio-categories")} className="ml-2 bg-primary text-primary-foreground hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        ) : (
          <Button onClick={() => router.push(`/sitemanager/media/audio/new?category=${activeCategory.id}`)} className="ml-2 bg-primary text-primary-foreground hover:bg-primary/95">
            <Plus className="w-4 h-4 mr-2" /> Add Audio Card
          </Button>
        )}
      </PageActionBar>

      {/* Hidden button for triggering page save since the action bar is outside the form */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-transparent border border-border/50 p-1 rounded-full h-auto w-full max-w-3xl flex items-center justify-between mb-8 overflow-x-auto">
          <TabsTrigger value="list" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
            <Video className="w-4 h-4 mr-2" /> Audio Categories
          </TabsTrigger>
          {!activeCategory && (
            <TabsTrigger value="settings" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
              <Settings2 className="w-4 h-4 mr-2" /> Page Setup
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {!activeCategory ? (
            isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin text-primary mr-2" /> Loading categories...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-card rounded-2xl border p-12 text-center text-muted-foreground">No categories found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map(cat => (
                  <SortableCategoryCard key={cat.id} id={cat.id} item={cat} onClick={setActiveCategory}
                    videoCount={audioList.filter(b => b.categoryId === cat.id).length}
                    onEdit={(item: any) => router.push(`/sitemanager/media/category/${item.id}?type=audio-categories`)}
                    onDelete={(item: CategoryItem) => setDeletingCat(item)} />
                ))}
              </div>
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
                        onDelete={(item: AudioItem) => setDeletingVideo(item)} />
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
                <Button type="submit" disabled={isSavingPage}>{isSavingPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}</Button>
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
        onConfirm={() => deletingVideo && handleVideoDelete(deletingVideo)}
      />
    </div>
  );
}
