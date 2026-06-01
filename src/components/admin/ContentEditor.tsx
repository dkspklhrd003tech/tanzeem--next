"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  ArrowLeft,
  Settings,
  Globe,
  Share2,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const parseSeoFromContent = (content: string) => {
  const match = content.match(/<!--SEO_METADATA_JSON:([\s\S]*?)-->/);
  let seo = {
    canonicalUrl: "",
    noIndex: false,
    ogTitle: "",
    ogImage: "",
    schemaType: "WebPage",
    schemaJsonLd: "",
  };
  let cleanContent = content;
  if (match) {
    try {
      seo = { ...seo, ...JSON.parse(match[1]) };
      cleanContent = content.replace(/<!--SEO_METADATA_JSON:[\s\S]*?-->/, "").trim();
    } catch (e) {
      console.error("Failed to parse SEO metadata", e);
    }
  }
  return { seo, cleanContent };
};

export function ContentEditor({
  title,
  initialData,
  categories,
  onSave,
  onPreview,
  onCancel,
  contentType,
}: ContentEditorProps) {
  const [seoTab, setSeoTab] = useState<"basic" | "social" | "schema">("basic");
  const [isSchemaCustom, setIsSchemaCustom] = useState(false);

  const [formData, setFormData] = useState(() => {
    const { seo, cleanContent } = parseSeoFromContent(initialData?.content || "");
    if (seo.schemaJsonLd) {
      // If it exists, mark it as custom to prevent auto-overwrites
      // unless it matches default format or is blank
      setIsSchemaCustom(true);
    }
    return {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: cleanContent,
      excerpt: initialData?.excerpt || "",
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      metaKeywords: initialData?.metaKeywords || "",
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
      featuredImage: initialData?.featuredImage || "",
      categoryId: initialData?.categoryId || "",
      sections: initialData?.sections || [],
      // SEO comment-persisted fields
      canonicalUrl: seo.canonicalUrl || "",
      noIndex: seo.noIndex || false,
      ogTitle: seo.ogTitle || "",
      ogImage: seo.ogImage || "",
      schemaType: seo.schemaType || "WebPage",
      schemaJsonLd: seo.schemaJsonLd || "",
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate Schema JSON-LD dynamically when related page metadata changes
  useEffect(() => {
    if (!isSchemaCustom) {
      const generated = {
        "@context": "https://schema.org",
        "@type": formData.schemaType || "WebPage",
        "name": formData.metaTitle || formData.title || "Untitled",
        "description": formData.metaDescription || formData.excerpt || "",
        "url": formData.canonicalUrl || `https://tanzeem.org/${formData.slug || ""}`
      };
      setFormData(prev => ({
        ...prev,
        schemaJsonLd: JSON.stringify(generated, null, 2)
      }));
    }
  }, [
    formData.title,
    formData.slug,
    formData.metaTitle,
    formData.metaDescription,
    formData.excerpt,
    formData.canonicalUrl,
    formData.schemaType,
    isSchemaCustom
  ]);

  const getSerializedData = (data: typeof formData) => {
    const seoData = {
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      ogTitle: data.ogTitle,
      ogImage: data.ogImage,
      schemaType: data.schemaType,
      schemaJsonLd: data.schemaJsonLd,
    };
    const seoComment = `<!--SEO_METADATA_JSON:${JSON.stringify(seoData)}-->`;
    const serializedContent = `${seoComment}\n${data.content.replace(/<!--SEO_METADATA_JSON:[\s\S]*?-->/, "").trim()}`;
    
    const {
      canonicalUrl,
      noIndex,
      ogTitle,
      ogImage,
      schemaType,
      schemaJsonLd,
      ...rest
    } = data;

    return {
      ...rest,
      content: serializedContent,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    const serialized = getSerializedData(formData);
    await onSave(serialized);
    setIsSaving(false);
  };

  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Validation function with custom character limits and helper states
  const getValidationMessage = (type: "title" | "description" | "keywords", value: string) => {
    const len = value.length;
    if (type === "title") {
      if (len === 0) return { text: "0 CH | RECOMMENDED: 50-55", color: "text-foreground-muted", isValid: true };
      if (len > 55) return { text: `${len} CH | TOO LONG (MAX 55)`, color: "text-red-500 font-bold", isValid: false };
      if (len < 50) return { text: `${len} CH | TOO SHORT (MIN 50)`, color: "text-amber-500 font-semibold", isValid: true };
      return { text: `${len} CH | PERFECT LENGTH`, color: "text-green-600 font-semibold", isValid: true };
    } else if (type === "description") {
      if (len === 0) return { text: "0 CH | RECOMMENDED: 140-149", color: "text-foreground-muted", isValid: true };
      if (len > 149) return { text: `${len} CH | TOO LONG (MAX 149)`, color: "text-red-500 font-bold", isValid: false };
      if (len < 140) return { text: `${len} CH | RECOMMENDED: 140-149`, color: "text-amber-500 font-semibold", isValid: true };
      return { text: `${len} CH | PERFECT LENGTH`, color: "text-green-600 font-semibold", isValid: true };
    } else {
      if (len === 0) return { text: "0 CH | RECOMMENDED: < 100", color: "text-foreground-muted", isValid: true };
      if (len > 100) return { text: `${len} CH | TOO LONG (MAX 100)`, color: "text-red-500 font-bold", isValid: false };
      return { text: `${len} CH | VALID`, color: "text-green-600 font-semibold", isValid: true };
    }
  };

  const titleVal = getValidationMessage("title", formData.metaTitle);
  const descVal = getValidationMessage("description", formData.metaDescription);
  const keyVal = getValidationMessage("keywords", formData.metaKeywords);

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
            <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-muted rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
            <p className="text-sm text-foreground-muted mt-1">
              {initialData ? `Update existing ${contentType} details` : `Create and publish a new ${contentType}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onPreview && (
            <Button variant="outline" onClick={onPreview} className="rounded-xl px-6">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <ConfirmDialog
            title={`Save ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
            description={`Are you sure you want to save all changes to the ${contentType}?`}
            onConfirm={handleSave}
          >
            <Button
              disabled={isSaving}
              className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-8 font-semibold shadow-md active:scale-95 transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      {/* Modern & Smart SEO Tabbed Card Section */}
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
        <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSeoTab("basic")}
              className={cn(
                "pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                seoTab === "basic"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              )}
            >
              Basic SEO
            </button>
            <button
              onClick={() => setSeoTab("social")}
              className={cn(
                "pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                seoTab === "social"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              )}
            >
              Social (OG)
            </button>
            <button
              onClick={() => setSeoTab("schema")}
              className={cn(
                "pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                seoTab === "schema"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              )}
            >
              AEO & Schema
            </button>
          </div>
          <ConfirmDialog
            title="Save SEO Settings"
            description="Are you sure you want to update the SEO settings for this page? This will also update the page."
            onConfirm={handleSave}
          >
            <Button className="bg-black hover:bg-zinc-800 text-white rounded-lg px-6 font-semibold uppercase tracking-wider text-xs shadow-sm">
              Save SEO
            </Button>
          </ConfirmDialog>
        </div>

        <CardContent className="p-6">
          {seoTab === "basic" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoMetaTitle" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" /> Meta Title
                    </Label>
                    <span className={cn("text-[10px] tracking-wider font-semibold", titleVal.color)}>
                      {titleVal.text}
                    </span>
                  </div>
                  <Input
                    id="seoMetaTitle"
                    placeholder="Enter meta title override..."
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="rounded-xl border-border bg-background focus:ring-primary/20 text-sm py-5"
                  />
                </div>

                {/* Search Visibility */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Search Visibility
                  </Label>
                  <div className="flex items-center space-x-2 border border-border bg-background rounded-xl p-3 h-[46px]">
                    <input
                      type="checkbox"
                      id="noIndex"
                      checked={formData.noIndex}
                      onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <label htmlFor="noIndex" className="text-xs text-foreground font-medium cursor-pointer">
                      Hide from search engines (no-index)
                    </label>
                  </div>
                </div>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoMetaDescription" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                    Meta Description
                  </Label>
                  <span className={cn("text-[10px] tracking-wider font-semibold", descVal.color)}>
                    {descVal.text}
                  </span>
                </div>
                <Textarea
                  id="seoMetaDescription"
                  placeholder="Brief summary of the page content for search engines..."
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="rounded-xl border-border bg-background focus:ring-primary/20 text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Focus Keywords */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoMetaKeywords" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                      Focus Keywords
                    </Label>
                    <span className={cn("text-[10px] tracking-wider font-semibold", keyVal.color)}>
                      {keyVal.text}
                    </span>
                  </div>
                  <Input
                    id="seoMetaKeywords"
                    placeholder="comma, separated, list, of, keywords..."
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    className="rounded-xl border-border bg-background focus:ring-primary/20 text-sm py-5"
                  />
                </div>

                {/* Canonical URL Override */}
                <div className="space-y-2">
                  <Label htmlFor="seoCanonical" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Canonical URL Override
                  </Label>
                  <Input
                    id="seoCanonical"
                    placeholder="https://example.com/custom-canonical-page"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    className="rounded-xl border-border bg-background focus:ring-primary/20 text-sm py-5"
                  />
                  <p className="text-[10px] text-foreground-muted">
                    Current Default: <span className="underline">https://tanzeem.org/{formData.slug || "page-slug"}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {seoTab === "social" && (
            <div className="space-y-6">
              {/* OpenGraph Title */}
              <div className="space-y-2">
                <Label htmlFor="seoOgTitle" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> OpenGraph Title
                </Label>
                <Input
                  id="seoOgTitle"
                  placeholder="Enter social sharing title override..."
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  className="rounded-xl border-border bg-background focus:ring-primary/20 text-sm py-5"
                />
              </div>

              {/* OG Sharing Image */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> OG Sharing Image
                </Label>
                <div className="max-w-2xl">
                  <ImageUploader
                    value={formData.ogImage}
                    onChange={(url) => setFormData({ ...formData, ogImage: url })}
                    aspectRatio={1.91}
                  />
                </div>
                <p className="text-[10px] text-foreground-muted italic mt-1">
                  Recommended for better click-through on Facebook, LinkedIn, etc. (Images under 1MB).
                </p>
              </div>
            </div>
          )}

          {seoTab === "schema" && (
            <div className="space-y-6">
              {/* Schema Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> Schema.org Type (AEO Optimization)
                </Label>
                <Select
                  value={formData.schemaType}
                  onValueChange={(val) => {
                    setFormData({ ...formData, schemaType: val });
                    // Trigger regeneration if it's not custom override
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border bg-background focus:ring-primary/20">
                    <SelectValue placeholder="Select schema type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WebPage">Standard Web Page</SelectItem>
                    <SelectItem value="Article">Article / News</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom JSON-LD Schema */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoSchemaJson" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    Custom JSON-LD Schema (Advanced)
                  </Label>
                  <div className="flex items-center gap-2">
                    {isSchemaCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSchemaCustom(false)}
                        className="text-[10px] h-6 px-2 text-primary border border-primary/20 hover:bg-primary/5"
                      >
                        Reset to Auto-generated
                      </Button>
                    )}
                    <span className="text-[10px] font-semibold text-foreground-muted">
                      {isSchemaCustom ? "Custom Overridden" : "Auto-generated"}
                    </span>
                  </div>
                </div>
                <Textarea
                  id="seoSchemaJson"
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                  value={formData.schemaJsonLd}
                  onChange={(e) => {
                    setIsSchemaCustom(true);
                    setFormData({ ...formData, schemaJsonLd: e.target.value });
                  }}
                  rows={6}
                  className="rounded-xl border-border bg-background focus:ring-primary/20 font-mono text-xs"
                />
                <p className="text-[10px] text-foreground-muted">
                  Leave empty to use automatic schema based on type. Use valid JSON only.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="general">General Content</TabsTrigger>
              <TabsTrigger value="sections">Page Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Title */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-semibold text-foreground mb-2 block">Content Title</Label>
                      <Input
                        id="title"
                        placeholder={`Enter ${contentType} title`}
                        value={formData.title}
                        onChange={(e) => {
                          const titleValText = e.target.value;
                          setFormData({
                            ...formData,
                            title: titleValText,
                            slug: formData.slug || generateSlug(titleValText),
                          });
                        }}
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug" className="text-sm font-semibold text-foreground mb-2 block">URL Slug</Label>
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
                  <CardTitle>Legacy Content (SEO/Backup)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder={`Write your ${contentType} content here...`}
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
            </TabsContent>

            <TabsContent value="sections">
              <PageSectionBuilder 
                pageId={(initialData as any)?.id || "new"} 
                onSave={(sections) => setFormData({ ...formData, sections: sections as any })} 
              />
            </TabsContent>
          </Tabs>
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
              <ImageUploader
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                aspectRatio={16 / 9}
              />
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
        </div>
      </div>
    </motion.div>
  );
}
