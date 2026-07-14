"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CustomFieldBuilder } from "@/components/admin/CustomFieldBuilder";
import { CustomFieldRenderer } from "@/components/admin/CustomFieldRenderer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SpeakerFormPage({ id, type = "audio" }: { id: string, type?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = id === "new";
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    avatar: "",
    type: type,
    order: 0,
    customFields: {} as Record<string, any>
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    fetch(`/api/admin/speakers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.item) {
          setFormData({
            name: data.item.name || "",
            slug: data.item.slug || "",
            bio: data.item.bio || "",
            avatar: data.item.avatar || "",
            type: data.item.type || type,
            order: data.item.order || 0,
            customFields: data.item.customFields || {}
          });
        }
      })
      .catch(err => console.error("Failed to load speaker:", err))
      .finally(() => setIsLoading(false));
  }, [id, type, isNew]);

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and Slug are required." });
      return;
    }
    setIsSaving(true);
    try {
      const url = isNew ? "/api/admin/speakers" : `/api/admin/speakers/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save");
      toast({ title: "Success", description: "Speaker Saved Successfully." });
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
        <h1 className="text-2xl font-bold">{isNew ? "Add Speaker" : "Edit Speaker"}</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => router.back()} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
          <ConfirmDialog
            title={isNew ? "Create Speaker" : "Save Changes"}
            description={`Are you sure you want to ${isNew ? "create this new speaker" : "save changes to this speaker"}?`}
            onConfirm={handleSave}
          >
            <Button disabled={isSaving} className="bg-primary text-white hover:bg-primary/80">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Name <span className="text-destructive">*</span></Label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value, slug: isNew ? slugify(e.target.value) : formData.slug })}
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

        <div className="space-y-2">
          <Label>Urdu Name</Label>
          <Input
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            className="text-right font-bold text-lg"
            dir="rtl"
            style={{ fontFamily: "'Jameel Noori Nastaleeq', serif" }}
            placeholder="اردو نام"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Speaker Photo</Label>
            <ImageUploader
              value={formData.avatar || ""}
              onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
              aspectRatio={1}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">Dynamic Properties</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure and fill additional metadata for this speaker.
            </p>
          </div>
          <CustomFieldRenderer
            entityType="speaker"
            values={formData.customFields}
            onChange={(key, val) => setFormData(prev => ({ ...prev, customFields: { ...prev.customFields, [key]: val } }))}
          />
          <CustomFieldBuilder entityType="speaker" />
        </div>
      </div>
    </div>
  );
}
