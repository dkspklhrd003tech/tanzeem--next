"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Settings2, Loader2, User, ArrowLeft, Video, UploadCloud, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import PageSeoManager from "./PageSeoManager";
import { CustomFieldBuilder } from "./CustomFieldBuilder";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
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
import { GripVertical } from "lucide-react";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SpeakerItem {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  type?: string;
  order?: number;
  customFields?: any;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  videoUrl?: string;
  embedUrl?: string;
  speakerId?: string;
  isPublished: boolean;
  isNew?: boolean;
  customFields?: any;
}

function SortableSpeakerCard({ speaker, onClick, onEdit, onDelete }: { speaker: SpeakerItem, onClick: () => void, onEdit: (s: SpeakerItem) => void, onDelete: (s: SpeakerItem) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: speaker.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative cursor-pointer group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-colors shadow-sm" onClick={onClick}>
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-1.5 bg-background/80 backdrop-blur rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </div>
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
          <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary pl-1">{speaker.name}</h3>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => onEdit(speaker)}><Pencil className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onDelete(speaker)}><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
        <p className="text-xs font-nastaleeq text-muted-foreground line-clamp-2" dir="rtl">{speaker.bio}</p>
      </div>
    </div>
  );
}

export default function VideoSpeakersPageEditor({ pageId, initialPageData }: { pageId: string, initialPageData: PageRecord }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const [speakersList, setSpeakersList] = useState<SpeakerItem[]>([]);
  const [videosList, setVideosList] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerItem | null>(null);

  // Speaker Modal
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [speakerFormData, setSpeakerFormData] = useState({ name: "", slug: "", bio: "", avatar: "", type: "video", order: 0, customFields: {} as Record<string, any> });
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<SpeakerItem | null>(null);

  // Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState({ title: "", slug: "", videoUrl: "", embedUrl: "", isPublished: true, isNew: false, customFields: {} as Record<string, any> });
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [spRes, viRes] = await Promise.all([
        fetch("/api/admin/speakers?type=video"),
        fetch("/api/admin/videos")
      ]);
      if (spRes.ok) {
        const items = (await spRes.json()).items || [];
        setSpeakersList(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
      if (viRes.ok) setVideosList((await viRes.json()).items || []);
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
        body: JSON.stringify(pageForm),
      });
      toast({ title: "Saved", description: "Page settings updated." });
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to save settings." }); }
    finally { setIsSavingPage(false); }
  };

  const handleSpeakerSave = async () => {
    if (!speakerFormData.name || !speakerFormData.slug) return;
    try {
      const url = editingSpeakerId ? `/api/admin/speakers/${editingSpeakerId}` : "/api/admin/speakers";
      const method = editingSpeakerId ? "PUT" : "POST";
      const payload = { ...speakerFormData, type: "video" };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      toast({ title: "Success", description: "Speaker saved" });
      setIsSpeakerModalOpen(false);
      fetchData();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const handleSpeakerDelete = async (item: SpeakerItem) => {
    try {
      await fetch(`/api/admin/speakers/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Speaker deleted" });
      if (activeSpeaker?.id === item.id) setActiveSpeaker(null);
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete" }); }
    finally { setDeletingSpeaker(null); }
  };

  const handleVideoSave = async () => {
    if (!videoFormData.title || !videoFormData.slug) return;
    try {
      const url = editingVideoId ? `/api/admin/videos/${editingVideoId}` : "/api/admin/videos";
      const method = editingVideoId ? "PUT" : "POST";
      const payload = { ...videoFormData, speakerId: activeSpeaker?.id };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      toast({ title: "Success", description: "Video saved" });
      setIsVideoModalOpen(false);
      fetchData();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSpeakersList((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);

      // Save order in background using bulk PATCH
      const reordered = newArray.map((item, idx) => ({ ...item, order: idx }));
      fetch("/api/admin/speakers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: reordered.map((i) => ({ id: i.id, orderIndex: i.order }))
        }),
      }).catch(console.error);

      return reordered;
    });
    toast({ title: "Order saved", description: "The new sorting order has been saved automatically." });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setter(data.url);
      else throw new Error("Upload failed");
    } catch (err) { toast({ variant: "destructive", title: "Upload Error" }); }
    finally { setIsUploading(false); }
  };

  const activeVideos = videosList.filter(v => v.speakerId === activeSpeaker?.id);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            {activeSpeaker ? (
              <Button variant="outline" size="icon" onClick={() => setActiveSpeaker(null)} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/sitemanager/pages">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {activeSpeaker ? `${activeSpeaker.name} Videos` : pageForm.title}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {activeSpeaker ? "Manage videos for this speaker." : "Manage speakers and their page settings."}
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeSpeaker ? "videos" : "speakers"} className="space-y-6">
        <TabsList className="bg-transparent border border-border/50 p-1 rounded-full h-auto w-full max-w-3xl flex items-center justify-between mb-8 overflow-x-auto">
          {!activeSpeaker ? (
            <>
              <TabsTrigger value="speakers" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
                <User className="w-4 h-4 mr-2" /> Speakers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
                <Settings2 className="w-4 h-4 mr-2" /> Page Setup
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="videos" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
                <Video className="w-4 h-4 mr-2" /> Videos
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
                <Bot className="w-4 h-4 mr-2" /> SEO Section
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {!activeSpeaker && (
          <TabsContent value="speakers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Video Speakers</h2>
              <Button size="sm" onClick={() => { setEditingSpeakerId(null); setSpeakerFormData({ name: "", slug: "", bio: "", avatar: "", type: "video", order: 0, customFields: {} }); setIsSpeakerModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Speaker
              </Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={speakersList.map(s => s.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {speakersList.map(speaker => (
                      <SortableSpeakerCard
                        key={speaker.id}
                        speaker={speaker}
                        onClick={() => setActiveSpeaker(speaker)}
                        onEdit={(s) => {
                          setEditingSpeakerId(s.id);
                          setSpeakerFormData({ name: s.name, slug: s.slug, bio: s.bio || "", avatar: s.avatar || "", type: "video", order: s.order || 0, customFields: s.customFields || {} });
                          setIsSpeakerModalOpen(true);
                        }}
                        onDelete={(s) => setDeletingSpeaker(s)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        )}

        {!activeSpeaker && (
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
        )}

        {activeSpeaker && (
          <>
            <TabsContent value="videos" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Speaker Videos</h2>
                <Button size="sm" onClick={() => { setEditingVideoId(null); setVideoFormData({ title: "", slug: "", videoUrl: "", embedUrl: "", isPublished: true, isNew: false, customFields: {} }); setIsVideoModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Video
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeVideos.map(video => (
                  <div key={video.id} className="bg-card rounded-xl border p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{video.title}</h3>
                        {video.isNew && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-xs text-muted-foreground break-all">{video.videoUrl || video.embedUrl || "No URL"}</p>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingVideoId(video.id); setVideoFormData({ title: video.title, slug: video.slug, videoUrl: video.videoUrl || "", embedUrl: video.embedUrl || "", isPublished: video.isPublished, isNew: video.isNew || false, customFields: video.customFields || {} }); setIsVideoModalOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeletingVideo(video); }} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                {activeVideos.length === 0 && <p className="text-muted-foreground col-span-full">No videos found for this speaker.</p>}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <PageSeoManager endpoint={`/api/admin/speakers/${activeSpeaker.id}`} backHref="#" />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Speaker Modal */}
      {isSpeakerModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold">{editingSpeakerId ? "Edit Speaker" : "Add Speaker"}</h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsSpeakerModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={speakerFormData.name} onChange={e => setSpeakerFormData({ ...speakerFormData, name: e.target.value, slug: editingSpeakerId ? speakerFormData.slug : slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={speakerFormData.slug} onChange={e => setSpeakerFormData({ ...speakerFormData, slug: e.target.value })} /></div>
              <div className="space-y-2"><Label>Urdu Name</Label><Input value={speakerFormData.bio} onChange={e => setSpeakerFormData({ ...speakerFormData, bio: e.target.value })} className="text-center font-bold text-lg" dir="rtl" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} placeholder="اردو نام" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={speakerFormData.order} onChange={e => setSpeakerFormData({ ...speakerFormData, order: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2">
                <Label>Speaker Photo</Label>
                <ImageUploader value={speakerFormData.avatar || ""} onChange={(url) => setSpeakerFormData(prev => ({ ...prev, avatar: url }))} aspectRatio={1} />
              </div>
              <CustomFieldRenderer
                entityType="speaker"
                values={speakerFormData.customFields}
                onChange={(key, val) => setSpeakerFormData(prev => ({ ...prev, customFields: { ...prev.customFields, [key]: val } }))}
              />
              <CustomFieldBuilder entityType="speaker" />
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSpeakerModalOpen(false)} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
              <Button onClick={handleSpeakerSave} className="bg-primary text-white hover:bg-primary/80">{editingSpeakerId ? "Update" : "Save"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold">{editingVideoId ? "Edit Video" : "Add Video"}</h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsVideoModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={videoFormData.title} onChange={e => setVideoFormData({ ...videoFormData, title: e.target.value, slug: editingVideoId ? videoFormData.slug : slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={videoFormData.slug} onChange={e => setVideoFormData({ ...videoFormData, slug: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Video File (MP4/WebM)</Label>
                <div className="flex gap-2">
                  <Input value={videoFormData.videoUrl} onChange={e => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })} placeholder="https://... or upload" />
                  <div className="relative">
                    <Button type="button" variant="secondary" className="whitespace-nowrap" disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                      Upload Video
                    </Button>
                    <input type="file" accept="video/mp4,video/webm" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, (url) => setVideoFormData(prev => ({ ...prev, videoUrl: url })))} disabled={isUploading} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Or Embed URL (YouTube/Vimeo etc.)</Label>
                <Input value={videoFormData.embedUrl} onChange={e => setVideoFormData({ ...videoFormData, embedUrl: e.target.value })} placeholder="https://youtube.com/embed/..." />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isNewVideo" checked={videoFormData.isNew} onChange={e => setVideoFormData({ ...videoFormData, isNew: e.target.checked })} className="rounded border-gray-300" />
                <Label htmlFor="isNewVideo" className="cursor-pointer">Mark as "New"</Label>
              </div>
              <CustomFieldRenderer
                entityType="video"
                values={videoFormData.customFields}
                onChange={(key, val) => setVideoFormData(prev => ({ ...prev, customFields: { ...prev.customFields, [key]: val } }))}
              />
              <CustomFieldBuilder entityType="video" />
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
              <Button onClick={handleVideoSave} className="bg-primary text-white hover:bg-primary/80">{editingVideoId ? "Update" : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deletingSpeaker} title="Delete Speaker" description="Are you sure you want to delete this speaker?" onConfirm={async () => { if (deletingSpeaker) await handleSpeakerDelete(deletingSpeaker) }} onOpenChange={(open) => !open && setDeletingSpeaker(null)} />
      <ConfirmDialog open={!!deletingVideo} title="Delete Video" description="Are you sure you want to delete this video?" onConfirm={async () => { if (deletingVideo) { await fetch(`/api/admin/videos/${deletingVideo.id}`, { method: 'DELETE' }); fetchData(); setDeletingVideo(null); } }} onOpenChange={(open) => !open && setDeletingVideo(null)} />
    </div>
  );
}
