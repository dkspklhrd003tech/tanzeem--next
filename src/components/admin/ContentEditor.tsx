"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageSectionBuilder } from "./PageSectionBuilder";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { PdfUploader } from "./PdfUploader";
import { MediaCategoryManager } from "./MediaCategoryManager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface ContentEditorProps {
  title: string;
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    featuredImage?: string;
    featuredImageAlt?: string;
    pdfUrl?: string;
    audioUrl?: string;
    categoryId?: string;
    sections?: any[];
  };
  categories?: { id: string; name: string }[];
  onSave: (data: Record<string, unknown>) => void;
  onPreview?: () => void;
  onCancel?: () => void;
  contentType: string;
}

export function ContentEditor({
  title,
  initialData,
  categories,
  onSave,
  onPreview,
  onCancel,
  contentType,
}: ContentEditorProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords || "",
    isPublished: initialData?.isPublished || false,
    isFeatured: initialData?.isFeatured || false,
    featuredImage: initialData?.featuredImage || "",
    featuredImageAlt: initialData?.featuredImageAlt || "",
    pdfUrl: initialData?.pdfUrl || "",
    audioUrl: initialData?.audioUrl || "",
    categoryId: initialData?.categoryId || "",
    sections: initialData?.sections || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [pressReleaseTab, setPressReleaseTab] = useState<"pdf" | "text">(
    initialData?.pdfUrl ? "pdf" : "text"
  );

  const handleSave = async () => {
    setIsSaving(true);
    let finalContent = formData.content;
    if (contentType === "press-releases" && pressReleaseTab === "pdf" && formData.pdfUrl && !finalContent) {
      finalContent = "<p>PDF Document Attached</p>";
    }
    if (contentType === "audio-books" && pressReleaseTab === "pdf" && formData.audioUrl && !finalContent) {
      finalContent = "<p>Audio File Attached</p>";
    }
    const { sections, ...rest } = formData;
    await onSave({ ...rest, content: finalContent, sections: sections as any });
    setIsSaving(false);
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {initialData ? `Update existing ${contentType}` : `Create a new ${contentType}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onPreview && (
            <Button variant="outline" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <ConfirmDialog
            title={`Save ${contentType}`}
            description={`Are you sure you want to save changes to this ${contentType}?`}
            onConfirm={handleSave}
          >
            <Button
              disabled={isSaving}
              className="bg-[#0d5844] hover:bg-[#0a4636] text-white px-8 font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold mb-1.5 block">Title</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${contentType} title`}
                  value={formData.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({
                      ...formData,
                      title: v,
                      slug: formData.slug || generateSlug(v),
                    });
                  }}
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-sm font-semibold mb-1.5 block">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="url-friendly-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              {contentType === "audio-books" ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Audio File (MP3)</Label>
                    <AudioUploader
                      value={formData.audioUrl}
                      onChange={(url) => setFormData({ ...formData, audioUrl: url })}
                    />
                  </div>
                </div>
              ) : contentType === "press-releases" ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Release Type</Label>
                    <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() => setPressReleaseTab("pdf")}
                        className={cn(
                          "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                          pressReleaseTab === "pdf"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        PDF Document Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setPressReleaseTab("text")}
                        className={cn(
                          "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                          pressReleaseTab === "text"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        Written Statement
                      </button>
                    </div>
                  </div>

                  {pressReleaseTab === "pdf" ? (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">PDF Document</Label>
                      <PdfUploader
                        value={formData.pdfUrl}
                        onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-semibold mb-1.5 block">Content</Label>
                      <RichTextEditor
                        content={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder={`Write ${contentType} content here...`}
                      />
                    </div>
                  )}
                </div>
              ) : contentType === "pages" && (initialData?.id === '56f118be-bcad-42a0-a60a-37300adc8a39' || initialData?.id === 'e34f44a9-bd26-4433-a962-250991321181') ? (
                <div>
                  <MediaCategoryManager
                    data={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    mediaType={initialData?.id === '56f118be-bcad-42a0-a60a-37300adc8a39' ? 'audio' : 'video'}
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder={`Write ${contentType} content here...`}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="excerpt" className="text-sm font-semibold mb-1.5 block">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {contentType !== "audio-books" && !(contentType === "pages" && (formData.slug === 'audios-by-category' || formData.slug === 'videos-by-category')) && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Page Sections</h3>
                </div>
                <PageSectionBuilder
                  pageId={(initialData as any)?.id || "new"}
                  onSave={(sections) => setFormData({ ...formData, sections: sections as any })}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SEO Settings</h3>
              {showSeo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showSeo && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaTitle" className="text-xs font-medium mb-1 block">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      placeholder="SEO title (leave blank to use page title)"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaKeywords" className="text-xs font-medium mb-1 block">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      placeholder="comma, separated, keywords"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="metaDescription" className="text-xs font-medium mb-1 block">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search engines..."
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(c) => setFormData({ ...formData, isFeatured: c })}
                />
              </div>
              <Badge variant={formData.isPublished ? "default" : "secondary"} className={cn(formData.isPublished && "bg-green-500 text-white")}>
                {formData.isPublished ? "Published" : "Draft"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Label className="text-sm font-semibold mb-2 block">Featured Image</Label>
              <ImageUploader
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                altValue={formData.featuredImageAlt}
                onAltChange={(alt) => setFormData({ ...formData, featuredImageAlt: alt })}
                aspectRatio={16 / 9}
              />
            </CardContent>
          </Card>



          {categories && categories.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <Label className="text-sm font-semibold mb-2 block">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AudioUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

function AudioUploader({ value = "", onChange }: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file (e.g., MP3)");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "audio");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        onChange(data.url);
      } catch (err) {
        console.error("Audio upload error:", err);
        alert("Failed to upload Audio");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center justify-between p-3 border border-emerald-500/30 bg-emerald-50/50  rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100  flex items-center justify-center flex-shrink-0">
              <Upload className="h-4 w-4 text-emerald-600 " />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Attached Audio</p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline truncate block"
              >
                {value.split("/").pop()}
              </a>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/80 rounded-lg h-7 w-7 shrink-0"
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
              <p className="text-xs font-medium">Uploading Audio...</p>
            </>
          ) : (
            <>
              <Upload className="h-7 w-7 text-primary mb-2" />
              <p className="text-xs font-medium text-center">Click to upload Audio</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">MP3 format recommended</p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
