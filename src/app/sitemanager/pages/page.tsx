"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, XCircle, Globe2, EyeOff, Edit2,
  Eye, Copy, MoreHorizontal, CheckSquare, Square,
  RefreshCw, X, Bell, LayoutGrid, Upload, Image as ImageIcon, AlertCircle, LayoutList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function copySlug(slug: string, toast: any) {
  navigator.clipboard.writeText(`/${slug}`);
  toast({ title: "Copied!", description: `/${slug}` });
}

export default function PagesListPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [bannerBgImage, setBannerBgImage] = useState<string>("");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const bg = data?.settings?.banner?.banner_bg_image || "";
        setBannerBgImage(bg);
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setBannerError("Selected file is not a valid image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setBannerPreviewUrl(dataUrl); // show local preview immediately
        const img = new Image();
        img.src = dataUrl;
        img.onload = async () => {
          const width = img.width;
          const height = img.height;
          const ratio = width / height;
          const targetRatio = 1920 / 339;
          const ratioDiff = Math.abs(ratio - targetRatio);

          if (width !== 1920 || height !== 339) {
            if (ratioDiff > 0.02) {
              setBannerError(`Image size must be exactly 1920px x 339px (got ${width}px x ${height}px) and maintain the aspect ratio.`);
              return;
            }
          }

          setIsUploadingBanner(true);
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "uploads");

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const uploadData = await res.json();
            const imageUrl = uploadData.url;

            // Save to settings API
            const settingsRes = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                settings: {
                  banner_bg_image: imageUrl,
                },
                group: "banner",
              }),
            });

            if (!settingsRes.ok) throw new Error("Failed to save banner image setting");

            setBannerBgImage(imageUrl);
            toast({
              title: "Success",
              description: "Global Page Banner Background Image updated successfully.",
            });
          } catch (error) {
            console.error("Upload error:", error);
            setBannerError("Failed to upload/save banner image. Please try again.");
          } finally {
            setIsUploadingBanner(false);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = async () => {
    setIsUploadingBanner(true);
    try {
      const settingsRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            banner_bg_image: "",
          },
          group: "banner",
        }),
      });

      if (!settingsRes.ok) throw new Error("Failed to clear banner image setting");

      setBannerBgImage("");
      setBannerPreviewUrl(null);
      toast({
        title: "Success",
        description: "Global Page Banner Background Image removed successfully.",
      });
    } catch (error) {
      console.error("Clear error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove banner image. Please try again.",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkOp, setBulkOp] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showNotification, setShowNotification] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("tanzeem_dismiss_org_notif") === "true";
      if (dismissed) setShowNotification(false);
    }
  }, []);

  const handleDismissNotification = () => {
    setShowNotification(false);
    localStorage.setItem("tanzeem_dismiss_org_notif", "true");
  };

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Request all pages (limit: 1000) to support listing without pagination
  const params = new URLSearchParams({
    status,
    sort,
    limit: "1000",
    ...(debouncedSearch && { search: debouncedSearch })
  });
  const { data, isLoading, mutate } = useSWR(`/api/sitemanager/pages?${params}`, fetcher, { revalidateOnFocus: true });

  const rows: any[] = data?.pages ?? [];
  const total: number = data?.pagination?.total ?? 0;

  const allIds = rows.map((r: any) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id: string) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const doDelete = useCallback(async (title: string) => {
    await fetch(`/api/sitemanager/pages/${title}`, { method: "DELETE" });
    toast({ title: "Page deleted successfully." });
    setSelected(prev => { const s = new Set(prev); s.delete(title); return s; });
    mutate();
  }, [mutate, toast]);

  const doBulk = useCallback(async (action: string) => {
    const ids = Array.from(selected);
    const res = await fetch("/api/sitemanager/pages/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    const json = await res.json();
    if (res.ok) {
      toast({ title: `${action === "publish" ? "Activated" : action === "archive" ? "Archived" : "Deleted"} ${json.affected} page(s).` });
      setSelected(new Set());
      mutate();
    } else toast({ variant: "destructive", title: json.error ?? "Bulk action failed." });
    setBulkOp(null);
  }, [selected, mutate, toast]);

  const doDuplicate = useCallback(async (row: any) => {
    const res = await fetch("/api/sitemanager/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${row.title} (Copy)`, slug: `${row.slug}-copy`, content: "", isPublished: false, template: row.template, duplicateFromId: row.id }),
    });
    const json = await res.json();
    if (res.ok) {
      toast({ title: "Page duplicated successfully." });
      setTimeout(() => router.push(`/sitemanager/pages/${json.page.id}/edit`), 100);
    } else {
      toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
    }
  }, [router, toast]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 min-h-screen text-foreground bg-background rounded-2xl border border-border shadow-2xl relative overflow-hidden">
      {/* Ambient decorative glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#0d5844]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-slate-300/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Pages Manager</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage your site templates, dynamic content structures, and frontend layouts.
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0d5844]/20 border border-[#0d5844]/30 text-primary font-bold text-[10px]">
              {total} pages total
            </span>
          </p>
        </div>
        <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(16,185,129,0.2)]">
          <Link href="/sitemanager/pages/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Page
          </Link>
        </Button>
      </div>

      {/* Global Page Banner Background Image Uploader */}
      <Card className="relative z-10 bg-card backdrop-blur-md border border-border shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <ImageIcon className="h-4.5 w-4.5 text-primary" /> Global Page Banner Background Image
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              This banner background image applies globally to all internal pages (excluding the homepage).
            </p>
          </div>
          {bannerBgImage && (
            <Button
              variant="outline"
              size="sm"
              className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-600 hover:text-red-100 text-xs font-bold rounded-xl px-3 py-1.5 h-8 transition-all duration-200"
              onClick={handleRemoveBanner}
              disabled={isUploadingBanner}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Remove Image
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 grid lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-500/40 bg-muted hover:bg-accent group",
                isUploadingBanner && "pointer-events-none opacity-60"
              )}
              onClick={() => bannerFileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <p className="text-sm font-bold text-foreground">Click to upload global banner image</p>
              <p className="text-xs text-muted-foreground mt-1">Exactly 1920px x 339px (aspect ratio 1920:339, max 1MB)</p>
              <input
                type="file"
                ref={bannerFileInputRef}
                onChange={handleBannerFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {bannerError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
                <span className="font-semibold">{bannerError}</span>
              </div>
            )}
          </div>

          {/* Real-time Banner Preview */}
          <div className="space-y-2">
            <div className="relative overflow-hidden bg-primary text-foreground py-10 rounded-xl flex flex-col items-center justify-center text-center w-full min-h-[140px] shadow-inner border border-primary/20">
              {/* Dynamic BG Image */}
              {bannerBgImage ? (
                <div
                  className="absolute inset-0 z-0 bg-contain bg-center"
                  style={{ backgroundImage: bannerPreviewUrl ? `url('${bannerPreviewUrl}')` : bannerBgImage ? `url('${resolveMediaUrl(bannerBgImage)}')` : "none" }}
                />
              ) : null}

              {/* Ambient Overlay Patterns */}
              <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-primary" />
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#c8a84e]/10 rounded-full blur-[45px] -mr-20 -mt-20" />
              <div className="absolute -bottom-12 left-1/4 w-[150px] h-[150px] bg-primary rounded-full blur-[30px]" />

              {/* Arabesque geometric watermark */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat bg-center"
                style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '100px' }}
              />

              {/* Content */}
              <div className="relative z-20 px-4">
                <h1 className="text-lg md:text-xl font-bold mb-1.5 text-white">
                  Frequently Asked Questions
                </h1>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider !text-white">
                  <span>Home</span>
                  <span>/</span>
                  <span>FAQs</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search pages by title or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-9 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:border-emerald-500/40 focus:ring-emerald-500/10 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={status} onValueChange={v => setStatus(v)}>
          <SelectTrigger className="w-40 bg-background border-input text-foreground rounded-xl focus:border-emerald-500/40 hover:bg-accent">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground rounded-xl">
            <SelectItem value="all" className="focus:bg-primary focus:text-emerald-700 font-medium">All Status</SelectItem>
            <SelectItem value="published" className="focus:bg-primary focus:text-emerald-700 font-medium">Active Only</SelectItem>
            <SelectItem value="draft" className="focus:bg-primary focus:text-emerald-700 font-medium">Draft Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v)}>
          <SelectTrigger className="w-44 bg-background border-input text-foreground rounded-xl focus:border-emerald-500/40 hover:bg-accent">
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground rounded-xl">
            <SelectItem value="newest" className="focus:bg-primary focus:text-emerald-700 font-medium">Newest first</SelectItem>
            <SelectItem value="oldest" className="focus:bg-primary focus:text-emerald-700 font-medium">Oldest first</SelectItem>
            <SelectItem value="az" className="focus:bg-primary focus:text-emerald-700 font-medium">Title A–Z</SelectItem>
            <SelectItem value="za" className="focus:bg-primary focus:text-emerald-700 font-medium">Title Z–A</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex bg-background border border-input rounded-xl p-1">
          <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={cn("h-8 w-8 rounded-lg transition-all", viewMode === "list" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={cn("h-8 w-8 rounded-lg transition-all", viewMode === "grid" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => mutate()} className="bg-background border border-input hover:bg-accent hover:text-primary rounded-xl text-muted-foreground p-2 shrink-0 transition-all duration-300">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk operations bar */}
      {someSelected && (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 bg-emerald-50 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">{selected.size} items selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            <ConfirmDialog title="Set selected pages to Active?" description={`${selected.size} page(s) will be set to published and shown on the frontend.`} onConfirm={() => doBulk("publish")} open={bulkOp === "publish"} onOpenChange={o => setBulkOp(o ? "publish" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("publish")} className="bg-primary hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-700 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <Globe2 className="h-3.5 w-3.5 mr-1.5 text-primary" />Make Active
              </Button>
            </ConfirmDialog>
            <ConfirmDialog title="Set selected pages to Draft?" description={`${selected.size} page(s) will be archived as Drafts and hidden on the frontend.`} onConfirm={() => doBulk("archive")} open={bulkOp === "archive"} onOpenChange={o => setBulkOp(o ? "archive" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("archive")} className="bg-amber-50 hover:bg-amber-500/25 border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <EyeOff className="h-3.5 w-3.5 mr-1.5 text-amber-600" />Set to Draft
              </Button>
            </ConfirmDialog>
            <ConfirmDialog title="Delete selected pages permanently?" description={`${selected.size} page(s) will be deleted permanently. This cannot be undone.`} onConfirm={() => doBulk("delete")} open={bulkOp === "delete"} onOpenChange={o => setBulkOp(o ? "delete" : null)}>
              <Button variant="destructive" size="sm" onClick={() => setBulkOp("delete")} className="bg-red-500/10 hover:bg-red-500/25 border-red-500/30 text-red-600 hover:text-red-100 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <XCircle className="h-3.5 w-3.5 mr-1.5 text-red-600" />Delete Selected
              </Button>
            </ConfirmDialog>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Pages Card Container */}
      <Card className="relative z-10 bg-card backdrop-blur-md border border-border shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-900">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 bg-muted">
                  <Skeleton className="h-4.5 w-4.5 rounded bg-muted" />
                  <Skeleton className="h-5 flex-1 bg-muted" />
                  <Skeleton className="h-4 w-28 bg-muted hidden sm:block" />
                  <Skeleton className="h-7 w-28 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-16 bg-muted hidden md:block" />
                  <Skeleton className="h-4 w-20 bg-muted hidden lg:block" />
                  <Skeleton className="h-7 w-7 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Globe2}
              title="No pages found"
              description={debouncedSearch ? "Try a different search term or check filters." : "Create your first page to get started."}
              actionLabel="Create Page"
              actionHref="/sitemanager/pages/new"
              className="py-20 text-foreground"
            />
          ) : (
            <div className="overflow-x-auto">
              {/* Headings */}
              <div className="flex items-center gap-4 px-6 py-3.5 bg-muted border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[700px]">
                <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground transition-colors">
                  {allSelected ? (
                    <CheckSquare className="h-4.5 w-4.5 text-primary filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </button>
                <span className="flex-1">Title</span>
                <span className="hidden sm:block w-60">Slug</span>
                <span className="w-32 text-center">Status</span>
                <span className="hidden md:block w-24">Template</span>
                <span className="hidden lg:block w-28">Updated</span>
                <span className="w-36 text-right pr-4">Actions</span>
              </div>

              {/* Rows */}
              {viewMode === "list" ? (
                <div className="divide-y divide-slate-900 min-w-[700px]">
                  {rows.map((row: any) => {
                    const isSelected = selected.has(row.id);
                    return (
                      <div
                        key={row.id}
                        className={cn(
                          "flex items-center gap-4 px-6 py-3.5 transition-all duration-300 group border-l-2 border-transparent",
                          isSelected
                            ? "bg-primary/5 border-l-emerald-500"
                            : "hover:bg-accent/50 hover:border-l-slate-800"
                        )}
                      >
                        <button onClick={() => toggleOne(row.id)} className="transition-transform active:scale-95">
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5 text-primary filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-muted-foreground group-hover:text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/sitemanager/pages/${row.id}/edit`}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block filter drop-shadow-sm"
                          >
                            {row.title}
                          </Link>
                          {row.authorName && (
                            <p className="text-[10px] text-muted-foreground/80 mt-0.5 font-medium">by {row.authorName}</p>
                          )}
                        </div>

                        <div className="hidden sm:flex items-center gap-1.5 w-60">
                          <span className="text-xs text-muted-foreground font-mono truncate select-all">/{row.slug}</span>
                          <button
                            onClick={() => copySlug(row.slug, toast)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5 hover:bg-accent rounded"
                            title="Copy Slug"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Interactive Status Selector Dropdown */}
                        <div className="w-32 flex justify-center">
                          <Select
                            value={row.isPublished ? "active" : "draft"}
                            onValueChange={async (newVal) => {
                              const active = newVal === "active";
                              try {
                                const res = await fetch(`/api/sitemanager/pages/${row.title}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isPublished: active })
                                });
                                if (res.ok) {
                                  toast({
                                    title: active ? "Page Status: Active" : "Page Status: Draft",
                                    description: `"${row.title}" is now ${active ? "visible" : "hidden (draft)"} on the frontend.`
                                  });
                                  mutate();
                                } else {
                                  toast({ variant: "destructive", title: "Error", description: "Failed to update page status." });
                                }
                              } catch {
                                toast({ variant: "destructive", title: "Network error. Please try again." });
                              }
                            }}
                          >
                            <SelectTrigger size="xs" className={cn(
                              "h-6 w-28 text-[10px] font-black uppercase rounded-full border-none focus:ring-0 focus:ring-offset-0 px-2 cursor-pointer transition-all duration-300 select-none",
                              row.isPublished
                                ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                : "bg-amber-50 text-amber-600 hover:bg-amber-500/20 border border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                            )}>
                              <SelectValue>
                                <span className="flex items-center gap-1.5 justify-center w-full">
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    row.isPublished
                                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"
                                      : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-pulse"
                                  )} />
                                  {row.isPublished ? "Active" : "Draft"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground min-w-[130px] rounded-xl shadow-2xl z-50">
                              <SelectItem value="active" className="text-[10px] font-black uppercase tracking-wider text-primary focus:bg-primary focus:text-emerald-700 cursor-pointer py-2">
                                Active
                              </SelectItem>
                              <SelectItem value="draft" className="text-[10px] font-black uppercase tracking-wider text-amber-600 focus:bg-amber-50 focus:text-amber-300 cursor-pointer py-2">
                                Draft (Hide)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="hidden md:block w-24">
                          <span className="text-xs text-muted-foreground capitalize font-medium">{row.template ?? "default"}</span>
                        </div>

                        <div className="hidden lg:block w-28">
                          <span className="text-xs text-muted-foreground font-medium">{row.updatedAt ? timeAgo(row.updatedAt) : "—"}</span>
                        </div>

                        <div className="w-36 flex items-center justify-end gap-1 pr-2">
                          {/* Edit */}
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-primary rounded-lg transition-all duration-200"
                            title="Edit Page"
                          >
                            <Link href={`/sitemanager/pages/${row.id}/edit`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>

                          {/* View */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/${row.slug}`, '_blank', 'noopener,noreferrer')}
                            className="h-8 w-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-all duration-200"
                            title="View Live"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Duplicate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => doDuplicate(row)}
                            className="h-8 w-8 text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                            title="Duplicate Page"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(row.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Delete Page"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                  {rows.map((row: any) => {
                    const isSelected = selected.has(row.id);
                    return (
                      <div
                        key={row.id}
                        className={cn(
                          "relative flex flex-col rounded-2xl border p-4 bg-card backdrop-blur-md transition-all duration-300 shadow-sm",
                          isSelected
                            ? "border-emerald-500 bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "border-input hover:border-border hover:bg-accent"
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <button onClick={() => toggleOne(row.id)} className="transition-transform active:scale-95 shrink-0 pt-0.5">
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-primary filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground hover:text-muted-foreground" />
                            )}
                          </button>

                          <Select
                            value={row.isPublished ? "active" : "draft"}
                            onValueChange={async (newVal) => {
                              const active = newVal === "active";
                              try {
                                const res = await fetch(`/api/sitemanager/pages/${row.title}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isPublished: active })
                                });
                                if (res.ok) {
                                  toast({
                                    title: active ? "Page Status: Active" : "Page Status: Draft",
                                    description: `"${row.title}" is now ${active ? "visible" : "hidden (draft)"} on the frontend.`
                                  });
                                  mutate();
                                } else {
                                  toast({ variant: "destructive", title: "Error", description: "Failed to update page status." });
                                }
                              } catch {
                                toast({ variant: "destructive", title: "Network error. Please try again." });
                              }
                            }}
                          >
                            <SelectTrigger size="xs" className={cn(
                              "h-6 w-24 text-[9px] font-black uppercase rounded-full border-none focus:ring-0 focus:ring-offset-0 px-2 cursor-pointer transition-all duration-300 select-none",
                              row.isPublished
                                ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                : "bg-amber-50 text-amber-600 hover:bg-amber-500/20 border border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                            )}>
                              <SelectValue>
                                <span className="flex items-center gap-1.5 justify-center w-full">
                                  {row.isPublished ? "Active" : "Draft"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground min-w-[130px] rounded-xl shadow-2xl z-50">
                              <SelectItem value="active" className="text-[10px] font-black uppercase tracking-wider text-primary focus:bg-primary focus:text-emerald-700 cursor-pointer py-2">
                                Active
                              </SelectItem>
                              <SelectItem value="draft" className="text-[10px] font-black uppercase tracking-wider text-amber-600 focus:bg-amber-50 focus:text-amber-300 cursor-pointer py-2">
                                Draft (Hide)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Link href={`/sitemanager/pages/${row.id}/edit`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1 filter drop-shadow-sm">
                            {row.title}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground font-mono truncate bg-background px-1.5 py-0.5 rounded">/{row.slug}</span>
                            <button onClick={() => copySlug(row.slug, toast)} className="text-muted-foreground hover:text-foreground p-0.5 hover:bg-accent rounded transition-colors" title="Copy Slug">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                          <div className="flex flex-col text-muted-foreground font-medium">
                            <span>{row.template ?? "default"}</span>
                            <span>{row.updatedAt ? timeAgo(row.updatedAt) : "—"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white hover:bg-primary rounded-lg transition-all" title="Edit Page">
                              <Link href={`/sitemanager/pages/${row.id}/edit`}><Edit2 className="h-3.5 w-3.5" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => window.open(`/${row.slug}`, '_blank', 'noopener,noreferrer')} className="h-7 w-7 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-all" title="View Live">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => doDuplicate(row)} className="h-7 w-7 text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 rounded-lg transition-all" title="Duplicate Page">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleting(row.id)} className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all" title="Delete Page">
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        title="Delete this page permanently?"
        description="This action is irreversible and the page content will be lost."
        onConfirm={() => { if (deleting) { doDelete(deleting); setDeleting(null); } }}
        open={!!deleting}
        onOpenChange={o => { if (!o) setDeleting(null); }}
      />
    </div>
  );
}
