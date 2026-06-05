"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
    categoryId: initialData?.categoryId || "",
    sections: initialData?.sections || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { sections, ...rest } = formData;
    await onSave({ ...rest, sections: sections as any });
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
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Content</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder={`Write ${contentType} content here...`}
                />
              </div>
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
