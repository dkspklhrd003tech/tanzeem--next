"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator as USeparator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  title: string;
  initialData?: {
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
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-foreground-muted">
              {initialData ? `Edit ${contentType}` : `Create new ${contentType}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder={`Enter ${contentType} title`}
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: formData.slug || generateSlug(title),
                      });
                    }}
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="url-friendly-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border">
                <Button variant="ghost" size="sm" title="Bold">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Italic">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Underline">
                  <Underline className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Strikethrough">
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <USeparator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" title="Heading 1">
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Heading 2">
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Heading 3">
                  <Heading3 className="h-4 w-4" />
                </Button>
                <USeparator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" title="Align Left">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Align Center">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Align Right">
                  <AlignRight className="h-4 w-4" />
                </Button>
                <USeparator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" title="Bullet List">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Numbered List">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <USeparator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" title="Link">
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Image">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Code">
                  <Code className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Quote">
                  <Quote className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Area */}
              <Textarea
                placeholder={`Write your ${contentType} content here...`}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="min-h-[400px] border-0 rounded-none focus-visible:ring-0"
              />
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Brief summary of the content..."
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>
              <div className="pt-2">
                <Badge
                  variant={formData.isPublished ? "default" : "secondary"}
                  className={cn(
                    formData.isPublished && "bg-green-500 text-white"
                  )}
                >
                  {formData.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImageIcon className="h-10 w-10 text-foreground-muted mx-auto mb-2" />
                <p className="text-sm text-foreground-muted">
                  Click or drag image to upload
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          {categories && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO title"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                />
                <p className="text-xs text-foreground-muted mt-1">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO description"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  rows={3}
                />
                <p className="text-xs text-foreground-muted mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
