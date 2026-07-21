"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, XCircle, Settings2, RefreshCw, User, ArrowLeft, Video, Music, Bot, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AudioUploader } from "@/components/admin/AudioUploader";
import PageSeoManager from "./PageSeoManager";

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
}

interface AudioItem {
  id: string;
  title: string;
  slug: string;
  audioUrl?: string;
  speakerId?: string;
  isPublished: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  videoUrl?: string;
  embedUrl?: string;
  speakerId?: string;
  isPublished: boolean;
}

export default function SpeakersPageEditor({ pageId, initialPageData, mediaContext = "both" }: { pageId: string, initialPageData: PageRecord, mediaContext?: "audio" | "video" | "both" }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const [speakersList, setSpeakersList] = useState<SpeakerItem[]>([]);
  const [audiosList, setAudiosList] = useState<AudioItem[]>([]);
  const [videosList, setVideosList] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerItem | null>(null);

  // Speaker Modal
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [speakerFormData, setSpeakerFormData] = useState({ name: "", slug: "", bio: "", avatar: "" });
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<SpeakerItem | null>(null);

  // Audio Modal
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioFormData, setAudioFormData] = useState({ title: "", slug: "", audioUrl: "", isPublished: true });
  const [editingAudioId, setEditingAudioId] = useState<string | null>(null);
  const [deletingAudio, setDeletingAudio] = useState<AudioItem | null>(null);

  // Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState({ title: "", slug: "", videoUrl: "", embedUrl: "", isPublished: true });
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [spRes, auRes, viRes] = await Promise.all([
        fetch("/api/admin/speakers"),
        fetch("/api/admin/audio"),
        fetch("/api/admin/videos")
      ]);
      if (spRes.ok) setSpeakersList((await spRes.json()).items || []);
      if (auRes.ok) setAudiosList((await auRes.json()).items || []);
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
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(speakerFormData) });
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

  const handleAudioSave = async () => {
    if (!audioFormData.title || !audioFormData.slug) return;
    try {
      const url = editingAudioId ? `/api/admin/audio/${editingAudioId}` : "/api/admin/audio";
      const method = editingAudioId ? "PUT" : "POST";
      const payload = { ...audioFormData, speakerId: activeSpeaker?.id };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      toast({ title: "Success", description: "Audio saved" });
      setIsAudioModalOpen(false);
      fetchData();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
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



  const activeAudios = audiosList.filter(a => a.speakerId === activeSpeaker?.id);
  const activeVideos = videosList.filter(v => v.speakerId === activeSpeaker?.id);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            {activeSpeaker && (
              <Button variant="outline" size="icon" onClick={() => setActiveSpeaker(null)} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {activeSpeaker
                ? `${activeSpeaker.name} ${mediaContext === "audio" ? "Audios" : mediaContext === "video" ? "Videos" : "Media"}`
                : (mediaContext === "audio" ? "Audio Speakers" : mediaContext === "video" ? "Video Speakers" : "Speakers Library")}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {activeSpeaker
              ? `Manage ${mediaContext === "audio" ? "audios" : mediaContext === "video" ? "videos" : "audios and videos"} for this speaker.`
              : "Manage speakers and their page settings."}
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeSpeaker ? (mediaContext === "video" ? "videos" : "audios") : "speakers"} variant="pill" className="space-y-6">
        <TabsList>
          {!activeSpeaker ? (
            <>
              <TabsTrigger value="speakers" className="flex-1">
                <User className="w-4 h-4 mr-2" /> Speakers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings2 className="w-4 h-4 mr-2" /> Page Setup
              </TabsTrigger>
            </>
          ) : (
            <>
              {(mediaContext === "audio" || mediaContext === "both") && (
                <TabsTrigger value="audios" className="flex-1">
                  <Music className="w-4 h-4 mr-2" /> Audios Speakers
                </TabsTrigger>
              )}
              {/* {(mediaContext === "video" || mediaContext === "both") && (
                <TabsTrigger value="videos" className="flex-1">
                  <Video className="w-4 h-4 mr-2" /> Videos
                </TabsTrigger>
              )} */}
              <TabsTrigger value="seo" className="flex-1">
                <Bot className="w-4 h-4 mr-2" /> SEO Section
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {!activeSpeaker && (
          <TabsContent value="speakers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Speakers Management</h2>
              <Button size="sm" onClick={() => { setEditingSpeakerId(null); setSpeakerFormData({ name: "", slug: "", bio: "", avatar: "" }); setIsSpeakerModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Speaker
              </Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {speakersList.map(speaker => (
                  <div key={speaker.id} onClick={() => setActiveSpeaker(speaker)} className="cursor-pointer group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
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
                        <div>
                          <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary pl-1">{speaker.name}</h3>
                          <p className="text-xs text-primary text-center rounded-full border border-primary bg-primary-light mt-0.5">
                            {(mediaContext === "audio" || mediaContext === "both") && `${audiosList.filter(a => a.speakerId === speaker.id).length} Audios`}
                            {mediaContext === "both" && " • "}
                            {(mediaContext === "video" || mediaContext === "both") && `${videosList.filter(v => v.speakerId === speaker.id).length} Videos`}
                          </p>
                        </div>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => { setEditingSpeakerId(speaker.id); setSpeakerFormData({ name: speaker.name, slug: speaker.slug, bio: speaker.bio || "", avatar: speaker.avatar || "" }); setIsSpeakerModalOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setDeletingSpeaker(speaker)}><XCircle className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{speaker.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <Button type="submit" disabled={isSavingPage}>{isSavingPage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}</Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        )}

        {activeSpeaker && (
          <>
            {(mediaContext === "audio" || mediaContext === "both") && (
              <TabsContent value="audios" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Speaker Audios</h2>
                  <Button size="sm" onClick={() => { setEditingAudioId(null); setAudioFormData({ title: "", slug: "", audioUrl: "", isPublished: true }); setIsAudioModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> Add Audio
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeAudios.map(audio => (
                    <div key={audio.id} className="bg-card hover:bg-primary-light hover:border-primary/80 rounded-lg border p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold mb-1">{audio.title}</h3>
                        <p className="text-xs text-muted-foreground break-all">{audio.audioUrl || "No URL"}</p>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingAudioId(audio.id); setAudioFormData({ title: audio.title, slug: audio.slug, audioUrl: audio.audioUrl || "", isPublished: audio.isPublished }); setIsAudioModalOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeletingAudio(audio); }} className="text-red-500"><XCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {activeAudios.length === 0 && <p className="text-muted-foreground col-span-full">No audios found for this speaker.</p>}
                </div>
              </TabsContent>
            )}

            {(mediaContext === "video" || mediaContext === "both") && (
              <TabsContent value="videos" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Speaker Videos</h2>
                  <Button size="sm" onClick={() => { setEditingVideoId(null); setVideoFormData({ title: "", slug: "", videoUrl: "", embedUrl: "", isPublished: true }); setIsVideoModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> Add Video
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeVideos.map(video => (
                    <div key={video.id} className="bg-card hover:bg-primary-light hover:border-primary/80 rounded-lg border p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold mb-1">{video.title}</h3>
                        <p className="text-xs text-muted-foreground break-all">{video.videoUrl || video.embedUrl || "No URL"}</p>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingVideoId(video.id); setVideoFormData({ title: video.title, slug: video.slug, videoUrl: video.videoUrl || "", embedUrl: video.embedUrl || "", isPublished: video.isPublished }); setIsVideoModalOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeletingVideo(video); }} className="text-red-500"><XCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {activeVideos.length === 0 && <p className="text-muted-foreground col-span-full">No videos found for this speaker.</p>}
                </div>
              </TabsContent>
            )}

            <TabsContent value="seo" className="space-y-6">
              <PageSeoManager endpoint={`/api/admin/speakers/${activeSpeaker.id}`} backHref="#" />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Speaker Modal */}
      {
        isSpeakerModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className="text-xl font-bold">{editingSpeakerId ? "Edit Speaker" : "Add Speaker"}</h2>
                <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsSpeakerModalOpen(false)}>×</Button>
              </div>
              <div className="overflow-y-auto p-6 flex-1 space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={speakerFormData.name} onChange={e => setSpeakerFormData({ ...speakerFormData, name: e.target.value, slug: editingSpeakerId ? speakerFormData.slug : slugify(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={speakerFormData.slug} onChange={e => setSpeakerFormData({ ...speakerFormData, slug: e.target.value })} /></div>
                <div className="space-y-2"><Label>Bio</Label><Textarea value={speakerFormData.bio} onChange={e => setSpeakerFormData({ ...speakerFormData, bio: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Speaker Photo</Label>
                  <ImageUploader value={speakerFormData.avatar || ""} onChange={(url) => setSpeakerFormData(prev => ({ ...prev, avatar: url }))} aspectRatio={1} />
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsSpeakerModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSpeakerSave} className="bg-primary text-white">{editingSpeakerId ? "Update" : "Save"}</Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Audio Modal */}
      {
        isAudioModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className="text-xl font-bold">{editingAudioId ? "Edit Audio Speakers" : "Add Audio"}</h2>
                <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsAudioModalOpen(false)}>×</Button>
              </div>
              <div className="overflow-y-auto p-6 flex-1 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={audioFormData.title} onChange={e => setAudioFormData({ ...audioFormData, title: e.target.value, slug: editingAudioId ? audioFormData.slug : slugify(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={audioFormData.slug} onChange={e => setAudioFormData({ ...audioFormData, slug: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Audio File (MP3)</Label>
                  <AudioUploader
                    value={audioFormData.audioUrl}
                    onChange={(url) => setAudioFormData(prev => ({ ...prev, audioUrl: url }))}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAudioModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAudioSave} className="bg-primary text-white">{editingAudioId ? "Update" : "Save"}</Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Video Modal */}
      {
        isVideoModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className="text-xl font-bold">{editingVideoId ? "Edit Video" : "Add Video"}</h2>
                <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsVideoModalOpen(false)}>×</Button>
              </div>
              <div className="overflow-y-auto p-6 flex-1 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={videoFormData.title} onChange={e => setVideoFormData({ ...videoFormData, title: e.target.value, slug: editingVideoId ? videoFormData.slug : slugify(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={videoFormData.slug} onChange={e => setVideoFormData({ ...videoFormData, slug: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Video File URL or Embed (MP4/YouTube)</Label>
                  <Input value={videoFormData.videoUrl} onChange={e => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })} placeholder="https://youtube.com/embed/... or direct video URL" />
                </div>
                <div className="space-y-2">
                  <Label>Or Embed URL (YouTube/Vimeo)</Label>
                  <Input value={videoFormData.embedUrl} onChange={e => setVideoFormData({ ...videoFormData, embedUrl: e.target.value })} placeholder="https://youtube.com/embed/..." />
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsVideoModalOpen(false)}>Cancel</Button>
                <Button onClick={handleVideoSave} className="bg-primary text-white">{editingVideoId ? "Update" : "Save"}</Button>
              </div>
            </div>
          </div>
        )
      }

      <ConfirmDialog open={!!deletingSpeaker} title="Delete Speaker" description="Are you sure you want to delete this speaker?" onConfirm={() => { if (deletingSpeaker) handleSpeakerDelete(deletingSpeaker); }} onOpenChange={(open) => !open && setDeletingSpeaker(null)} />
      <ConfirmDialog open={!!deletingAudio} title="Delete Audio" description="Are you sure you want to delete this audio?" onConfirm={async () => { if (deletingAudio) { await fetch(`/api/admin/audio/${deletingAudio.id}`, { method: 'DELETE' }); fetchData(); setDeletingAudio(null); } }} onOpenChange={(open) => !open && setDeletingAudio(null)} />
      <ConfirmDialog open={!!deletingVideo} title="Delete Video" description="Are you sure you want to delete this video?" onConfirm={async () => { if (deletingVideo) { await fetch(`/api/admin/videos/${deletingVideo.id}`, { method: 'DELETE' }); fetchData(); setDeletingVideo(null); } }} onOpenChange={(open) => !open && setDeletingVideo(null)} />
    </div >
  );
}
