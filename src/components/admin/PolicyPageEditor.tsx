"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save, Loader2, FileText, Image as ImageIcon,
  Globe2, EyeOff, ExternalLink, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const PAGE_SLUG = "policy";

interface PageData {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  template: string;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function PolicyPageEditor() {
  const [pageId, setPageId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PageData, "id">>({
    title: "Policy",
    content: "",
    excerpt: "",
    featuredImage: "",
    template: "full-width",
    isPublished: true,
    metaTitle: "",
    metaDescription: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  // ── Fetch from pages table via the standard API ─────────────────────────────
  const fetchPage = useCallback(async () => {
    setIsLoading(true);
    try {
      // The pages API supports lookup by slug as the id param
      const res = await fetch(`/api/sitemanager/pages/${PAGE_SLUG}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch page");
      const data = await res.json();
      const p: PageData = data.page;
      setPageId(p.id);
      setForm({
        title: p.title ?? "Policy",
        content: p.content ?? "",
        excerpt: p.excerpt ?? "",
        featuredImage: p.featuredImage ?? "",
        template: p.template ?? "full-width",
        isPublished: p.isPublished ?? true,
        metaTitle: p.metaTitle ?? "",
        metaDescription: p.metaDescription ?? "",
      });
      setNotFound(false);
    } catch (err) {
      console.error("Failed to fetch policy page:", err);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Could not load the policy page data. Please refresh.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // ── Save via the standard pages PUT API ─────────────────────────────────────
  const handleSave = async () => {
    if (!pageId) {
      toast({ variant: "destructive", title: "Error", description: "Page ID not found. Cannot save." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content,
          excerpt: form.excerpt,
          featuredImage: form.featuredImage || null,
          template: form.template,
          isPublished: form.isPublished,
          metaTitle: form.metaTitle || null,
          metaDescription: form.metaDescription || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      toast({
        title: "Policy Page Saved",
        description: form.isPublished
          ? "Changes are live on the frontend."
          : "Saved as draft — not visible on the frontend.",
      });
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message ?? "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle publish status immediately ───────────────────────────────────────
  const handleTogglePublish = async () => {
    if (!pageId) return;
    const newStatus = !form.isPublished;
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setForm(prev => ({ ...prev, isPublished: newStatus }));
      toast({
        title: newStatus ? "Page Published" : "Page set to Draft",
        description: newStatus
          ? "The Policy page is now visible on the frontend."
          : "The Policy page is now hidden (draft).",
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update publish status." });
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Page not found in DB ─────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Policy Page Not Found</h2>
        <p className="text-muted-foreground text-sm">
          No page with slug <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">policy</code> exists
          in the Pages database. Please create it via{" "}
          <a href="/sitemanager/pages/new" className="text-primary underline underline-offset-2">
            Pages → Create Page
          </a>{" "}
          with slug <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">policy</code>, then return here.
        </p>
        <Button variant="outline" onClick={fetchPage} className="rounded-full">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Policy Page Editor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Editing{" "}
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">/{PAGE_SLUG}</code>
            {" — "}
            <a
              href={`/${PAGE_SLUG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
            >
              View Live <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Publish toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublish}
            className={cn(
              "rounded-full px-4 font-bold text-xs transition-all",
              form.isPublished
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            )}
          >
            {form.isPublished ? (
              <><EyeOff className="w-4 h-4 mr-1.5" />Set to Draft</>
            ) : (
              <><Globe2 className="w-4 h-4 mr-1.5" />Publish</>
            )}
          </Button>

          {/* Save with confirm */}
          <ConfirmDialog
            title="Save Policy Content"
            description="Are you sure you want to update the policy page? Changes will be live immediately if the page is published."
            onConfirm={handleSave}
          >
            <Button
              disabled={isSaving}
              className="bg-[#0d5844] hover:bg-[#0a4636] rounded-full px-8"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4 mr-2" />Save Changes</>
              }
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
          form.isPublished
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            form.isPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
          )} />
          {form.isPublished ? "Active — visible on frontend" : "Draft — hidden from frontend"}
        </span>
      </div>

      <div className="space-y-6">
        {/* General Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              General Details
            </CardTitle>
            <CardDescription>Title, featured image, and SEO metadata for the policy page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Page Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Privacy Policy or Terms of Service"
                className="max-w-md"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Excerpt / Subtitle</Label>
              <Input
                value={form.excerpt ?? ""}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Short description shown in banners and SEO"
                className="max-w-xl"
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Featured Header Image
              </Label>
              <ImageUploader
                value={form.featuredImage ?? ""}
                onChange={(url) => setForm(prev => ({ ...prev, featuredImage: url }))}
                aspectRatio={21 / 9}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Override the page title and description for search engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Meta Title <span className="text-muted-foreground font-normal normal-case">(max 70 chars)</span></Label>
              <Input
                value={form.metaTitle ?? ""}
                onChange={(e) => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Policy | Tanzeem-e-Islami"
                maxLength={70}
                className="max-w-xl"
              />
              <p className="text-[11px] text-muted-foreground">{(form.metaTitle ?? "").length}/70 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Meta Description <span className="text-muted-foreground font-normal normal-case">(max 160 chars)</span></Label>
              <Input
                value={form.metaDescription ?? ""}
                onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Our policy on privacy, terms, and user rights."
                maxLength={160}
                className="max-w-xl"
              />
              <p className="text-[11px] text-muted-foreground">{(form.metaDescription ?? "").length}/160 characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Content</CardTitle>
            <CardDescription>Use the rich text editor to write and format the full policy document.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm(prev => ({ ...prev, content }))}
                placeholder="Write your policy content here…"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
