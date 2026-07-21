"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Send, Eye, XCircle, Copy,
  ChevronDown, ChevronUp, Clock, AlertCircle, Check,
  LayoutTemplate, FileText, SlidersHorizontal, Search, Wand2
} from "lucide-react";
import { PageActionBar } from "@/components/admin/PageActionBar";
import { PageSectionBuilder } from "@/components/admin/PageSectionBuilder";
import PageSeoManager from "@/components/admin/PageSeoManager";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link as TipTapLink } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Image as TipTapImage } from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Heading1, Heading2, Heading3, Heading4,
  Quote, Code, Undo, Redo, Type, Maximize2, Minimize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  template: string;
  parentId: string;
  isPublished: boolean;
  showInMenu: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface PageRecord extends PageFormData {
  id: string;
  authorName?: string | null;
  authorEmail?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

interface PageFormProps {
  mode: "create" | "edit";
  initialData?: PageRecord;
  parentPages?: { id: string; title: string }[];
}

const EMPTY: PageFormData = {
  title: "", slug: "", content: "", excerpt: "", featuredImage: "",
  template: "default", parentId: "", isPublished: false, showInMenu: false,
  metaTitle: "", metaDescription: "",
};

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function charCount(val: string, max: number) {
  const n = val.length;
  return (
    <span className={cn("text-[11px] tabular-nums", n > max ? "text-destructive font-medium" : "text-muted-foreground")}>
      {n}/{max}
    </span>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolBtn({ onClick, active = false, disabled = false, tip, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; tip: string; children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={onClick} disabled={disabled}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center transition-colors text-sm",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{tip}</TooltipContent>
    </Tooltip>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RTE({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      TipTapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      TipTapImage,
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (!url) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="h-64 bg-muted animate-pulse rounded-xl" />;

  const toolbar = (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/40 border-b border-border">
        <ToolBtn tip="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-3.5 w-3.5" /></ToolBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn tip="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="H4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Type className="h-3.5 w-3.5" /></ToolBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn tip="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-3.5 w-3.5" /></ToolBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn tip="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify className="h-3.5 w-3.5" /></ToolBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn tip="Insert link" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn tip="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo className="h-3.5 w-3.5" /></ToolBtn>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => { if (!htmlMode) setRawHtml(editor.getHTML()); setHtmlMode(v => !v); }}
            className="text-[10px] px-2 h-6 rounded border border-border hover:bg-muted text-muted-foreground font-mono">
            {htmlMode ? "Visual" : "HTML"}
          </button>
          <ToolBtn tip={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFullscreen(v => !v)}>
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </ToolBtn>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all",
      fullscreen && "fixed inset-4 z-50 flex flex-col shadow-2xl rounded-xl")}>
      {toolbar}
      {htmlMode ? (
        <textarea className="w-full font-mono text-xs p-4 bg-muted/30 resize-none focus:outline-none"
          style={{ minHeight: fullscreen ? "100%" : "320px" }}
          value={rawHtml}
          onChange={(e) => { setRawHtml(e.target.value); editor.commands.setContent(e.target.value); onChange(e.target.value); }} />
      ) : (
        <EditorContent editor={editor}
          className={cn("overflow-y-auto", fullscreen ? "flex-1" : "")}
          style={{ minHeight: fullscreen ? undefined : "320px" }} />
      )}
    </div>
  );
}

// ─── Main PageForm ────────────────────────────────────────────────────────────

export function PageForm({ mode, initialData, parentPages = [] }: PageFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  // Strip null values from initialData so they don't overwrite EMPTY's "" defaults
  const safeInitial = initialData
    ? Object.fromEntries(Object.entries(initialData).filter(([, v]) => v !== null && v !== undefined))
    : {};
  const [form, setForm] = useState<PageFormData>({ ...EMPTY, ...safeInitial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // "content" = rich text editor tab, "sections" = section builder tab, "seo" = SEO Center
  const [activeTab, setActiveTab] = useState<"content" | "sections" | "seo">("sections");
  // Sections are managed by PageSectionBuilder internally; we only need to
  // trigger a DB persist on explicit save (draft / publish).
  const sectionsRef = useRef<any[]>([]);

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && mode === "create") {
      set("slug", slugify(form.title));
    }
  }, [form.title, slugManual, mode]);

  // Auto-save draft every 60s
  useEffect(() => {
    if (mode === "create") return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (form.title.trim().length >= 3) doSave("draft", true);
    }, 60_000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [form]);

  const set = (k: keyof PageFormData, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  function validate(publish: boolean) {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    if (form.title.trim().length > 200) e.title = "Title must be 200 characters or fewer.";
    if (!form.slug.trim()) e.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(form.slug)) e.slug = "Slug: lowercase letters, numbers, hyphens and slashes only.";
    if (publish) {
      if (form.template === "redirect") {
        if (!form.content.trim()) {
          e.content = "Redirect URL is required.";
        } else if (!/^https?:\/\/\S+$/.test(form.content.trim()) && !/^\/\S*$/.test(form.content.trim())) {
          e.content = "Please enter a valid URL (e.g. https://example.com or an internal path starting with /).";
        }
      }
      // Content is no longer strictly required when publishing because a page might use the dynamic PageSectionBuilder.
    }
    if (form.metaTitle.length > 60) e.metaTitle = "Max 60 characters.";
    if (form.metaDescription.length > 155) e.metaDescription = "Max 155 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function doSave(intent: "draft" | "publish", silent = false) {
    const publish = intent === "publish" || (intent === "draft" && silent && form.isPublished);
    if (!validate(publish)) { if (!silent) toast({ variant: "destructive", title: "Please fix validation errors." }); return; }
    setSaving(true);
    try {
      const payload = { ...form, isPublished: publish };
      const url = mode === "create" ? "/api/sitemanager/pages" : `/api/sitemanager/pages/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) { setErrors(json.errors); if (!silent) toast({ variant: "destructive", title: "Validation error", description: Object.values(json.errors).join(" ") }); }
        else if (!silent) toast({ variant: "destructive", title: json.error ?? "Save failed." });
        return;
      }

      if (json.page) {
        setForm(prev => ({
          ...prev,
          isPublished: json.page.isPublished,
          slug: json.page.slug,
        }));
      }

      setLastSaved(new Date());
      if (!silent) {
        toast({ title: publish ? "Page published!" : "Draft saved.", description: `"${form.title}" has been saved.` });
        if (mode === "create") router.push(`/sitemanager/pages/${json.page.id}/edit`);
      }

      // ── Persist sections if we have a page id ──────────────────────────
      const savedPageId = mode === "create" ? json.page?.id : initialData?.id;
      if (savedPageId && sectionsRef.current.length > 0) {
        try {
          await fetch("/api/admin/page_sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId: savedPageId, sections: sectionsRef.current }),
          });
        } catch {
          // Non-fatal — sections will be retried on next save
          if (!silent) toast({ title: "Note", description: "Page saved but sections could not be persisted. Please save again." });
        }
      }
    } catch {
      if (!silent) toast({ variant: "destructive", title: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await fetch(`/api/sitemanager/pages/${initialData!.id}`, { method: "DELETE" });
      toast({ title: "Page deleted." });
      router.push("/sitemanager/pages");
    } catch {
      toast({ variant: "destructive", title: "Delete failed." });
    }
  }

  async function handleDuplicate() {
    const res = await fetch("/api/sitemanager/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, title: `${form.title} (Copy)`, slug: `${form.slug}-copy`, isPublished: false, duplicateFromId: initialData?.id }),
    });
    const json = await res.json();
    if (res.ok) { toast({ title: "Page duplicated." }); router.push(`/sitemanager/pages/${json.page.id}/edit`); }
    else toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
  }

  const previewUrl = form.slug ? `/${form.slug}` : null;

  const handleGenerateMetaTitle = () => {
    let newTitle = form.title ? `${form.title} | Tanzeem-e-Islami` : "Tanzeem-e-Islami";
    if (newTitle.length > 60) newTitle = form.title || "";
    set("metaTitle", newTitle);
    toast({ title: "Generated", description: "Meta title generated." });
  };

  const handleGenerateMetaDescription = () => {
    let plainContent = (form.content || "").replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plainContent && form.excerpt) plainContent = form.excerpt;
    
    let newDesc = plainContent;
    if (newDesc.length > 155) {
      newDesc = newDesc.substring(0, 152).trim() + "...";
    }
    
    if (!newDesc && form.title) {
      newDesc = `Learn more about ${form.title} at Tanzeem-e-Islami. Comprehensive resources, guides, and information.`;
    }
    
    set("metaDescription", newDesc);
    toast({ title: "Generated", description: "Meta description generated." });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ── */}
      <PageActionBar
        mode={mode}
        title={mode === "create" ? "Create Page" : form.title || "Edit Page"}
        authorName={initialData?.authorName}
        updatedAt={initialData?.updatedAt}
        lastSaved={lastSaved}
        previewUrl={previewUrl}
        seoUrl={initialData ? `/sitemanager/pages/${initialData.id}/edit/seo` : null}
        isPublished={form.isPublished}
        saving={saving}
        onDuplicate={mode === "edit" ? handleDuplicate : undefined}
        onSaveDraft={() => doSave("draft")}
        onPublish={() => doSave("publish")}
        onDelete={mode === "edit" ? () => setShowDelete(true) : undefined}
      />
      {showDelete && mode === "edit" && (
        <ConfirmDialog title="Delete page?" description={`"${form.title}" will be permanently deleted.`} onConfirm={handleDelete} open={showDelete} onOpenChange={setShowDelete} />
      )}

      {/* ── Body ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col — main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic info */}
          <Card>
            <CardContent className="p-5 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Title <span className="text-destructive">*</span></Label>
                <Input id="title" placeholder="Page title" value={form.title} onChange={e => set("title", e.target.value)}
                  className={cn("text-base", errors.title && "border-destructive focus-visible:ring-destructive/20")} />
                {errors.title && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Slug <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">/</span>
                    <Input id="slug" className={cn("pl-5 font-mono text-sm", errors.slug && "border-destructive")}
                      value={form.slug} onChange={e => { setSlugManual(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, "")); }} />
                  </div>
                  {mode === "create" && (
                    <Button variant="outline" size="sm" type="button" onClick={() => { setSlugManual(false); set("slug", slugify(form.title)); }}>Auto</Button>
                  )}
                </div>
                {errors.slug && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.slug}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Content / Sections tabs */}
          {form.template === "redirect" ? (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Redirect Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div>
                  <Label htmlFor="redirectUrl" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                    Redirect URL (opens in new tab by default) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="redirectUrl"
                    placeholder="e.g. https://lms.quranacademy.com/"
                    value={form.content}
                    onChange={e => set("content", e.target.value)}
                    className={cn(errors.content && "border-destructive focus-visible:ring-destructive/20")}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Visitors navigating to this page will be automatically redirected to this URL in a new tab.
                  </p>
                  {errors.content && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.content}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              {/* Tab bar */}
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "sections"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Page Sections
                  <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                    Dynamic
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "content"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Rich Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "seo"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <Search className="h-4 w-4" />
                  SEO Center
                </button>
              </div>

              {activeTab === "content" && (
                <CardContent className="px-5 pb-5 pt-4">
                  <RTE value={form.content} onChange={v => set("content", v)} />
                  {errors.content && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.content}</p>}
                  <div className="mt-3">
                    <Label htmlFor="excerpt" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Excerpt</Label>
                    <Textarea id="excerpt" rows={3} placeholder="Brief summary shown in listings…" value={form.excerpt} onChange={e => set("excerpt", e.target.value)} className="text-sm resize-none" />
                  </div>
                </CardContent>
              )}

              {activeTab === "sections" && (
                <CardContent className="px-5 pb-6 pt-4">
                  {mode === "create" ? (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/30">
                      <LayoutTemplate className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Save the page first</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Click "Save Draft" or "Publish" to create the page, then add sections here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground mb-4">
                        Build the page layout with reorderable sections. Sections take priority over the Rich Text content when rendering.
                      </p>
                      <PageSectionBuilder
                        pageId={initialData!.id}
                        onSave={(sections) => { sectionsRef.current = sections; }}
                      />
                    </>
                  )}
                </CardContent>
              )}
              {activeTab === "seo" && (
                <CardContent className="px-5 pb-6 pt-4">
                  {mode === "create" ? (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/30">
                      <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Save the page first</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Click "Save Draft" or "Publish" to create the page, then you can configure SEO.
                      </p>
                    </div>
                  ) : (
                    <PageSeoManager pageId={initialData!.id} hideHeader={true} />
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right col — settings */}
        <div className="space-y-4">
          {/* Publish */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.isPublished ? "Visible on the website" : "Hidden from visitors"}</p>
                </div>
                <Badge className={cn("text-xs", form.isPublished ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border")} variant="outline">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="showInMenu" className="text-sm cursor-pointer">Show in menu</Label>
                <Switch id="showInMenu" checked={form.showInMenu} onCheckedChange={v => set("showInMenu", v)} />
              </div>
            </CardContent>
          </Card>

          {/* Page settings */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label htmlFor="template" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Template</Label>
                <Select value={form.template} onValueChange={v => set("template", v)}>
                  <SelectTrigger id="template"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="sidebar">With Sidebar</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="leader">Leader Profile</SelectItem>
                    <SelectItem value="redirect">External Redirect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {parentPages.length > 0 && (
                <div>
                  <Label htmlFor="parent" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Parent Page</Label>
                  <Select value={form.parentId || "none"} onValueChange={v => set("parentId", v === "none" ? "" : v)}>
                    <SelectTrigger id="parent"><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (top-level)</SelectItem>
                      {parentPages.filter(p => p.id && p.id !== initialData?.id).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic SEO */}
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm">Basic SEO</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metaTitle" className="text-xs font-semibold uppercase tracking-wide">Meta Title</Label>
                    <Button variant="ghost" size="sm" type="button" onClick={handleGenerateMetaTitle} className="h-5 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><Wand2 className="w-3 h-3 mr-1"/> Generate</Button>
                  </div>
                  {charCount(form.metaTitle, 60)}
                </div>
                <Input
                  id="metaTitle"
                  placeholder="Default is Page Title"
                  maxLength={60}
                  value={form.metaTitle}
                  onChange={e => set("metaTitle", e.target.value)}
                  className={cn("text-sm", errors.metaTitle && "border-destructive")}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Aim for 50–60 characters. Put the most important keyword first.</p>
                {errors.metaTitle && <p className="text-xs text-destructive mt-1">{errors.metaTitle}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metaDescription" className="text-xs font-semibold uppercase tracking-wide">Meta Description</Label>
                    <Button variant="ghost" size="sm" type="button" onClick={handleGenerateMetaDescription} className="h-5 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><Wand2 className="w-3 h-3 mr-1"/> Generate</Button>
                  </div>
                  {charCount(form.metaDescription, 155)}
                </div>
                <Textarea
                  id="metaDescription"
                  placeholder="Brief summary for search engine results snippets"
                  maxLength={155}
                  value={form.metaDescription}
                  rows={3}
                  onChange={e => set("metaDescription", e.target.value)}
                  className={cn("text-sm resize-none", errors.metaDescription && "border-destructive")}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Aim for 120–155 characters to display correctly on desktop and mobile.</p>
                {errors.metaDescription && <p className="text-xs text-destructive mt-1">{errors.metaDescription}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Auto-save indicator */}
          {mode === "edit" && (
            <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 px-1">
              <Clock className="h-3 w-3" />Auto-saves draft every 60 seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
