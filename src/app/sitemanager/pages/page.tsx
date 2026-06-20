"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Trash2, Globe2, EyeOff, Edit2,
  Eye, Copy, MoreHorizontal, CheckSquare, Square,
  RefreshCw, X, Bell, LayoutGrid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkOp, setBulkOp] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showNotification, setShowNotification] = useState(true);

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

  const doDelete = useCallback(async (id: string) => {
    await fetch(`/api/sitemanager/pages/${id}`, { method: "DELETE" });
    toast({ title: "Page deleted successfully." });
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
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
      body: JSON.stringify({ title: `${row.title} (Copy)`, slug: `${row.slug}-copy`, content: "", isPublished: false, template: row.template }),
    });
    const json = await res.json();
    if (res.ok) {
      toast({ title: "Page duplicated successfully." });
      router.push(`/sitemanager/pages/${json.page.id}/edit`);
    } else {
      toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
    }
  }, [router, toast]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 min-h-screen text-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-900/60 shadow-2xl relative overflow-hidden">
      {/* Ambient decorative glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#0d5844]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
            <h1 className="text-2xl font-black tracking-tight text-white">Pages Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Manage your site templates, dynamic content structures, and frontend layouts.
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0d5844]/20 border border-[#0d5844]/30 text-emerald-400 font-bold text-[10px]">
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

      {/* Admin Notification */}
      {showNotification && (
        <Alert className="relative z-10 bg-emerald-950/20 border-emerald-500/20 text-emerald-200 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-xl flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
              <Bell className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <AlertTitle className="text-xs font-black uppercase tracking-widest text-emerald-400">Admin Notification</AlertTitle>
              <AlertDescription className="text-xs text-emerald-300/80 mt-0.5 leading-relaxed font-medium">
                The dynamic, state-driven Organization Page is ready to configure.
              </AlertDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs h-8 px-4 rounded-full border border-emerald-500/30 transition-all shadow-[0_0_12px_rgba(16,185,129,0.1)]">
              <Link href="/sitemanager/pages/organization/edit">
                Configure Page
              </Link>
            </Button>
            <button
              onClick={handleDismissNotification}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-full transition-colors shrink-0"
              title="Dismiss Notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <Input
            placeholder="Search pages by title or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-9 bg-slate-950/60 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-emerald-500/40 focus:ring-emerald-500/10 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={status} onValueChange={v => setStatus(v)}>
          <SelectTrigger className="w-40 bg-slate-950/60 border-slate-800/80 text-slate-200 rounded-xl focus:border-emerald-500/40 hover:bg-slate-900/60">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200 rounded-xl">
            <SelectItem value="all" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">All Status</SelectItem>
            <SelectItem value="published" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Active Only</SelectItem>
            <SelectItem value="draft" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Draft Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v)}>
          <SelectTrigger className="w-44 bg-slate-950/60 border-slate-800/80 text-slate-200 rounded-xl focus:border-emerald-500/40 hover:bg-slate-900/60">
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200 rounded-xl">
            <SelectItem value="newest" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Newest first</SelectItem>
            <SelectItem value="oldest" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Oldest first</SelectItem>
            <SelectItem value="az" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Title A–Z</SelectItem>
            <SelectItem value="za" className="focus:bg-emerald-500/10 focus:text-emerald-300 font-medium">Title Z–A</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => mutate()} className="bg-slate-950/60 border border-slate-800/80 hover:bg-slate-900/60 hover:text-emerald-400 rounded-xl text-slate-400 p-2 shrink-0 transition-all duration-300">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk operations bar */}
      {someSelected && (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-300 tracking-wide uppercase">{selected.size} items selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
            <ConfirmDialog title="Set selected pages to Active?" description={`${selected.size} page(s) will be set to published and shown on the frontend.`} onConfirm={() => doBulk("publish")} open={bulkOp === "publish"} onOpenChange={o => setBulkOp(o ? "publish" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("publish")} className="bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <Globe2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />Make Active
              </Button>
            </ConfirmDialog>
            <ConfirmDialog title="Set selected pages to Draft?" description={`${selected.size} page(s) will be archived as Drafts and hidden on the frontend.`} onConfirm={() => doBulk("archive")} open={bulkOp === "archive"} onOpenChange={o => setBulkOp(o ? "archive" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("archive")} className="bg-amber-500/10 hover:bg-amber-500/25 border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <EyeOff className="h-3.5 w-3.5 mr-1.5 text-amber-400" />Set to Draft
              </Button>
            </ConfirmDialog>
            <ConfirmDialog title="Delete selected pages permanently?" description={`${selected.size} page(s) will be deleted permanently. This cannot be undone.`} onConfirm={() => doBulk("delete")} open={bulkOp === "delete"} onOpenChange={o => setBulkOp(o ? "delete" : null)}>
              <Button variant="destructive" size="sm" onClick={() => setBulkOp("delete")} className="bg-red-500/10 hover:bg-red-500/25 border-red-500/30 text-red-300 hover:text-red-100 text-xs font-bold rounded-lg px-3 py-1.5 h-8">
                <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-400" />Delete Selected
              </Button>
            </ConfirmDialog>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900/60 ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Pages Card Container */}
      <Card className="relative z-10 bg-slate-950/40 backdrop-blur-md border border-slate-900 shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-900">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 bg-slate-950/20">
                  <Skeleton className="h-4.5 w-4.5 rounded bg-slate-900" />
                  <Skeleton className="h-5 flex-1 bg-slate-900" />
                  <Skeleton className="h-4 w-28 bg-slate-900 hidden sm:block" />
                  <Skeleton className="h-7 w-28 rounded-full bg-slate-900" />
                  <Skeleton className="h-4 w-16 bg-slate-900 hidden md:block" />
                  <Skeleton className="h-4 w-20 bg-slate-900 hidden lg:block" />
                  <Skeleton className="h-7 w-7 rounded bg-slate-900" />
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
              className="py-20 text-slate-300"
            />
          ) : (
            <div className="overflow-x-auto">
              {/* Headings */}
              <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-950/80 border-b border-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[700px]">
                <button onClick={toggleAll} className="text-slate-500 hover:text-slate-300 transition-colors">
                  {allSelected ? (
                    <CheckSquare className="h-4.5 w-4.5 text-emerald-400 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
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
              <div className="divide-y divide-slate-900 min-w-[700px]">
                {rows.map((row: any) => {
                  const isSelected = selected.has(row.id);
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3.5 transition-all duration-300 group border-l-2 border-transparent",
                        isSelected
                          ? "bg-emerald-500/5 border-l-emerald-500"
                          : "hover:bg-slate-900/30 hover:border-l-slate-800"
                      )}
                    >
                      <button onClick={() => toggleOne(row.id)} className="transition-transform active:scale-95">
                        {isSelected ? (
                          <CheckSquare className="h-4.5 w-4.5 text-emerald-400 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/sitemanager/pages/${row.id}/edit`}
                          className="text-sm font-bold text-slate-100 hover:text-emerald-400 transition-colors truncate block filter drop-shadow-sm"
                        >
                          {row.title}
                        </Link>
                        {row.authorName && (
                          <p className="text-[10px] text-slate-500/80 mt-0.5 font-medium">by {row.authorName}</p>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 w-60">
                        <span className="text-xs text-slate-400 font-mono truncate select-all">/{row.slug}</span>
                        <button
                          onClick={() => copySlug(row.slug, toast)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 p-0.5 hover:bg-slate-800/60 rounded"
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
                              const res = await fetch(`/api/sitemanager/pages/${row.id}`, {
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
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
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
                          <SelectContent className="bg-slate-950 border-slate-900 text-slate-100 min-w-[130px] rounded-xl shadow-2xl z-50">
                            <SelectItem value="active" className="text-[10px] font-black uppercase tracking-wider text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300 cursor-pointer py-2">
                              Active
                            </SelectItem>
                            <SelectItem value="draft" className="text-[10px] font-black uppercase tracking-wider text-amber-400 focus:bg-amber-500/10 focus:text-amber-300 cursor-pointer py-2">
                              Draft (Hide)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="hidden md:block w-24">
                        <span className="text-xs text-slate-400 capitalize font-medium">{row.template ?? "default"}</span>
                      </div>

                      <div className="hidden lg:block w-28">
                        <span className="text-xs text-slate-500 font-medium">{row.updatedAt ? timeAgo(row.updatedAt) : "—"}</span>
                      </div>

                      <div className="w-36 flex items-center justify-end gap-1 pr-2">
                        {/* Edit */}
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                          title="Edit Page"
                        >
                          <Link href={`/sitemanager/pages/${row.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>

                        {/* View */}
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-200"
                          title="View Live"
                        >
                          <a href={`/${row.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>

                        {/* Duplicate */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => doDuplicate(row)}
                          className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                          title="Duplicate Page"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(row.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
