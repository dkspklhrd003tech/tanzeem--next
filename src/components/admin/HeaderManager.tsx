"use client";

import { useState, useEffect, useCallback } from "react";
import { mutate } from "swr";
import {
  LayoutTemplate, Plus, Trash2, GripVertical,
  ChevronDown, ChevronRight, Check, ExternalLink,
  Save, RotateCcw, Eye,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, verticalListSortingStrategy,
  sortableKeyboardCoordinates, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  order: number;
  isOpenInNew: boolean;
  isVisible: boolean;
  menuType: string;
  children?: MenuItem[];
}

interface HeaderSettings {
  header_logo: string;
  site_name: string;
  header_cta_text: string;
  header_cta_url: string;
  header_show_search: string;
  header_show_date: string;
  youtube_url: string;
  facebook_url: string;
  twitter_url: string;
  whatsapp_url: string;
  instagram_url: string;
  telegram_url: string;
  [key: string]: string;
}

const DEFAULTS: HeaderSettings = {
  header_logo: "",
  site_name: "Tanzeem-e-Islami",
  header_cta_text: "Join Tanzeem",
  header_cta_url: "/join",
  header_show_search: "true",
  header_show_date: "true",
  youtube_url: "",
  facebook_url: "",
  twitter_url: "",
  whatsapp_url: "",
  instagram_url: "",
  telegram_url: "",
};

// ── Sortable menu row ─────────────────────────────────────────────────────────
function SortableMenuRow({
  item,
  depth,
  allItems,
  onEdit,
  onDelete,
  onAddChild,
  editingItem,
  MenuItemFormRender,
  savingItem,
  saveMenuItem,
  setEditingItem,
  parentOptions,
}: {
  item: MenuItem;
  depth: number;
  allItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  editingItem: Partial<MenuItem> | null;
  MenuItemFormRender: any;
  savingItem: boolean;
  saveMenuItem: any;
  setEditingItem: any;
  parentOptions: (MenuItem & { depth?: number })[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style, marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors group",
          depth > 0 && "border-l-2 border-l-primary/20"
        )}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Indent marker */}
        {depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}

        {/* Label */}
        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {item.label}
        </span>

        {/* URL */}
        <span className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[120px]">
          {item.url || "—"}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {!item.isVisible && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">Hidden</Badge>
          )}
          {item.isOpenInNew && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
          {hasChildren && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
              {item.children!.length} sub
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(item.id)}
            className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Add submenu item"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <ConfirmDialog
            title="Delete menu item?"
            description={`"${item.label}" ${hasChildren ? `and its ${item.children!.length} sub-item(s) ` : ""}will be permanently removed.`}
            onConfirm={() => onDelete(item.id)}
          >
            <button
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </ConfirmDialog>
        </div>
      </div>
      
      {/* Inline Editor */}
      {editingItem && editingItem.id === item.id && (
        <div 
          className="mt-2 mb-4 animate-in fade-in slide-in-from-top-2"
          style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
        >
          <MenuItemFormRender
            item={editingItem}
            parentOptions={parentOptions}
            onSave={saveMenuItem}
            onCancel={() => setEditingItem(null)}
            isSaving={savingItem}
          />
        </div>
      )}

      {/* Render children */}
      {(item.children ?? []).map((child) => (
        <SortableMenuRow
          key={child.id}
          item={child}
          depth={depth + 1}
          allItems={allItems}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          editingItem={editingItem}
          MenuItemFormRender={MenuItemFormRender}
          savingItem={savingItem}
          saveMenuItem={saveMenuItem}
          setEditingItem={setEditingItem}
          parentOptions={parentOptions}
        />
      ))}
    </>
  );
}

