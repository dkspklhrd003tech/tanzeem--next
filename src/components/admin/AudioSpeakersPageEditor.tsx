"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle, Settings2, Loader2, User, ArrowLeft, Music, UploadCloud, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface AudioItem {
  id: string;
  title: string;
  slug: string;
  audioUrl?: string;
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
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-1.5 bg-background/80 backdrop-blur rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground">
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
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onDelete(speaker)}><XCircle className="w-3 h-3" /></Button>
          </div>
        </div>
        <p className="text-xs font-nastaleeq text-muted-foreground line-clamp-2" dir="rtl">{speaker.bio}</p>
      </div>
    </div>
  );
}

export default function AudioSpeakersPageEditor({ pageId, initialPageData }: { pageId: string, initialPageData: PageRecord }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const [speakersList, setSpeakersList] = useState<SpeakerItem[]>([]);
  const [audiosList, setAudiosList] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerItem | null>(null);

  const [deletingSpeaker, setDeletingSpeaker] = useState<SpeakerItem | null>(null);
  const [deletingAudio, setDeletingAudio] = useState<AudioItem | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [spRes, auRes] = await Promise.all([
        fetch("/api/admin/speakers?type=audio"),
        fetch("/api/admin/audio")
      ]);
      if (spRes.ok) {
        const items = (await spRes.json()).items || [];
        setSpeakersList(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
      if (auRes.ok) setAudiosList((await auRes.json()).items || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handlePageSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const handleSpeakerDelete = async (item: SpeakerItem) => {
    try {
      await fetch(`/api/admin/speakers/${item.id}`, { method: "DELETE" });
      fetchData();
      toast({ title: "Speaker deleted" });
      if (activeSpeaker?.id === item.id) setActiveSpeaker(null);
    } catch (e) { toast({ variant: "destructive", title: "Failed to delete" }); }
    finally { setDeletingSpeaker(null); }
  };

  const activeAudios = audiosList.filter(a => a.speakerId === activeSpeaker?.id).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

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
              {activeSpeaker ? `${activeSpeaker.name} Audios` : pageForm.title}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {activeSpeaker ? "Manage audios for this speaker." : "Manage speakers and their page settings."}
          </p>
        </div>
      </div>

      <Tabs
        key={activeSpeaker ? `speaker-${activeSpeaker.id}` : "speakers-list"}
        defaultValue={activeSpeaker ? "audios" : "speakers"}
        className="space-y-6"
      >
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
              <TabsTrigger value="audios" className="flex-1 rounded-full py-2.5 data-[state=active]:bg-[#0d2d26] data-[state=active]:text-[#10b981] data-[state=active]:border data-[state=active]:border-[#10b981]/50 data-[state=inactive]:text-muted-foreground transition-all">
                <Music className="w-4 h-4 mr-2" /> Audios
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
              <h2 className="text-xl font-bold">Audio Speakers</h2>
              <Button size="sm" onClick={() => router.push("/sitemanager/media/speaker/new")}>
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
                        onEdit={(s) => router.push(`/sitemanager/media/speaker/${s.id}`)}
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
            <form className="space-y-6 max-w-2xl">
              <Card>
                <CardHeader><CardTitle>Page SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Title</Label><Input value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Slug</Label><Input value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} /></div>
                  <ConfirmDialog
                    title="Save Settings"
                    description="Are you sure you want to save these page settings?"
                    onConfirm={handlePageSave}
                  >
                    <Button type="button" disabled={isSavingPage}>
                      {isSavingPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}
                    </Button>
                  </ConfirmDialog>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        )}

        {activeSpeaker && (
          <>
            <TabsContent value="audios" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Speaker Audios</h2>
                <Button size="sm" onClick={() => router.push(`/sitemanager/media/audio/new?speaker=${activeSpeaker.id}`)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Audio
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeAudios.map(audio => (
                  <div key={audio.id} className="bg-card rounded-xl border p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{audio.title}</h3>
                        {audio.isNew && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-xs text-muted-foreground break-all">{audio.audioUrl || "No URL"}</p>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/sitemanager/media/audio/${audio.id}`)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeletingAudio(audio); }} className="text-red-500"><XCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                {activeAudios.length === 0 && <p className="text-muted-foreground col-span-full">No audios found for this speaker.</p>}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <PageSeoManager endpoint={`/api/admin/speakers/${activeSpeaker.id}`} backHref="#" />
            </TabsContent>
          </>
        )}
      </Tabs>

      <ConfirmDialog open={!!deletingSpeaker} title="Delete Speaker" description="Are you sure you want to delete this speaker?" onConfirm={async () => { if (deletingSpeaker) await handleSpeakerDelete(deletingSpeaker) }} onOpenChange={(open) => !open && setDeletingSpeaker(null)} />
      <ConfirmDialog open={!!deletingAudio} title="Delete Audio" description="Are you sure you want to delete this audio?" onConfirm={async () => { if (deletingAudio) { await fetch(`/api/admin/audio/${deletingAudio.id}`, { method: 'DELETE' }); fetchData(); setDeletingAudio(null); } }} onOpenChange={(open) => !open && setDeletingAudio(null)} />
    </div>
  );
}
