"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Trash2, Globe2, EyeOff, Edit2,
  Eye, Copy, ChevronLeft, ChevronRight, MoreHorizontal,
  CheckSquare, Square, RefreshCw, X,
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

  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("all");
  const [sort,      setSort]      = useState("newest");
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [bulkOp,    setBulkOp]    = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ status, sort, page: String(page), limit: "10", ...(debouncedSearch && { search: debouncedSearch }) });
  const { data, isLoading, mutate } = useSWR(`/api/sitemanager/pages?${params}`, fetcher, { revalidateOnFocus: true });

  const rows: any[]       = data?.pages ?? [];
  const total: number     = data?.pagination?.total ?? 0;
  const totalPages: number = data?.pagination?.totalPages ?? 1;

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
    toast({ title: "Page deleted." });
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
      toast({ title: `${action.charAt(0).toUpperCase() + action.slice(1)}d ${json.affected} page(s).` });
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
    if (res.ok) { toast({ title: "Duplicated." }); router.push(`/sitemanager/pages/${json.page.id}/edit`); }
    else toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
  }, [router, toast]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} page{total !== 1 ? "s" : ""} total</p>
        </div>
        <Button asChild size="sm"><Link href="/sitemanager/pages/new"><Plus className="h-4 w-4" />Create Page</Link></Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36"><Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="az">Title A–Z</SelectItem>
            <SelectItem value="za">Title Z–A</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => mutate()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <ConfirmDialog title="Publish selected pages?" description={`${selected.size} page(s) will be set to published.`} onConfirm={() => doBulk("publish")} open={bulkOp === "publish"} onOpenChange={o => setBulkOp(o ? "publish" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("publish")}><Globe2 className="h-3.5 w-3.5 mr-1.5" />Publish</Button>
            </ConfirmDialog>
            <ConfirmDialog title="Archive selected pages?" description={`${selected.size} page(s) will be set to draft.`} onConfirm={() => doBulk("archive")} open={bulkOp === "archive"} onOpenChange={o => setBulkOp(o ? "archive" : null)}>
              <Button variant="outline" size="sm" onClick={() => setBulkOp("archive")}><EyeOff className="h-3.5 w-3.5 mr-1.5" />Archive</Button>
            </ConfirmDialog>
            <ConfirmDialog title="Delete selected pages?" description={`${selected.size} page(s) will be permanently deleted.`} onConfirm={() => doBulk("delete")} open={bulkOp === "delete"} onOpenChange={o => setBulkOp(o ? "delete" : null)}>
              <Button variant="destructive" size="sm" onClick={() => setBulkOp("delete")}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete</Button>
            </ConfirmDialog>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}><X className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState icon={Globe2} title="No pages found" description={debouncedSearch ? "Try a different search term." : "Create your first page to get started."} actionLabel="Create Page" actionHref="/sitemanager/pages/new" className="py-16" />
          ) : (
            <>
              {/* Table head */}
              <div className="flex items-center gap-4 px-5 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                  {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                </button>
                <span className="flex-1">Title</span>
                <span className="hidden sm:block w-32">Slug</span>
                <span className="w-24 text-center">Status</span>
                <span className="hidden md:block w-24">Template</span>
                <span className="hidden lg:block w-28">Updated</span>
                <span className="w-8" />
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {rows.map((row: any) => (
                  <div key={row.id} className={cn("flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors group", selected.has(row.id) && "bg-primary/5")}>
                    <button onClick={() => toggleOne(row.id)}>
                      {selected.has(row.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <Link href={`/sitemanager/pages/${row.id}/edit`} className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block">{row.title}</Link>
                      {row.authorName && <p className="text-[11px] text-muted-foreground/60 truncate">by {row.authorName}</p>}
                    </div>
                    <div className="hidden sm:flex items-center gap-1 w-32">
                      <span className="text-xs text-muted-foreground font-mono truncate">/{row.slug}</span>
                      <button onClick={() => copySlug(row.slug, toast)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"><Copy className="h-3 w-3" /></button>
                    </div>
                    <div className="w-24 flex justify-center">
                      <Badge variant="outline" className={cn("text-[10px] gap-1", row.isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-muted-foreground")}>
                        {row.isPublished ? <><Globe2 className="h-2.5 w-2.5" />Published</> : <><EyeOff className="h-2.5 w-2.5" />Draft</>}
                      </Badge>
                    </div>
                    <div className="hidden md:block w-24">
                      <span className="text-xs text-muted-foreground capitalize">{row.template ?? "default"}</span>
                    </div>
                    <div className="hidden lg:block w-28">
                      <span className="text-xs text-muted-foreground">{row.updatedAt ? timeAgo(row.updatedAt) : "—"}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild><Link href={`/sitemanager/pages/${row.id}/edit`}><Edit2 className="h-3.5 w-3.5" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><a href={`/${row.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" />View</a></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => doDuplicate(row)}><Copy className="h-3.5 w-3.5" />Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setDeleting(row.id)}>
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm (single row) */}
      <ConfirmDialog title="Delete this page?" description="This action cannot be undone." onConfirm={() => { if (deleting) { doDelete(deleting); setDeleting(null); } }} open={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
