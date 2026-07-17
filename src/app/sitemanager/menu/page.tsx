"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save, RotateCcw, Plus, Search, Eye, EyeOff, X,
  FileText, Link as LinkIcon, Loader2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MenuBuilder } from "@/components/sitemanager/MenuBuilder";
import { MenuPreview } from "@/components/sitemanager/MenuPreview";
import { MenuItemModal } from "@/components/sitemanager/MenuItemModal";
import { buildTree, flattenTree, type MenuItem } from "@/components/sitemanager/menu-types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Location = "header" | "footer" | "social";

const LOCATIONS: { id: Location; label: string; desc: string }[] = [
  { id: "header", label: "Header Menu", desc: "Primary navigation shown in the site header" },
  { id: "footer", label: "Footer Menu", desc: "Quick links shown in the site footer" },
  { id: "social", label: "Social Links", desc: "Social media icons in the footer" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MenuBuilderPage() {
  const { toast } = useToast();
  const [location, setLocation] = useState<Location>("header");
  const [flatItems, setFlatItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"build" | "preview">("build");
  const [resetOpen, setResetOpen] = useState(false);

  // Left sidebar
  const [pageSearch, setPageSearch] = useState("");
  const [publishedPages, setPublished] = useState<{ id: string; title: string; slug: string }[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [modalParent, setModalParent] = useState<string | null>(null);

  // Custom link form
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // ── Load items ──────────────────────────────────────────────────────────────
  const load = useCallback(async (loc: Location) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sitemanager/menu?location=${loc}`);
      const json = await res.json();
      setFlatItems(json.items ?? []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load menu." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(location); }, [location, load]);

  // Load published pages once
  useEffect(() => {
    fetch("/api/sitemanager/pages?limit=200&sort=az&status=published")
      .then(r => r.ok ? r.json() : null)
      .then(d => setPublished(d?.pages ?? []))
      .catch(() => { });
  }, []);

  // ── Tree derived from flat ──────────────────────────────────────────────────
  const tree = buildTree(flatItems);

  const applyTree = (newTree: MenuItem[]) => {
    setFlatItems(flattenTree(newTree));
    setSaved(false);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/sitemanager/menu/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, items: flatItems }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      toast({ title: "Menu saved!", description: `${flatItems.length} items saved for ${location} menu.` });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ variant: "destructive", title: "Failed to save menu." });
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    try {
      const res = await fetch("/api/sitemanager/menu/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Menu reset to defaults." });
      load(location);
    } catch {
      toast({ variant: "destructive", title: "Reset failed." });
    }
  };

  // ── Add page from sidebar ───────────────────────────────────────────────────
  const addPage = (page: { title: string; slug: string }) => {
    const newItem: MenuItem = {
      id: `new-${crypto.randomUUID()}`,
      label: page.title,
      url: `/${page.slug}`,
      parentId: null,
      order: flatItems.filter(i => !i.parentId).length,
      isOpenInNew: false,
      isVisible: true,
      menuType: location,
    };
    setFlatItems(prev => [...prev, newItem]);
    setSaved(false);
    toast({ title: `"${page.title}" added to menu.` });
  };

  // ── Add custom link ─────────────────────────────────────────────────────────
  const addCustomLink = () => {
    if (!customLabel.trim()) return;
    const newItem: MenuItem = {
      id: `new-${crypto.randomUUID()}`,
      label: customLabel.trim(),
      url: customUrl.trim() || null,
      parentId: null,
      order: flatItems.filter(i => !i.parentId).length,
      isOpenInNew: customUrl.startsWith("http"),
      isVisible: true,
      menuType: location,
    };
    setFlatItems(prev => [...prev, newItem]);
    setCustomLabel("");
    setCustomUrl("");
    setSaved(false);
  };

  // ── Modal save ──────────────────────────────────────────────────────────────
  const handleModalSave = (data: Partial<MenuItem>) => {
    if (editTarget?.id) {
      // Update existing
      setFlatItems(prev => prev.map(i =>
        i.id === editTarget.id ? { ...i, ...data } : i
      ));
    } else {
      // Add new
      const newItem: MenuItem = {
        id: `new-${crypto.randomUUID()}`,
        label: data.label!,
        url: data.url ?? null,
        parentId: modalParent ?? null,
        order: flatItems.filter(i => i.parentId === (modalParent ?? null)).length,
        isOpenInNew: data.isOpenInNew ?? false,
        isVisible: data.isVisible ?? true,
        menuType: location,
      };
      setFlatItems(prev => [...prev, newItem]);
    }
    setSaved(false);
    setEditTarget(null);
    setModalParent(null);
  };

  const filteredPages = publishedPages.filter(p =>
    !pageSearch || p.title.toLowerCase().includes(pageSearch.toLowerCase())
  );

  const alreadyAdded = new Set(flatItems.map(i => i.url));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 max-w-7xl"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Header</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Drag items to reorder · Nest up to 3 levels deep</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm"
            onClick={() => setView(v => v === "build" ? "preview" : "build")}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {view === "build" ? "Preview" : "Edit"}
          </Button>
          {location === "header" && (
            <ConfirmDialog
              title="Reset to default menu?"
              description="This will overwrite the current header menu with the default tanzeem.org structure."
              onConfirm={handleReset}
              open={resetOpen}
              onOpenChange={setResetOpen}
            >
              <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset
              </Button>
            </ConfirmDialog>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[110px]">
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
            ) : saved ? (
              <><Check className="h-3.5 w-3.5 mr-1.5" />Saved!</>
            ) : (
              <><Save className="h-3.5 w-3.5 mr-1.5" />Save Menu</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Location tabs ── */}
      <Tabs value={location} onValueChange={v => setLocation(v as Location)} variant="bubble">
        <TabsList>
          {LOCATIONS.map(l => (
            <TabsTrigger key={l.id} value={l.id} className="gap-2">
              {l.label}
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {flatItems.filter(i => i.menuType === l.id || location === l.id).length > 0 || location === l.id
                  ? flatItems.length : "—"}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCATIONS.map(l => (
          <TabsContent key={l.id} value={l.id} className="mt-5">
            <p className="text-xs text-muted-foreground mb-4">{l.desc}</p>

            {view === "preview" ? (
              <MenuPreview items={flatItems} />
            ) : (
              <div className="grid lg:grid-cols-[300px_1fr] gap-6">

                {/* ── Left sidebar ── */}
                <div className="space-y-4">

                  {/* Pages */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Pages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search pages…"
                          className="pl-8 h-8 text-xs"
                          value={pageSearch}
                          onChange={e => setPageSearch(e.target.value)}
                        />
                        {pageSearch && (
                          <button onClick={() => setPageSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                        {filteredPages.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No pages found</p>
                        ) : filteredPages.map(page => {
                          const added = alreadyAdded.has(`/${page.slug}`);
                          return (
                            <button
                              key={page.id}
                              onClick={() => !added && addPage(page)}
                              disabled={added}
                              className={cn(
                                "w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-xs transition-colors",
                                added
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                              )}
                            >
                              <span className="truncate">{page.title}</span>
                              {added
                                ? <Check className="h-3 w-3 text-green-500 shrink-0" />
                                : <Plus className="h-3 w-3 text-muted-foreground shrink-0" />
                              }
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom link */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        Custom Link
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <Input
                        placeholder="Label *"
                        className="h-8 text-xs"
                        value={customLabel}
                        onChange={e => setCustomLabel(e.target.value)}
                      />
                      <Input
                        placeholder="URL (/ or https://…)"
                        className="h-8 text-xs"
                        value={customUrl}
                        onChange={e => setCustomUrl(e.target.value)}
                      />
                      <Button
                        size="sm" className="w-full h-8 text-xs"
                        disabled={!customLabel.trim()}
                        onClick={addCustomLink}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />Add to Menu
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Add blank item */}
                  <Button
                    variant="outline" size="sm" className="w-full"
                    onClick={() => { setEditTarget(null); setModalParent(null); setModalOpen(true); }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Item (Modal)
                  </Button>
                </div>

                {/* ── Right panel — menu tree ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {flatItems.length} item{flatItems.length !== 1 ? "s" : ""} · drag to reorder
                    </p>
                  </div>

                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-lg" style={{ marginLeft: i % 3 === 0 ? 0 : i % 3 === 1 ? 28 : 56 }}>
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 flex-1 max-w-[200px]" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <MenuBuilder
                      items={flatItems}
                      onChange={newFlat => { setFlatItems(newFlat); setSaved(false); }}
                      onEditItem={(item, parentId) => {
                        setEditTarget(item);
                        setModalParent(parentId ?? null);
                        setModalOpen(true);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Item modal ── */}
      <MenuItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); setModalParent(null); }}
        onSave={handleModalSave}
        initial={editTarget}
        allItems={flatItems}
      />
    </motion.div>
  );
}
