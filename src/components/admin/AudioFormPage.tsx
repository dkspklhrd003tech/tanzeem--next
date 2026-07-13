"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { CustomFieldBuilder } from "@/components/admin/CustomFieldBuilder";
import { CustomFieldRenderer } from "@/components/admin/CustomFieldRenderer";
import { AudioUploader } from "@/components/admin/AudioUploader";
import { PdfUploader } from "@/components/admin/PdfUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AudioFormPage({ id, speakerIdParam = "", categoryIdParam = "" }: { id: string, speakerIdParam?: string, categoryIdParam?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = id === "new";
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [speakers, setSpeakers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    audioUrl: "",
    speakerId: speakerIdParam || "",
    categoryId: categoryIdParam || "",
    pdfUrl: "",
    fileSize: 0,
    isPublished: true,
    isNewAudio: false,
    customFields: {} as Record<string, any>
  });

  useEffect(() => {
    // Fetch speakers for dropdown
    fetch("/api/admin/speakers")
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setSpeakers(data.items.filter((s: any) => s.type !== "video"));
        }
      })
      .catch(console.error);

    if (isNew) return;
    setIsLoading(true);
    fetch(`/api/admin/audio/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.item) {
          setFormData({
            title: data.item.title || "",
            slug: data.item.slug || "",
            audioUrl: data.item.audioUrl || "",
            pdfUrl: data.item.pdfUrl || "",
            fileSize: data.item.fileSize || 0,
            speakerId: data.item.speakerId || speakerIdParam || "",
            categoryId: data.item.categoryId || categoryIdParam || "",
            isPublished: data.item.isPublished ?? true,
            isNewAudio: data.item.isNew ?? false,
            customFields: data.item.customFields || {}
          });
        }
      })
      .catch(err => console.error("Failed to load audio:", err))
      .finally(() => setIsLoading(false));
  }, [id, isNew, speakerIdParam, categoryIdParam]);

  const { uploadFile: chunkedUpload } = useChunkedUpload();

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Slug are required." });
      return;
    }
    setIsSaving(true);
    try {
      // Map isNewAudio to isNew for API compat
      const payload = { ...formData, isNew: formData.isNewAudio };

      const url = isNew ? "/api/admin/audio" : `/api/admin/audio/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save");
      toast({ title: "Success", description: "Audio Saved Successfully." });
      router.back();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isNew ? "Add Audio" : "Edit Audio"}</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => router.back()} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-white hover:bg-primary/80">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isNew ? "Create" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value, slug: isNew ? slugify(e.target.value) : formData.slug })}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug <span className="text-destructive">*</span></Label>
            <Input
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Speaker</Label>
            <Select value={formData.speakerId || "none"} onValueChange={v => setFormData({ ...formData, speakerId: v === "none" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Speaker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {speakers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Audio File (MP3) <span className="text-destructive">*</span></Label>
            <AudioUploader
              value={formData.audioUrl}
              onChange={(url, size) => setFormData(prev => ({ ...prev, audioUrl: url, fileSize: size || prev.fileSize }))}
            />
          </div>
          {/* <div className="space-y-2">
            <Label>PDF Preview (Optional)</Label>
            <PdfUploader
              value={formData.pdfUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, pdfUrl: url }))}
            />
          </div> */}
        </div>

        <div className="flex items-center space-x-6 pt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isNewAudio"
              checked={formData.isNewAudio}
              onChange={e => setFormData({ ...formData, isNewAudio: e.target.checked })}
              className="rounded border-gray-300 w-4 h-4 text-primary"
            />
            <Label htmlFor="isNewAudio" className="cursor-pointer">Mark as "New"</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded border-gray-300 w-4 h-4 text-primary"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">Published</Label>
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">Dynamic Properties</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure and fill additional metadata for this audio.
            </p>
          </div>
          <CustomFieldRenderer
            entityType="audio"
            values={formData.customFields}
            onChange={(key, val) => setFormData(prev => ({ ...prev, customFields: { ...prev.customFields, [key]: val } }))}
          />
          <CustomFieldBuilder entityType="audio" />
        </div>
      </div>
    </div>
  );
}