// ── MenuItem edit form ────────────────────────────────────────────────────────
function MenuItemForm({
  item,
  parentOptions,
  onSave,
  onCancel,
  isSaving,
}: {
  item: Partial<MenuItem>;
  parentOptions: (MenuItem & { depth?: number })[];
  onSave: (data: Partial<MenuItem>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<MenuItem>>(item);
  const [pages, setPages] = useState<{ id: string, title: string, slug: string }[]>([]);

  useEffect(() => {
    fetch("/api/pages").then(r => r.json()).then(d => {
      if (d.pages) setPages(d.pages);
    }).catch(() => { });
  }, []);

  const set = (k: keyof MenuItem, v: any) => setForm((p) => ({ ...p, [k]: v }));

  function validateUrl(url: string) {
    if (!url) return true;
    return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
  }

  const urlValid = validateUrl(form.url ?? "");

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">
        {form.id ? "Edit Menu Item" : "New Menu Item"}
      </h3>

      <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 space-y-1.5">
        <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Quick Link to Existing Page
        </Label>
        <select
          className="w-full h-9 px-3 rounded-md border border-primary/30 text-sm bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          onChange={(e) => {
            const p = pages.find(x => x.id === e.target.value);
            if (p) {
              setForm(prev => ({
                ...prev,
                label: p.title,
                url: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
                isOpenInNew: false
              }));
            }
            e.target.value = ""; // Reset after selection
          }}
        >
          <option value="">— Select a Page to auto-fill —</option>
          {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <p className="text-[10px] text-muted-foreground mt-1">Selecting a page will auto-fill the Label and URL below. If the page URL changes later, this link will update automatically.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Label *</Label>
          <Input
            value={form.label ?? ""}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Organization"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">URL</Label>
          <Input
            value={form.url ?? ""}
            onChange={(e) => {
              const newUrl = e.target.value;
              const isExt = newUrl.startsWith("http://") || newUrl.startsWith("https://");
              setForm(p => ({
                ...p,
                url: newUrl,
                isOpenInNew: isExt
              }));
            }}
            placeholder="/organization or https://..."
            className={cn(!urlValid && "border-destructive")}
          />
          {!urlValid && (
            <p className="text-[10px] text-destructive">URL must start with / or http(s)://</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Parent item (for sub-menus)</Label>
          <select
            value={form.parentId ?? ""}
            onChange={(e) => set("parentId", e.target.value || null)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Top level —</option>
            {parentOptions
              .filter((p) => p.id !== form.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.depth ? "—".repeat(p.depth) + " " : ""}{p.label}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs cursor-pointer" htmlFor="mi-visible">Visible</Label>
            <Switch
              id="mi-visible"
              checked={form.isVisible !== false}
              onCheckedChange={(v) => set("isVisible", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs cursor-pointer" htmlFor="mi-new-tab">Open in new tab</Label>
            <Switch
              id="mi-new-tab"
              checked={!!form.isOpenInNew}
              onCheckedChange={(v) => set("isOpenInNew", v)}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => onSave(form)}
          disabled={!form.label?.trim() || !urlValid || isSaving}
          className="bg-primary text-primary-foreground"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isSaving ? "Saving…" : "Save Item"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Main HeaderManager ────────────────────────────────────────────────────────
export function HeaderManager() {
  const { toast } = useToast();

  // Settings state
  const [form, setForm] = useState<HeaderSettings>(DEFAULTS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Menu state
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [flatMenu, setFlatMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch header settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings/header");
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, ...data.settings }));
      }
    } catch { }
    finally { setLoadingSettings(false); }
  }, []);

  // Fetch main menu
  const fetchMenu = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const [treeRes, flatRes] = await Promise.all([
        fetch("/api/menus?hierarchy=true&menuType=main"),
        fetch("/api/menus?menuType=main"),
      ]);
      if (treeRes.ok) setMenuTree((await treeRes.json()).menus ?? []);
      if (flatRes.ok) setFlatMenu((await flatRes.json()).menus ?? []);
    } catch { }
    finally { setLoadingMenu(false); }
  }, []);

  useEffect(() => { fetchSettings(); fetchMenu(); }, []);

  const set = (k: keyof HeaderSettings, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      toast({ title: "Header settings saved." });
      mutate("/api/settings");
      fetchSettings();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveMenuItem(data: Partial<MenuItem>) {
    setSavingItem(true);
    try {
      const isNew = !data.id;
      const url = isNew ? "/api/menus" : `/api/menus/${data.id}`;
      const payload = { ...data, menuType: "main", order: data.order ?? flatMenu.length };
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save item");
      toast({ title: `Menu item ${isNew ? "created" : "updated"}.` });
      setEditingItem(null);
      fetchMenu();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally {
      setSavingItem(false);
    }
  }

  async function deleteMenuItem(id: string) {
    try {
      const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Menu item deleted." });
      fetchMenu();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    if (!active) return;

    setMenuTree((prev) => {
      const flat = flattenTree(prev);
      const oi = flat.findIndex((x) => x.id === active.id);
      if (oi === -1) return prev;
      
      const ni = over ? flat.findIndex((x) => x.id === over.id) : oi;
      let reordered = arrayMove(flat, oi, ni);
      const item = reordered[ni];
      let newParentId = item.parentId;

      // Smart hierarchy resolution based on drop position and horizontal drag
      if (ni === 0) {
        newParentId = null; // Forced to root if at the very top
      } else {
        const prevItem = reordered[ni - 1];
        
        if (delta.x > 30) {
          // Indent: become child of the item directly above
          if (prevItem.id !== item.id) {
            newParentId = prevItem.id;
          }
        } else if (delta.x < -30) {
          // Outdent: become sibling of prevItem's parent
          if (prevItem.parentId) {
            const prevItemParent = flat.find(x => x.id === prevItem.parentId);
            newParentId = prevItemParent ? prevItemParent.parentId : null;
          } else {
            newParentId = null;
          }
        } else {
          // Same level (vertical drag): become sibling of the item directly above
          newParentId = prevItem.parentId;
        }
      }

      // Prevent cyclic dependencies (cannot make a parent a child of its own child)
      const isDescendant = (childId: string | null, parentId: string): boolean => {
        if (!childId) return false;
        if (childId === parentId) return true;
        const child = flat.find(x => x.id === childId);
        return child ? isDescendant(child.parentId, parentId) : false;
      };

      if (isDescendant(newParentId, item.id)) {
        newParentId = item.parentId; // Revert to safe parent
      }

      let parentChanged = false;
      if (newParentId !== item.parentId) {
        item.parentId = newParentId;
        parentChanged = true;
      }

      // Re-assign sequential order
      reordered = reordered.map((it, idx) => ({ ...it, order: idx }));

      // Persist changes
      reordered.forEach((it) => {
        const payload: any = { order: it.order };
        if (parentChanged && it.id === item.id) {
          payload.parentId = it.parentId;
        }
        fetch(`/api/menus/${it.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      });
      
      return buildTree(reordered);
    });
  }

  // Helpers
  function flattenTree(tree: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    const walk = (items: MenuItem[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children) walk(item.children);
      }
    };
    walk(tree);
    return result;
  }

  function buildTree(flat: MenuItem[]): MenuItem[] {
    const map: Record<string, MenuItem & { children: MenuItem[] }> = {};
    flat.forEach((item) => (map[item.id] = { ...item, children: [] }));
    const roots: MenuItem[] = [];
    flat.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  }

  const generateParentOptions = (items: MenuItem[], depth = 0): (MenuItem & { depth?: number })[] => {
    const result: (MenuItem & { depth?: number })[] = [];
    for (const item of items) {
      result.push({ ...item, depth });
      if (item.children && depth < 2) { // Allow up to depth 2 (level 3 parent)
        result.push(...generateParentOptions(item.children, depth + 1));
      }
    }
    return result;
  };
  
  const parentOptions = generateParentOptions(menuTree);

  return (
    <div className="space-y-8">

      {/* ── Logo + Identity ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            Logo &amp; Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide">Site Logo</Label>
              <ImageUploader
                value={form.header_logo}
                onChange={(url) => set("header_logo", url)}
                aspectRatio={2}
              />
              <p className="text-[10px] text-muted-foreground">Recommended: SVG or WEBP, transparent bg</p>
            </div>
            <div className="flex-1 space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs">Site Name (text fallback)</Label>
                <Input
                  value={form.site_name}
                  onChange={(e) => set("site_name", e.target.value)}
                  placeholder="Tanzeem-e-Islami"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Navigation Header ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Navigation Menu
              <Badge variant="outline" className="text-[10px]">Main</Badge>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingItem({ menuType: "main", isVisible: true, isOpenInNew: false, parentId: null })}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Edit form for NEW items */}
          {editingItem && !editingItem.id && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2">
              <MenuItemForm
                item={editingItem}
                parentOptions={parentOptions}
                onSave={saveMenuItem}
                onCancel={() => setEditingItem(null)}
                isSaving={savingItem}
              />
            </div>
          )}

          {/* Draggable tree */}
          {loadingMenu ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : menuTree.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">No menu items yet.</p>
              <button
                onClick={() => setEditingItem({ menuType: "main", isVisible: true, isOpenInNew: false, parentId: null })}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Add your first item →
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={flattenTree(menuTree).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {menuTree.map((item) => (
                    <SortableMenuRow
                      key={item.id}
                      item={item}
                      depth={0}
                      allItems={flatMenu}
                      onEdit={(it) => setEditingItem(it)}
                      onDelete={deleteMenuItem}
                      onAddChild={(pid) => setEditingItem({ menuType: "main", parentId: pid, isVisible: true, isOpenInNew: false })}
                      editingItem={editingItem}
                      MenuItemFormRender={MenuItemForm}
                      savingItem={savingItem}
                      saveMenuItem={saveMenuItem}
                      setEditingItem={setEditingItem}
                      parentOptions={parentOptions}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <p className="text-[10px] text-muted-foreground pt-1">
            Drag rows to reorder. Click + on any item to add a submenu entry (2+ levels supported).
          </p>
        </CardContent>
      </Card>

      {/* ── Toggles ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visibility Toggles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">Search Bar</p>
              <p className="text-xs text-muted-foreground">Show the search input in the header</p>
            </div>
            <Switch
              checked={form.header_show_search === "true"}
              onCheckedChange={(v) => set("header_show_search", v ? "true" : "false")}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Date Display</p>
              <p className="text-xs text-muted-foreground">Show Gregorian &amp; Hijri date bar</p>
            </div>
            <Switch
              checked={form.header_show_date === "true"}
              onCheckedChange={(v) => set("header_show_date", v ? "true" : "false")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Social URLs ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Social Media Links (Top Bar)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "youtube_url", label: "YouTube URL" },
              { key: "facebook_url", label: "Facebook URL" },
              { key: "twitter_url", label: "X (Twitter) URL" },
              { key: "whatsapp_url", label: "WhatsApp URL" },
              { key: "instagram_url", label: "Instagram URL" },
              { key: "telegram_url", label: "Telegram URL" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Input
                  value={form[key] ?? ""}
                  onChange={(e) => set(key as keyof HeaderSettings, e.target.value)}
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <ConfirmDialog
          title="Save Header"
          description="This will update the site header immediately for all visitors."
          onConfirm={saveSettings}
        >
          <Button
            disabled={savingSettings}
            className="bg-primary text-primary-foreground rounded-full px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {savingSettings ? "Saving…" : "Save Header"}
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
}
