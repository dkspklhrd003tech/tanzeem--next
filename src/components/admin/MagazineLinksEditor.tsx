"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, XCircle, Edit2, GripVertical, Save, ArrowLeft, ExternalLink, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PdfUploader } from "./PdfUploader";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface MagazineLink {
  id: string;
  title: string;
  slug?: string;
  url: string;
  isActive: boolean;
  isNew?: boolean;
}

interface SortableLinkItemProps {
  link: MagazineLink;
  onEdit: (link: MagazineLink) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onToggleNew: (id: string, isNew: boolean) => void;
}

function SortableLinkItem({ link, onEdit, onDelete, onToggleActive, onToggleNew }: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm mb-3">
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-2 rounded text-muted-foreground transition-colors touch-none">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate text-primary">{link.title}</h4>
          {link.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white tracking-wide shrink-0">
              NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground truncate max-w-md">{link.url}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs cursor-pointer text-[#222222]">New Tab</Label>
          <Switch
            checked={!!link.isNew}
            onCheckedChange={(c) => onToggleNew(link.id, c)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", link.isActive ? "text-green-500 hover:bg-primary/10 hover:text-green-600" : "text-red-500 hover:bg-red-500/10 hover:text-red-600")} onClick={() => onToggleActive(link.id, !link.isActive)} title={link.isActive ? "Hide from frontend" : "Show on frontend"}>
            {link.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary hover:text-white" onClick={() => onEdit(link)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white" onClick={() => onDelete(link.id)}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MagazineLinksEditor({ pageId, title }: { pageId: string, title: string }) {
  const [links, setLinks] = useState<MagazineLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [editingLink, setEditingLink] = useState<MagazineLink | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [linkType, setLinkType] = useState<"url" | "pdf">("pdf");

  const settingsKey = `magazine_links_${pageId}`;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const val = data?.settings?.magazine_links?.[settingsKey];
        if (val) {
          try {
            setLinks(JSON.parse(val));
          } catch {
            setLinks([]);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [settingsKey]);

  const saveToDb = async (newLinks: MagazineLink[]) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { [settingsKey]: JSON.stringify(newLinks) },
          group: "magazine_links"
        })
      });
      if (res.ok) {
        toast({ title: "Saved Successfully!" });
      } else {
        toast({ variant: "destructive", title: "Failed to save" });
      }
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    }
    setIsSaving(false);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        saveToDb(reordered);
        return reordered;
      });
    }
  };

  const handleAddOrUpdate = () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast({ variant: "destructive", title: "Title and URL/PDF are required" });
      return;
    }

    let updated: MagazineLink[];
    if (editingLink) {
      updated = links.map(l => l.id === editingLink.id ? { ...l, title: newTitle, slug: newSlug || slugify(newTitle), url: newUrl } : l);
      setEditingLink(null);
    } else {
      updated = [{ id: crypto.randomUUID(), title: newTitle, slug: newSlug || slugify(newTitle), url: newUrl, isActive: true }, ...links];
    }
    setLinks(updated);
    setNewTitle("");
    setNewSlug("");
    setNewUrl("");
    saveToDb(updated);
  };

  const handleEdit = (link: MagazineLink) => {
    setEditingLink(link);
    setNewTitle(link.title);
    setNewSlug(link.slug || slugify(link.title));
    setNewUrl(link.url);
    setLinkType(link.url.endsWith(".pdf") ? "pdf" : "url");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      const updated = links.filter(l => l.id !== id);
      setLinks(updated);
      saveToDb(updated);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    const updated = links.map(l => l.id === id ? { ...l, isActive: active } : l);
    setLinks(updated);
    saveToDb(updated);
  };

  const handleToggleNew = (id: string, isNew: boolean) => {
    const updated = links.map(l => l.id === id ? { ...l, isNew } : l);
    setLinks(updated);
    saveToDb(updated);
  };

  if (isLoading) {
    return <div className="p-8 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sitemanager/pages"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">Manage the links to be displayed on this page</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {editingLink ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingLink ? "Edit Link" : "Add New Link"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input placeholder="e.g. 06 MESSAQ | June - 2026" value={newTitle} onChange={e => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }} />
            </div>
            <div>
              <Label className="mb-1.5 block">Slug</Label>
              <Input placeholder="e.g. 06-meesaq-june-2026" value={newSlug} onChange={e => setNewSlug(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <Label className="mb-1.5 block">Link Source</Label>
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit mb-3">
                <button
                  type="button"
                  onClick={() => setLinkType("pdf")}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", linkType === "pdf" ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setLinkType("url")}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", linkType === "url" ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                  External URL
                </button>
              </div>

              {linkType === "url" ? (
                <Input placeholder="e.g. https://meesaq.tanzeemdigitallibrary.com/..." value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              ) : (
                <PdfUploader value={newUrl} onChange={setNewUrl} />
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddOrUpdate} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? "Saving..." : editingLink ? "Update Magazine" : "Add Magazine"}
            </Button>
            {editingLink && (
              <Button variant="outline" onClick={() => { setEditingLink(null); setNewTitle(""); setNewUrl(""); }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Existing Links</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Drag to Reorder</p>
          </div>
          <div className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
            {links.length} Magazine(s)
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">No Magazines Added.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {links.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onToggleNew={handleToggleNew}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


