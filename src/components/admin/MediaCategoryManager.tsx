"use client";

import React, { useState, useRef } from "react";
import { Plus, XCircle, Edit, Video, Headphones, Image as ImageIcon, X, UploadCloud, RefreshCw, PlayCircle, Share2, Download, Eye, EyeOff, Sparkles, Trash2 } from "lucide-react";
import { BulkPlaylistModal, ParsedVideoItem } from "./BulkPlaylistModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUploader } from "./ImageUploader";
import { AudioUploader } from "./AudioUploader";
import { toast } from "sonner";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { CustomFieldBuilder } from "./CustomFieldBuilder";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { parseVideoInput } from "@/lib/video-parser";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  image?: string;
  description?: string;
  code?: string;
  slug?: string;
  tags?: string;
  isPublished?: boolean;
  customFields?: any;
  viewCount?: number;
  playCount?: number;
  shareCount?: number;
  downloadCount?: number;
}

interface SubCategory {
  id: string;
  title: string;
  image?: string;
  code?: string;
  slug?: string;
  order?: number;
  isPublished?: boolean;
  customFields?: any;
  mediaItems: MediaItem[];
}

interface MainCategory {
  id: string;
  title: string;
  slug?: string;
  code?: string;
  image?: string;
  order?: number;
  isPublished?: boolean;
  customFields?: any;
  subCategories: SubCategory[];
}

interface MediaCategoryManagerProps {
  mediaType: "audio" | "video";
}

function SortableCategoryCard({ cat, mediaType, isSelected, onToggleSelect, onClick, onEdit, onTogglePublish, onDelete }: { cat: MainCategory, mediaType: string, isSelected?: boolean, onToggleSelect?: (selected: boolean) => void, onClick: () => void, onEdit: (c: MainCategory) => void, onTogglePublish: (c: MainCategory) => void, onDelete: (c: MainCategory) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card border rounded-xl overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md",
        isSelected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-1.5 bg-background/80 backdrop-blur rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground">
        <GripVertical className="w-4 h-4" />
      </div>
      {onToggleSelect && (
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => onToggleSelect(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer rounded shadow-sm"
            title="Select category"
          />
        </div>
      )}
      {mediaType === "video" && (
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          {cat.image ? (
            <img src={resolveMediaUrl(cat.image)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={cat.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-10 h-10 opacity-20" /></div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">View Sub-categories</span>
          </div>
        </div>
      )}
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 pr-1">
          <h5 className="font-bold text-foreground text-lg truncate" title={cat.title}>{cat.code ? `${cat.code} | ` : ""}{cat.title}</h5>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              {cat.subCategories?.filter(s => !s.id.endsWith("_direct")).length || 0} Sub-categories
            </Badge>
            {cat.subCategories?.find(s => s.id.endsWith("_direct")) && (
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/20">
                {cat.subCategories.find(s => s.id.endsWith("_direct"))?.mediaItems?.length || 0} {mediaType === "audio" ? "Direct Audios" : "Direct Videos"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:text-white z-10" onClick={(e) => { e.stopPropagation(); onEdit(cat); }} title="Edit Details">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 z-10", cat.isPublished !== false ? "text-blue-600 hover:text-blue-600 hover:bg-blue-600/20" : "text-red-600 hover:bg-red-500/10")}
            onClick={(e) => { e.stopPropagation(); onTogglePublish(cat); }}
            title={cat.isPublished !== false ? "Hide from frontend" : "Show on frontend"}
          >
            {cat.isPublished !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive z-10" onClick={(e) => { e.stopPropagation(); onDelete(cat); }} title="Delete Category">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableSubCatCard({ sub, mediaType, isSelected, onToggleSelect, onClick, onEdit, onTogglePublish, onDelete }: { sub: any, mediaType: string, isSelected?: boolean, onToggleSelect?: (selected: boolean) => void, onClick: () => void, onEdit: () => void, onTogglePublish?: (sub: any) => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group border rounded-xl overflow-hidden bg-card transition-all shadow-sm cursor-pointer hover:shadow-md flex flex-col",
        isSelected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/80 hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-1.5 bg-background/80 backdrop-blur rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground">
        <GripVertical className="w-4 h-4" />
      </div>
      {onToggleSelect && (
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => onToggleSelect(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer rounded shadow-sm"
            title="Select sub-category"
          />
        </div>
      )}
      {mediaType === "video" && (
        <div className="aspect-[8/5] bg-muted relative overflow-hidden">
          {sub.image ? (
            <img src={resolveMediaUrl(sub.image)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={sub.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-8 h-8 opacity-20" /></div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-xs">Manage Content</span>
          </div>
        </div>
      )}
      <div className="p-4 flex items-center justify-between gap-2 flex-1">
        <div className="flex-1 min-w-0 pr-1">
          <h5 className="font-bold text-foreground truncate" title={sub.title}>{sub.code ? `${sub.code} | ` : ""}{sub.title}</h5>
          <div className="mt-1">
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              {sub.mediaItems?.length || 0} {mediaType === "audio" ? "Audios" : "Videos"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary z-10" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit Details">
            <Edit className="w-4 h-4" />
          </Button>
          {onTogglePublish && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 z-10", sub.isPublished !== false ? "text-blue-600 hover:text-blue-600 hover:bg-blue-600/20" : "text-red-600 hover:bg-red-500/10")}
              onClick={(e) => { e.stopPropagation(); onTogglePublish(sub); }}
              title={sub.isPublished !== false ? "Hide from frontend" : "Show on frontend"}
            >
              {sub.isPublished !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 bg-destructive/10 hover:bg-destructive hover:text-white z-10" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete Sub-category">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableDirectVideoCard({ item, mediaType, isSelected, onToggleSelect, onClick, onEdit, onTogglePublish, onDelete }: { item: any, mediaType: string, isSelected?: boolean, onToggleSelect?: (selected: boolean) => void, onClick: () => void, onEdit?: () => void, onTogglePublish?: (item: any) => void, onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };

  let thumb = item.thumbnailUrl || item.image || item.customFields?.thumbnailUrl || "";
  if (!thumb) {
    const url = item.embedUrl || item.mediaUrl || "";
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group border rounded-xl overflow-hidden bg-card transition-all shadow-sm cursor-pointer hover:shadow-md flex flex-col",
        isSelected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/80 hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-1.5 bg-background/80 backdrop-blur rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:bg-background transition-colors text-muted-foreground">
        <GripVertical className="w-4 h-4" />
      </div>
      {onToggleSelect && (
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => onToggleSelect(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer rounded shadow-sm"
            title="Select item"
          />
        </div>
      )}
      {mediaType === "video" && (
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumb ? (
            <img src={thumb} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Video className="w-8 h-8 opacity-20" /></div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-xs">Edit Video</span>
          </div>
        </div>
      )}
      <div className="p-4 flex items-center justify-between gap-2 flex-1">
        <div className="flex-1 min-w-0 pr-1">
          <h5 className="font-bold text-foreground truncate" title={item.title}>{item.code ? `${item.code} | ` : ""}{item.title}</h5>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50" title="Plays">
              <PlayCircle className="w-3 h-3" /> {item.playCount || 0}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50" title="Downloads">
              <Download className="w-3 h-3" /> {item.downloadCount || 0}
            </span>
            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/50" title="Shares">
              <Share2 className="w-3 h-3" /> {item.shareCount || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary z-10"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              title="Edit Title / Details"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onTogglePublish && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 z-10", item.isPublished !== false ? "text-blue-600 hover:text-blue-600 hover:bg-blue-600/20" : "text-red-600 hover:bg-red-500/10")}
              onClick={(e) => { e.stopPropagation(); onTogglePublish(item); }}
              title={item.isPublished !== false ? "Hide from frontend" : "Show on frontend"}
            >
              {item.isPublished !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive shrink-0 bg-destructive/10 hover:bg-destructive hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete Item"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaCategoryManager({ mediaType }: MediaCategoryManagerProps) {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<string>("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTargetSubId, setBulkTargetSubId] = useState<string>("");

  // Pending Action State for ConfirmDialog
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    desc: string;
    action: () => Promise<void>;
  } | null>(null);

  // Bulk Sub-Category Modal State
  const [isBulkSubCatModalOpen, setIsBulkSubCatModalOpen] = useState(false);
  const [bulkSubCatInput, setBulkSubCatInput] = useState("");
  const [bulkSubCatPrefix, setBulkSubCatPrefix] = useState("");
  const [isCreatingSubCats, setIsCreatingSubCats] = useState(false);

  // Bulk Selection States
  const [selectedMainCatIds, setSelectedMainCatIds] = useState<string[]>([]);
  const [selectedSubCatIds, setSelectedSubCatIds] = useState<string[]>([]);
  const [selectedDirectMediaIds, setSelectedDirectMediaIds] = useState<string[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const toggleSelectMainCat = (id: string) => {
    setSelectedMainCatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectSubCat = (id: string) => {
    setSelectedSubCatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectDirectMedia = (id: string) => {
    setSelectedDirectMediaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectMedia = (id: string) => {
    setSelectedMediaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDeleteMainCategories = async () => {
    if (selectedMainCatIds.length === 0) return;
    const count = selectedMainCatIds.length;
    setPendingAction({
      title: "Delete Selected Categories",
      desc: `Are you sure you want to delete ${count} selected category/categories and all their contents?`,
      action: async () => {
        try {
          await Promise.all(
            selectedMainCatIds.map(id => fetch(`/api/${mediaType}-categories/${id}`, { method: "DELETE" }))
          );
          setCategories(prev => prev.filter(c => !selectedMainCatIds.includes(c.id)));
          setSelectedMainCatIds([]);
          toast.success(`Successfully deleted ${count} category/categories`);
        } catch (err) {
          toast.error("Failed to delete selected categories");
        }
      }
    });
  };

  const bulkDeleteSubCategories = async () => {
    if (!activeCategory || selectedSubCatIds.length === 0) return;
    const count = selectedSubCatIds.length;
    setPendingAction({
      title: "Delete Selected Sub-categories",
      desc: `Are you sure you want to delete ${count} selected sub-category/categories?`,
      action: async () => {
        try {
          await Promise.all(
            selectedSubCatIds.map(id => fetch(`/api/${mediaType}-categories/${id}`, { method: "DELETE" }))
          );
          setCategories(prev => prev.map(c => c.id === activeCategory.id ? {
            ...c,
            subCategories: c.subCategories.filter(s => !selectedSubCatIds.includes(s.id))
          } : c));
          setSelectedSubCatIds([]);
          toast.success(`Successfully deleted ${count} sub-category/categories`);
        } catch (err) {
          toast.error("Failed to delete selected sub-categories");
        }
      }
    });
  };

  const bulkDeleteDirectMediaItems = async () => {
    if (!activeCategory || selectedDirectMediaIds.length === 0) return;
    const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'));
    if (!directSub) return;
    const count = selectedDirectMediaIds.length;
    const endpointBase = mediaType === 'audio' ? '/api/audio' : '/api/videos';

    setPendingAction({
      title: "Delete Selected Direct Videos",
      desc: `Are you sure you want to delete ${count} selected direct video(s)?`,
      action: async () => {
        try {
          await Promise.all(
            selectedDirectMediaIds.map(id => fetch(`${endpointBase}/${id}`, { method: "DELETE" }))
          );
          setCategories(prev => prev.map(c => c.id === activeCategory.id ? {
            ...c,
            subCategories: c.subCategories.map(s => s.id === directSub.id ? {
              ...s,
              mediaItems: s.mediaItems.filter(m => !selectedDirectMediaIds.includes(m.id))
            } : s)
          } : c));
          setSelectedDirectMediaIds([]);
          toast.success(`Successfully deleted ${count} video(s)`);
        } catch (err) {
          toast.error("Failed to delete selected videos");
        }
      }
    });
  };

  const bulkDeleteMediaItems = async () => {
    if (!activeCategory || !activeSubTab || selectedMediaIds.length === 0) return;
    const count = selectedMediaIds.length;
    const endpointBase = mediaType === 'audio' ? '/api/audio' : '/api/videos';

    setPendingAction({
      title: "Delete Selected Videos",
      desc: `Are you sure you want to delete ${count} selected video(s)?`,
      action: async () => {
        try {
          await Promise.all(
            selectedMediaIds.map(id => fetch(`${endpointBase}/${id}`, { method: "DELETE" }))
          );
          setCategories(prev => prev.map(c => c.id === activeCategory.id ? {
            ...c,
            subCategories: c.subCategories.map(s => s.id === activeSubTab ? {
              ...s,
              mediaItems: s.mediaItems.filter(m => !selectedMediaIds.includes(m.id))
            } : s)
          } : c));
          setSelectedMediaIds([]);
          toast.success(`Successfully deleted ${count} video(s)`);
        } catch (err) {
          toast.error("Failed to delete selected videos");
        }
      }
    });
  };

  function slugifyText(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
  }

  const handleBulkImport = async (items: ParsedVideoItem[]) => {
    if (!activeCategory || !bulkTargetSubId) return;

    let successCount = 0;
    const targetCategoryId = bulkTargetSubId.replace("_direct", "");
    const endpoint = mediaType === "audio" ? "/api/audio" : "/api/videos";

    for (let i = 0; i < items.length; i++) {
      const v = items[i];
      const payload: any = {
        title: v.title || `${mediaType === "audio" ? "Audio" : "Video"} ${i + 1}`,
        slug: `${slugifyText(v.title || (mediaType === "audio" ? "audio" : "video"))}-${Date.now().toString().slice(-5)}-${i}`,
        thumbnailUrl: v.thumbnailUrl || "",
        categoryId: targetCategoryId,
        isPublished: true,
        order: i,
      };

      if (mediaType === "audio") {
        payload.audioUrl = v.videoUrl;
        payload.embedUrl = v.embedUrl || v.videoUrl;
      } else {
        payload.videoUrl = v.videoUrl;
        payload.embedUrl = formatEmbedUrl(v.embedUrl || v.videoUrl);
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error(`Failed to import ${mediaType}:`, v.title, e);
      }
    }

    toast.success(`Successfully imported ${successCount} ${mediaType}(s)!`);
    await fetchData();
  };

  const { uploadFile: chunkedUpload } = useChunkedUpload();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      const updatedCategories = newCategories.map((c, idx) => ({ ...c, order: idx }));
      setCategories(updatedCategories);

      try {
        await Promise.all(
          updatedCategories.map(cat =>
            fetch(`/api/${mediaType}-categories/${cat.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: cat.order })
            })
          )
        );
      } catch (err) {
        toast.error("Failed to save new order");
      }
    }
  };

  const handleSubCatDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (!activeCategory) return;

      const items = activeCategory.subCategories.filter(s => !s.id.endsWith('_direct'));
      const oldIndex = items.findIndex((c) => c.id === active.id);
      const newIndex = items.findIndex((c) => c.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedItems = newItems.map((c, idx) => ({ ...c, order: idx }));

      setCategories(categories.map(c => {
        if (c.id === activeCategory.id) {
          return {
            ...c,
            subCategories: [...updatedItems, ...c.subCategories.filter(s => s.id.endsWith('_direct'))]
          };
        }
        return c;
      }));

      try {
        await Promise.all(
          updatedItems.map(sub =>
            fetch(`/api/${mediaType}-categories/${sub.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: sub.order })
            })
          )
        );
      } catch (err) {
        toast.error("Failed to save sub-category order");
      }
    }
  };

  const handleMediaItemDragEnd = async (event: DragEndEvent, subId: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (!activeCategory) return;
      const sub = activeCategory.subCategories.find(s => s.id === subId);
      if (!sub) return;

      const items = sub.mediaItems;
      const oldIndex = items.findIndex((c) => c.id === active.id);
      const newIndex = items.findIndex((c) => c.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedItems = newItems.map((c, idx) => ({ ...c, order: idx }));

      setCategories(categories.map(c => {
        if (c.id === activeCategory.id) {
          return {
            ...c,
            subCategories: c.subCategories.map(s => s.id === sub.id ? { ...s, mediaItems: updatedItems } : s)
          };
        }
        return c;
      }));

      try {
        await Promise.all(
          updatedItems.map(item =>
            fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: item.order })
            })
          )
        );
      } catch (err) {
        toast.error("Failed to save media order");
      }
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [mediaType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${mediaType}-categories`);
      const data = await res.json();

      const mapped = data.map((mainCat: any) => ({
        id: mainCat.id,
        title: mainCat.name,
        slug: mainCat.slug || "",
        code: mainCat.code || "",
        image: mainCat.imageUrl || "",
        order: mainCat.order || 0,
        isPublished: mainCat.isActive !== false,
        customFields: mainCat.customFields || {},
        subCategories: (mainCat.subCategories?.map((subCat: any) => ({
          id: subCat.id,
          title: subCat.name,
          image: subCat.imageUrl || "",
          code: subCat.code || "",
          slug: subCat.slug || "",
          order: subCat.order || 0,
          isPublished: subCat.isActive !== false,
          customFields: subCat.customFields || {},
          mediaItems: (mediaType === "audio" ? subCat.audioFiles : subCat.videos)?.map((item: any) => ({
            id: item.id,
            title: item.title,
            mediaUrl: mediaType === "audio" ? item.audioUrl : item.videoUrl,
            embedUrl: item.embedUrl || "",
            thumbnailUrl: item.thumbnailUrl || item.imageUrl || item.image || "",
            image: item.thumbnailUrl || item.imageUrl || item.image || "",
            description: item.description || "",
            code: item.code || item.episodeNumber || "",
            slug: item.slug || "",
            tags: item.tags || "",
            isPublished: (item.isPublished !== undefined ? item.isPublished : item.isActive) !== false,
            customFields: item.customFields || {},
            viewCount: item.viewCount || 0,
            playCount: item.playCount || 0,
            shareCount: item.shareCount || 0,
            downloadCount: item.downloadCount || 0
          })) || []
        })) || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setCategories(mapped);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublishSubCategory = async (mainId: string, sub: SubCategory) => {
    const nextPublishedState = !(sub.isPublished !== false);
    setCategories(categories.map(c =>
      c.id === mainId ? {
        ...c,
        subCategories: c.subCategories.map(s => s.id === sub.id ? { ...s, isPublished: nextPublishedState } : s)
      } : c
    ));
    try {
      const res = await fetch(`/api/${mediaType}-categories/${sub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextPublishedState })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      toast.success(`Sub-category ${nextPublishedState ? "published" : "hidden"} successfully`);
    } catch (err) {
      setCategories(categories.map(c =>
        c.id === mainId ? {
          ...c,
          subCategories: c.subCategories.map(s => s.id === sub.id ? { ...s, isPublished: sub.isPublished } : s)
        } : c
      ));
      toast.error("Failed to toggle sub-category visibility");
    }
  };

  const togglePublishMediaItem = async (mainId: string, subId: string, item: MediaItem) => {
    const nextPublishedState = !(item.isPublished !== false);
    setCategories(categories.map(c =>
      c.id === mainId ? {
        ...c,
        subCategories: c.subCategories.map(s =>
          s.id === subId ? {
            ...s,
            mediaItems: s.mediaItems.map(m => m.id === item.id ? { ...m, isPublished: nextPublishedState } : m)
          } : s
        )
      } : c
    ));
    try {
      const endpoint = mediaType === "audio" ? `/api/audio/${item.id}` : `/api/videos/${item.id}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublishedState, isActive: nextPublishedState })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      toast.success(`Item ${nextPublishedState ? "published" : "hidden"} successfully`);
    } catch (err) {
      setCategories(categories.map(c =>
        c.id === mainId ? {
          ...c,
          subCategories: c.subCategories.map(s =>
            s.id === subId ? {
              ...s,
              mediaItems: s.mediaItems.map(m => m.id === item.id ? { ...m, isPublished: item.isPublished } : m)
            } : s
          )
        } : c
      ));
      toast.error("Failed to toggle item visibility");
    }
  };

  const togglePublishMainCategory = async (cat: MainCategory) => {
    const nextPublishedState = !(cat.isPublished !== false);
    setCategories(categories.map(c => c.id === cat.id ? { ...c, isPublished: nextPublishedState } : c));
    try {
      const res = await fetch(`/api/${mediaType}-categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextPublishedState })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      toast.success(`Category ${nextPublishedState ? "published" : "hidden"} successfully`);
    } catch (err) {
      setCategories(categories.map(c => c.id === cat.id ? { ...c, isPublished: cat.isPublished } : c));
      toast.error("Failed to toggle category visibility");
    }
  };

  // Main Category (Tab) states
  const [editingMainCat, setEditingMainCat] = useState<MainCategory | null>(null);
  const [isAddingMainCat, setIsAddingMainCat] = useState(false);
  const [newMainCatImage, setNewMainCatImage] = useState("");

  // Sub Category (Card) states
  const [editingSubCat, setEditingSubCat] = useState<{ cat: SubCategory, mainId: string } | null>(null);

  // Media Item states inside Sub Category
  const [editingMedia, setEditingMedia] = useState<{ item: MediaItem, subId: string } | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // --- Main Category Handlers ---
  const addMainCategory = async (title: string, code: string, imageUrl: string, slug?: string, openInNewTab?: boolean) => {
    try {
      const res = await fetch(`/api/${mediaType}-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          code,
          imageUrl,
          parentId: null,
          slug: slug || undefined,
          customFields: JSON.stringify({ openInNewTab: openInNewTab || false })
        })
      });
      const data = await res.json();

      const newCat: MainCategory = {
        id: data.id,
        title,
        slug: data.slug || "",
        code,
        image: imageUrl,
        order: 0,
        customFields: { openInNewTab: openInNewTab || false },
        subCategories: [],
      };
      setCategories([...categories, newCat]);
      setActiveTab(data.id);
      setIsAddingMainCat(false);
      setNewMainCatImage(""); // Reset image
      toast.success("Main category added");
    } catch (err) {
      toast.error("Failed to create main category");
    }
  };

  const removeMainCategory = async (id: string) => {
    try {
      await fetch(`/api/${mediaType}-categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter(c => c.id !== id));
      if (activeTab === id) setActiveTab(categories[0]?.id || "");
      toast.success("Main category deleted");
    } catch (err) {
      toast.error("Failed to delete main category");
    }
  };

  const saveMainCategory = async (updatedCat: MainCategory) => {
    try {
      await fetch(`/api/${mediaType}-categories/${updatedCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedCat.title,
          slug: updatedCat.slug,
          code: updatedCat.code,
          imageUrl: updatedCat.image,
          order: updatedCat.order || 0,
          customFields: updatedCat.customFields || {}
        })
      });
      setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c).sort((a, b) => (a.order || 0) - (b.order || 0)));
      toast.success("Main tab saved");
    } catch (err) {
      toast.error("Failed to save main tab");
    }
  };

  // --- Sub Category (Card) Handlers ---
  const addSubCategory = async (mainId: string) => {
    try {
      const res = await fetch(`/api/${mediaType}-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `New Sub Category`, parentId: mainId })
      });
      const data = await res.json();

      const newSub: SubCategory = {
        id: data.id,
        title: `New Sub Category`,
        slug: data.slug || "new-sub-category",
        image: "",
        code: "",
        order: 0,
        customFields: {},
        mediaItems: [],
      };

      setCategories(categories.map(c =>
        c.id === mainId ? { ...c, subCategories: [...c.subCategories, newSub] } : c
      ));

      setEditingSubCat({ cat: newSub, mainId });
    } catch (err) {
      toast.error("Failed to create sub category");
    }
  };

  const handleBulkAddSubCategories = async (mainId: string) => {
    if (!bulkSubCatInput.trim()) {
      toast.error("Please enter at least one sub-category name or line.");
      return;
    }

    const lines = bulkSubCatInput
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast.error("No valid sub-category names found.");
      return;
    }

    setIsCreatingSubCats(true);
    let successCount = 0;
    const createdSubs: SubCategory[] = [];

    const existingSubCount = activeCategory?.subCategories.filter(s => !s.id.endsWith('_direct')).length || 0;

    for (let i = 0; i < lines.length; i++) {
      const rawName = lines[i];
      let name = rawName;
      if (bulkSubCatPrefix.trim()) {
        name = `${bulkSubCatPrefix.trim()} - ${rawName}`;
      }

      const slug = slugifyText(name) + "-" + Date.now().toString().slice(-4) + "-" + i;

      try {
        const res = await fetch(`/api/${mediaType}-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            parentId: mainId,
            order: existingSubCount + i,
          })
        });

        if (res.ok) {
          const data = await res.json();
          createdSubs.push({
            id: data.id,
            title: name,
            slug: data.slug || slug,
            image: "",
            code: "",
            order: existingSubCount + i,
            customFields: {},
            mediaItems: [],
          });
          successCount++;
        }
      } catch (err) {
        console.error("Failed to create sub-category:", name, err);
      }
    }

    if (createdSubs.length > 0) {
      setCategories(categories.map(c =>
        c.id === mainId ? { ...c, subCategories: [...c.subCategories, ...createdSubs] } : c
      ));
    }

    setIsCreatingSubCats(false);
    setIsBulkSubCatModalOpen(false);
    setBulkSubCatInput("");
    setBulkSubCatPrefix("");
    toast.success(`Successfully created ${successCount} sub-category/categories!`);
  };

  const saveSubCategory = async (mainId: string, updatedSub: SubCategory) => {
    try {
      await fetch(`/api/${mediaType}-categories/${updatedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedSub.title,
          slug: updatedSub.slug,
          imageUrl: updatedSub.image,
          code: updatedSub.code,
          order: updatedSub.order || 0,
          customFields: updatedSub.customFields || {}
        })
      });

      setCategories(categories.map(c =>
        c.id === mainId ? {
          ...c,
          subCategories: c.subCategories.map(s => s.id === updatedSub.id ? updatedSub : s).sort((a, b) => (a.order || 0) - (b.order || 0))
        } : c
      ));
      toast.success("Sub category saved");
    } catch (err) {
      toast.error("Failed to save sub category");
    }
  };

  const removeSubCategory = async (mainId: string, subId: string) => {
    try {
      await fetch(`/api/${mediaType}-categories/${subId}`, { method: "DELETE" });
      setCategories(categories.map(c =>
        c.id === mainId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) } : c
      ));
      toast.success("Sub category deleted");
    } catch (err) {
      toast.error("Failed to delete main category");
    }
  };

  // --- Media Items Handlers ---
  const addMediaItem = (subId: string) => {
    const newItem: MediaItem = {
      id: "new",
      title: "",
      slug: "",
      mediaUrl: "",
      embedUrl: "",
      description: "",
      customFields: {},
    };
    setEditingMedia({ item: newItem, subId });
  };

  const formatEmbedUrl = (url: string) => {
    if (!url) return "";

    // If it's an iframe tag (or partial iframe snippet containing src), extract the src attribute
    const srcMatch = url.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }

    // Clean up random trailing iframe garbage if they pasted a partial iframe without src
    if (url.includes("></iframe>") || url.includes("frameborder=")) {
      // If we couldn't extract a src, and it's just garbage, we might want to return empty 
      // but let's try to extract any http URL first
      const httpMatch = url.match(/(https?:\/\/[^\s"']+)/i);
      if (httpMatch && httpMatch[1]) {
        url = httpMatch[1];
      } else {
        // It's just iframe garbage without a url, return what they typed and let them fix it
      }
    }

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    // Dailymotion
    const dmMatch = url.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;

    // OK.ru
    const okMatch = url.match(/(?:ok\.ru\/(?:video|videoembed)\/)([0-9]+)/i);
    if (okMatch && okMatch[1]) return `https://ok.ru/videoembed/${okMatch[1]}`;

    return url.trim();
  };

  const saveMediaItem = async (subId: string, item: MediaItem) => {
    if (!item.title.trim()) {
      toast.error("Please enter a Title for this media file.");
      return;
    }

    setIsSavingItem(true);
    try {
      const isNew = item.id === "new";
      const payload = {
        title: item.title,
        description: item.description,
        categoryId: subId.replace("_direct", ""),
        isPublished: true,
        slug: item.slug || (item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()),
        thumbnailUrl: item.thumbnailUrl || item.image || "",
        ...(mediaType === "audio"
          ? { audioUrl: item.mediaUrl || "", code: item.code, customFields: item.customFields }
          : { videoUrl: item.mediaUrl || "", embedUrl: formatEmbedUrl(item.embedUrl || ""), episodeNumber: item.code, customFields: item.customFields })
      };

      let finalId = item.id;
      if (isNew) {
        const res = await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create media item");
        }
        const data = await res.json();
        finalId = mediaType === 'audio' ? data.audio?.id || data.id : data.video?.id || data.id;
      } else {
        const res = await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update media item");
        }
      }

      const finalItem = { ...item, id: finalId };

      setCategories(categories.map(main => ({
        ...main,
        subCategories: main.subCategories.map(sub => {
          if (sub.id === subId) {
            return {
              ...sub,
              mediaItems: isNew
                ? [...sub.mediaItems, finalItem]
                : sub.mediaItems.map(m => m.id === item.id ? finalItem : m)
            };
          }
          return sub;
        })
      })));

      // If we are currently editing the subCat, update its local state too
      if (editingSubCat && editingSubCat.cat.id === subId) {
        setEditingSubCat(prev => prev ? {
          ...prev,
          cat: {
            ...prev.cat,
            mediaItems: isNew
              ? [...prev.cat.mediaItems, finalItem]
              : prev.cat.mediaItems.map(m => m.id === item.id ? finalItem : m)
          }
        } : null);
      }

      setEditingMedia(null);
      toast.success("Saved media item");
    } catch (err: any) {
      console.error("Save media error:", err);
      toast.error(err.message || "Failed to save media item");
    } finally {
      setIsSavingItem(false);
    }
  };

  const removeMediaItem = async (subId: string, itemId: string) => {
    try {
      await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}/${itemId}`, { method: "DELETE" });
      setCategories(categories.map(main => ({
        ...main,
        subCategories: main.subCategories.map(sub => {
          if (sub.id === subId) {
            return { ...sub, mediaItems: sub.mediaItems.filter(m => m.id !== itemId) };
          }
          return sub;
        })
      })));

      if (editingSubCat && editingSubCat.cat.id === subId) {
        setEditingSubCat(prev => prev ? {
          ...prev,
          cat: { ...prev.cat, mediaItems: prev.cat.mediaItems.filter(m => m.id !== itemId) }
        } : null);
      }

      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 p-4 border rounded-xl">
        <div>
          <h4 className="font-bold text-foreground">Manage {mediaType === "audio" ? "Audios" : "Videos"}</h4>
          <p className="text-xs text-muted-foreground mt-1">Organize content in Tabs (Main Categories), Cards (Sub-categories), and Items.</p>
        </div>
        <div className="flex items-center gap-2">
          {!activeTab && categories.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMainCatIds.length === categories.length) {
                    setSelectedMainCatIds([]);
                  } else {
                    setSelectedMainCatIds(categories.map(c => c.id));
                  }
                }}
              >
                {selectedMainCatIds.length === categories.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedMainCatIds.length > 0 && (
                <Button type="button" size="sm" variant="destructive" onClick={bulkDeleteMainCategories}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete ({selectedMainCatIds.length})
                </Button>
              )}
            </>
          )}
          <Button type="button" onClick={() => setIsAddingMainCat(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Main Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading data...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
          No Media found. Click "Add Main Tab" to get started.
        </div>
      ) : !activeTab ? (
        <div className="space-y-6 animate-in fade-in">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                  <SortableCategoryCard
                    key={`mainCat-${cat.id}-${i}`}
                    cat={cat}
                    mediaType={mediaType}
                    isSelected={selectedMainCatIds.includes(cat.id)}
                    onToggleSelect={() => toggleSelectMainCat(cat.id)}
                    onClick={() => setActiveTab(cat.id)}
                    onEdit={(c) => setEditingMainCat(c)}
                    onTogglePublish={(c) => togglePublishMainCategory(c)}
                    onDelete={(c) => {
                      setPendingAction({
                        title: "Delete Main Category",
                        desc: "Are you sure you want to delete this main category and all its contents?",
                        action: async () => await removeMainCategory(c.id)
                      });
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : activeCategory && activeSubTab ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <Button variant="outline" size="sm" onClick={() => setActiveSubTab("")}>
              ← Back to {activeCategory.title}
            </Button>
            <div>
              <h4 className="text-xl font-bold text-foreground">{activeCategory.subCategories.find(s => s.id === activeSubTab)?.title} Videos</h4>
              <p className="text-sm text-muted-foreground">Manage media items inside this sub-category.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-lg">Media Items</h5>
              <div className="flex items-center gap-2">
                {(() => {
                  const sub = activeCategory.subCategories.find(s => s.id === activeSubTab);
                  if (sub && sub.mediaItems.length > 0) {
                    return (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const itemIds = sub.mediaItems.map(m => m.id);
                            if (selectedMediaIds.length === itemIds.length) {
                              setSelectedMediaIds([]);
                            } else {
                              setSelectedMediaIds(itemIds);
                            }
                          }}
                        >
                          {selectedMediaIds.length === sub.mediaItems.length ? "Deselect All" : "Select All"}
                        </Button>
                        {selectedMediaIds.length > 0 && (
                          <Button type="button" size="sm" variant="destructive" onClick={bulkDeleteMediaItems}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete ({selectedMediaIds.length})
                          </Button>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
                {mediaType === "video" && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setBulkTargetSubId(activeSubTab);
                    setIsBulkModalOpen(true);
                  }}>
                    <Sparkles className="w-4 h-4 mr-1 text-primary" /> Bulk Add Videos
                  </Button>
                )}
                <Button size="sm" variant="default" onClick={() => {
                  const sub = activeCategory.subCategories.find(s => s.id === activeSubTab);
                  if (sub) {
                    setEditingMedia({
                      item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "", customFields: {} },
                      subId: sub.id
                    });
                  }
                }}>
                  <Plus className="w-4 h-4 mr-1" /> Add New Video
                </Button>
              </div>
            </div>
            {(() => {
              const sub = activeCategory.subCategories.find(s => s.id === activeSubTab);
              if (!sub || sub.mediaItems.length === 0) return (
                <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                  No videos here yet. Add a new video to start.
                </div>
              );
              return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleMediaItemDragEnd(e, sub.id)}>
                  <SortableContext items={sub.mediaItems.map(m => m.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sub.mediaItems.map((item) => (
                        <SortableDirectVideoCard
                          key={item.id}
                          item={item}
                          mediaType={mediaType}
                          isSelected={selectedMediaIds.includes(item.id)}
                          onToggleSelect={() => toggleSelectMedia(item.id)}
                          onClick={() => {
                            setEditingMedia({ item: item, subId: sub.id });
                          }}
                          onEdit={() => {
                            setEditingMedia({ item: item, subId: sub.id });
                          }}
                          onTogglePublish={(m) => togglePublishMediaItem(activeCategory.id, sub.id, m)}
                          onDelete={() => {
                            setPendingAction({
                              title: `Delete ${mediaType === 'audio' ? 'Audio' : 'Video'}`,
                              desc: `Are you sure you want to delete "${item.title}"?`,
                              action: async () => await removeMediaItem(sub.id, item.id)
                            });
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              );
            })()}
          </div>
        </div>
      ) : activeCategory ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("")}>
              ← Back to Categories
            </Button>
            <div>
              <h4 className="text-xl font-bold text-foreground">{activeCategory.title}</h4>
              <p className="text-sm text-muted-foreground">Manage sub-categories (Cards) inside this category.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-lg">{activeCategory.title} Content</h5>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  let genSub = activeCategory.subCategories.find(s => s.id === activeCategory.id + "_direct");
                  if (!genSub) {
                    genSub = {
                      id: activeCategory.id + "_direct",
                      title: "(General)",
                      image: "",
                      code: "",
                      mediaItems: []
                    };
                    setCategories(categories.map(c => c.id === activeCategory.id ? { ...c, subCategories: [genSub!, ...c.subCategories] } : c));
                  }
                  setBulkTargetSubId(genSub.id);
                  setIsBulkModalOpen(true);
                }}>
                  <Sparkles className="w-4 h-4 mr-1 text-primary" /> {mediaType === "audio" ? "Bulk Add Audios" : "Bulk Add Videos"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => {
                  let genSub = activeCategory.subCategories.find(s => s.id === activeCategory.id + "_direct");
                  if (!genSub) {
                    genSub = {
                      id: activeCategory.id + "_direct",
                      title: "(General)",
                      image: "",
                      code: "",
                      mediaItems: []
                    };
                    setCategories(categories.map(c => c.id === activeCategory.id ? { ...c, subCategories: [genSub!, ...c.subCategories] } : c));
                  }
                  setEditingMedia({
                    item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "", customFields: {} },
                    subId: genSub.id
                  });
                }}>
                  {mediaType === "audio" ? <Headphones className="w-4 h-4 mr-1" /> : <Video className="w-4 h-4 mr-1" />}
                  {mediaType === "audio" ? "Add Direct Audio" : "Add Direct Video"}
                </Button>
                <Button size="sm" variant="default" onClick={() => setIsBulkSubCatModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Sub-Category
                </Button>
              </div>
            </div>

            {activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).length === 0 && (!activeCategory.subCategories.find(s => s.id.endsWith('_direct'))?.mediaItems.length) ? (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                No sub-categories or videos here yet. Add a card or direct video to start.
              </div>
            ) : (
              <div className="space-y-8">
                {activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Sub-categories</h5>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => {
                            const subIds = activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).map(s => s.id);
                            if (selectedSubCatIds.length === subIds.length) {
                              setSelectedSubCatIds([]);
                            } else {
                              setSelectedSubCatIds(subIds);
                            }
                          }}
                        >
                          {selectedSubCatIds.length === activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).length ? "Deselect All" : "Select All"}
                        </Button>
                        {selectedSubCatIds.length > 0 && (
                          <Button type="button" size="sm" variant="destructive" className="h-8 text-xs" onClick={bulkDeleteSubCategories}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete ({selectedSubCatIds.length})
                          </Button>
                        )}
                      </div>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubCatDragEnd}>
                      <SortableContext items={activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).map(s => s.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).map((sub) => (
                            <SortableSubCatCard
                              key={sub.id}
                              sub={sub}
                              mediaType={mediaType}
                              isSelected={selectedSubCatIds.includes(sub.id)}
                              onToggleSelect={() => toggleSelectSubCat(sub.id)}
                              onClick={() => {
                                setActiveSubTab(sub.id);
                              }}
                              onEdit={() => {
                                setEditingSubCat({ cat: sub, mainId: activeCategory.id });
                                setEditingMedia({
                                  item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "", customFields: {} },
                                  subId: sub.id
                                });
                              }}
                              onTogglePublish={(s) => togglePublishSubCategory(activeCategory.id, s)}
                              onDelete={() => {
                                setPendingAction({
                                  title: "Delete Sub-category",
                                  desc: "Are you sure you want to delete this sub-category?",
                                  action: async () => await removeSubCategory(activeCategory.id, sub.id)
                                });
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {activeCategory.subCategories.find(s => s.id.endsWith('_direct'))?.mediaItems.length ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{mediaType === "audio" ? "Direct Audios" : "Direct Videos"}</h5>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => {
                            const directItems = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!.mediaItems.map(m => m.id);
                            if (selectedDirectMediaIds.length === directItems.length) {
                              setSelectedDirectMediaIds([]);
                            } else {
                              setSelectedDirectMediaIds(directItems);
                            }
                          }}
                        >
                          {selectedDirectMediaIds.length === activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!.mediaItems.length ? "Deselect All" : "Select All"}
                        </Button>
                        {selectedDirectMediaIds.length > 0 && (
                          <Button type="button" size="sm" variant="destructive" className="h-8 text-xs" onClick={bulkDeleteDirectMediaItems}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete ({selectedDirectMediaIds.length})
                          </Button>
                        )}
                      </div>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleMediaItemDragEnd(e, activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!.id)}>
                      <SortableContext items={activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!.mediaItems.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!.mediaItems.map((item) => (
                            <SortableDirectVideoCard
                              key={item.id}
                              item={item}
                              mediaType={mediaType}
                              isSelected={selectedDirectMediaIds.includes(item.id)}
                              onToggleSelect={() => toggleSelectDirectMedia(item.id)}
                              onClick={() => {
                                const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!;
                                setEditingMedia({ item: item, subId: directSub.id });
                              }}
                              onEdit={() => {
                                const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!;
                                setEditingMedia({ item: item, subId: directSub.id });
                              }}
                              onTogglePublish={(m) => {
                                const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!;
                                togglePublishMediaItem(activeCategory.id, directSub.id, m);
                              }}
                              onDelete={() => {
                                const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!;
                                setPendingAction({
                                  title: `Delete ${mediaType === 'audio' ? 'Audio' : 'Video'}`,
                                  desc: `Are you sure you want to delete "${item.title}"?`,
                                  action: async () => await removeMediaItem(directSub.id, item.id)
                                });
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Main Category Modal */}
      <Dialog open={isAddingMainCat} onOpenChange={setIsAddingMainCat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Main Tab</DialogTitle>
            <DialogDescription className="sr-only">Create a new main category tab.</DialogDescription>
          </DialogHeader>
          <form id="addMainCatForm" onSubmit={(e) => e.preventDefault()} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tab Name <span className="text-destructive">*</span></Label>
              <Input name="title" required placeholder="e.g. Dars-e-Quran" />
            </div>
            <div className="space-y-2">
              <Label>Optional Slug</Label>
              <Input name="slug" placeholder="e.g. dars-e-quran (auto-generated if empty)" />
              <div className="flex items-center space-x-2 pt-2">
                <Switch name="openInNewTab" />
                <Label className="text-sm font-normal cursor-pointer">Open in New Tab</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <ImageUploader
                value={newMainCatImage}
                onChange={setNewMainCatImage}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingMainCat(false)} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
              <Button type="button" onClick={() => {
                const form = document.getElementById('addMainCatForm') as HTMLFormElement;
                if (!form.checkValidity()) { form.reportValidity(); return; }
                const formData = new FormData(form);
                setPendingAction({
                  title: "Create Main Category",
                  desc: "Are you sure you want to create this new main category?",
                  action: () => addMainCategory(
                    formData.get("title") as string,
                    formData.get("code") as string,
                    newMainCatImage,
                    formData.get("slug") as string,
                    formData.get("openInNewTab") === "on"
                  )
                });
              }} className="bg-primary text-white hover:bg-primary/80">Create Tab</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Main Category Modal */}
      <Dialog open={!!editingMainCat} onOpenChange={(v) => !v && setEditingMainCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Main Tab: {editingMainCat?.title}</DialogTitle>
            <DialogDescription className="sr-only">Edit the name and image for this main category tab.</DialogDescription>
          </DialogHeader>
          {editingMainCat && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tab Name <span className="text-destructive">*</span></Label>
                <Input
                  value={editingMainCat.title}
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Optional Slug</Label>
                <Input
                  value={editingMainCat.slug || ""}
                  placeholder="e.g. dars-e-quran"
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, slug: e.target.value })}
                />
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={editingMainCat.customFields?.openInNewTab || false}
                    onCheckedChange={(checked) => setEditingMainCat({ ...editingMainCat, customFields: { ...(editingMainCat.customFields || {}), openInNewTab: checked } })}
                  />
                  <Label className="text-sm font-normal cursor-pointer">Open in New Tab</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingMainCat.order || 0}
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Urdu Name</Label>
                <Input
                  value={editingMainCat.customFields?.urduName || ""}
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, customFields: { ...editingMainCat.customFields, urduName: e.target.value } })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>Featured Image (16:9 Ratio)</Label>
                <ImageUploader
                  value={editingMainCat.image || ""}
                  onChange={(url) => setEditingMainCat({ ...editingMainCat, image: url })}
                  aspectRatio={16 / 9}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingMainCat(null)} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
                <Button type="button" onClick={() => {
                  if (!editingMainCat.title) {
                    toast.error("Tab name is required");
                    return;
                  }
                  setPendingAction({
                    title: "Save Main Tab",
                    desc: "Are you sure you want to save changes to this main tab?",
                    action: async () => {
                      await saveMainCategory(editingMainCat);
                      setEditingMainCat(null);
                    }
                  });
                }} className="bg-primary text-white hover:bg-primary/80">Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-Category (Card) Manager Modal */}
      <Dialog open={!!editingSubCat} onOpenChange={(v) => !v && setEditingSubCat(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubCat?.cat.id.endsWith("_direct") ? "Manage Direct Videos" : `Manage Sub-category: ${editingSubCat?.cat.title}`}
            </DialogTitle>
            <DialogDescription className="sr-only">Manage media files within this sub-category.</DialogDescription>
          </DialogHeader>
          {editingSubCat && (
            <div className="space-y-6 py-4">
              {/* Card Meta details (hide for direct general category) */}
              {!editingSubCat.cat.id.endsWith("_direct") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Card Title</Label>
                    <Input
                      value={editingSubCat.cat.title}
                      onChange={(e) => setEditingSubCat({
                        ...editingSubCat,
                        cat: {
                          ...editingSubCat.cat,
                          title: e.target.value,
                          slug: (!editingSubCat.cat.slug || editingSubCat.cat.slug === "new-sub-category" || editingSubCat.cat.slug === editingSubCat.cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") : editingSubCat.cat.slug
                        }
                      })}
                      onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thumbnail Slug</Label>
                    <Input
                      value={editingSubCat.cat.slug || ""}
                      onChange={(e) => setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, slug: e.target.value } })}
                      onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                    />
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        checked={editingSubCat.cat.customFields?.openInNewTab || false}
                        onCheckedChange={(checked) => setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, customFields: { ...(editingSubCat.cat.customFields || {}), openInNewTab: checked } } })}
                        onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                      />
                      <Label className="text-sm font-normal cursor-pointer">Open in New Tab</Label>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Urdu Name</Label>
                <Input
                  value={editingSubCat.cat.customFields?.urduName || ""}
                  onChange={(e) => setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, customFields: { ...(editingSubCat.cat.customFields || {}), urduName: e.target.value } } })}
                  onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                  dir="rtl"
                />
              </div>

              {!editingSubCat.cat.id.endsWith("_direct") && (
                <>
                  <div className="space-y-2 mt-4">
                    <Label>Thumbnail / Featured Image</Label>
                    <ImageUploader
                      value={editingSubCat.cat.image || ""}
                      onChange={(url) => {
                        setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, image: url } });
                        saveSubCategory(editingSubCat.mainId, { ...editingSubCat.cat, image: url });
                      }}
                      aspectRatio={16 / 9}
                    />
                  </div>
                </>
              )}

            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <div className="pt-2 flex justify-end gap-4 w-full">
              <Button variant="outline" onClick={() => setEditingSubCat(null)} className="bg-destructive text-white hover:bg-destructive/80">Close</Button>
              {editingSubCat && !editingSubCat.cat.id.endsWith('_direct') && (
                <Button onClick={() => {
                  setPendingAction({
                    title: "Save Sub-category",
                    desc: "Are you sure you want to save changes to this sub-category?",
                    action: () => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)
                  });
                }} className="bg-primary text-white hover:bg-primary/80">Save Thumbnail</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Item Manager Modal */}
      <Dialog open={!!editingMedia} onOpenChange={(v) => !v && setEditingMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedia?.item.id === "new" ? "Add New Media File" : `Edit Media File: ${editingMedia?.item.title}`}
            </DialogTitle>
            <DialogDescription className="sr-only">Upload or edit media details.</DialogDescription>
          </DialogHeader>

          {editingMedia && (
            <div className="mt-2 border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 space-y-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title <span className="text-destructive">*</span></Label>
                    <Input
                      value={editingMedia.item.title}
                      onChange={(e) => setEditingMedia({
                        ...editingMedia,
                        item: {
                          ...editingMedia.item,
                          title: e.target.value,
                          slug: editingMedia.item.id === "new" ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") : editingMedia.item.slug
                        }
                      })}
                      placeholder="e.g. Episode 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug <span className="text-destructive">*</span></Label>
                    <Input
                      value={editingMedia.item.slug || ""}
                      onChange={(e) => setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, slug: e.target.value } })}
                      placeholder="e.g. episode-1"
                    />
                  </div>
                </div>                {mediaType === "audio" ? (
                  <div className="space-y-2">
                    <Label>Audio File</Label>
                    <AudioUploader
                      value={editingMedia.item.mediaUrl}
                      onChange={(url) => setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, mediaUrl: url } })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Video File URL (.mp4, .webm)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editingMedia.item.mediaUrl}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          const parsed = parseVideoInput(newUrl);
                          setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, mediaUrl: newUrl, embedUrl: parsed.embedSrc || editingMedia.item.embedUrl } });

                          // Auto-fetch thumbnail to category if empty
                          if (editingSubCat && !editingSubCat.cat.image && parsed.thumbnailUrl) {
                            setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, image: parsed.thumbnailUrl } });
                            toast.success("Thumbnail auto-fetched!");
                          }
                        }}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" className="w-24 overflow-hidden relative">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Upload
                        <input
                          type="file"
                          accept="video/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            if (!e.target.files?.length) return;
                            const file = e.target.files[0];

                            // 100MB limit for files
                            const MAX_FILE_SIZE = 100 * 1024 * 1024;
                            if (file.size > MAX_FILE_SIZE) {
                              toast.error("File is too large. Please select a file under 100MB.");
                              e.target.value = '';
                              return;
                            }

                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              toast.loading("Uploading...");
                              const data = await chunkedUpload(file, {
                                onProgress: (pct) => console.log(`[MediaCategoryManager] Upload progress: ${pct}%`),
                              });
                              toast.dismiss();
                              if (data.url) {
                                setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, mediaUrl: data.url } });
                                toast.success("File URL applied");
                              }
                            } catch (err: any) {
                              toast.dismiss();
                              console.error("[MediaCategoryManager] Upload error:", err);
                              toast.error("Upload failed: " + (err.message || "Unknown error"));
                            }
                          }}
                        />
                      </Button>
                    </div>
                  </div>
                )}

                {mediaType === "video" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Embed Code (Optional iframe)</Label>
                      <Textarea
                        value={editingMedia.item.embedUrl || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = parseVideoInput(val);
                          setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, embedUrl: parsed.embedSrc || val, mediaUrl: editingMedia.item.mediaUrl || parsed.videoUrl } });

                          const sub = activeCategory?.subCategories.find(s => s.id === editingMedia.subId);
                          if (sub && !sub.image && parsed.thumbnailUrl) {
                            saveSubCategory(activeCategory!.id, { ...sub, image: parsed.thumbnailUrl });
                          }
                        }}
                        placeholder='<iframe src="https://www.youtube.com/embed/..." />'
                        className="font-mono text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">If an embedded URL is provided, it will be used by the player instead of the Video File URL.</p>
                    </div>
                    {(parseVideoInput(editingMedia.item.mediaUrl || editingMedia.item.embedUrl || "").embedSrc || editingMedia.item.mediaUrl) && (
                      <div className="space-y-2 pt-2">
                        <Label>Video Preview</Label>
                        <div className="rounded-md overflow-hidden bg-black aspect-video relative">
                          {parseVideoInput(editingMedia.item.mediaUrl || editingMedia.item.embedUrl || "").embedSrc ? (
                            <iframe
                              src={parseVideoInput(editingMedia.item.mediaUrl || editingMedia.item.embedUrl || "").embedSrc}
                              title="Video Preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full absolute inset-0"
                            />
                          ) : (
                            <video src={editingMedia.item.mediaUrl} controls className="w-full h-full object-contain absolute inset-0" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <CustomFieldRenderer
                  entityType={mediaType}
                  values={editingMedia.item.customFields || {}}
                  onChange={(key, val) => setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, customFields: { ...(editingMedia.item.customFields || {}), [key]: val } } })}
                />
                <CustomFieldBuilder entityType={mediaType} />

              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <div className="pt-2 flex justify-end gap-4 w-full">
              <Button variant="outline" onClick={() => setEditingMedia(null)} className="bg-destructive text-white hover:bg-destructive/80">Cancel</Button>
              {editingMedia && (
                <Button type="button" disabled={isSavingItem} onClick={() => saveMediaItem(editingMedia.subId, editingMedia.item)} className="bg-primary text-white hover:bg-primary/80">
                  {isSavingItem ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    editingMedia.item.id === "new" ? "Save New Item" : "Update Item"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <ConfirmDialog
        title={pendingAction?.title || "Confirm Action"}
        description={pendingAction?.desc || "Are you sure you want to proceed?"}
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onConfirm={async () => {
          if (!pendingAction) return;
          await pendingAction.action();
          setPendingAction(null);
        }}
      />

      <BulkPlaylistModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleBulkImport}
        targetName={activeCategory?.title}
        mediaType={mediaType}
      />

      {/* Bulk Sub-Categories Modal */}
      {isBulkSubCatModalOpen && activeCategory && (
        <Dialog open={isBulkSubCatModalOpen} onOpenChange={(open) => !open && setIsBulkSubCatModalOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Plus className="w-5 h-5 text-primary" />
                Add Sub-Categories (Single or Bulk)
              </DialogTitle>
              <DialogDescription>
                Add one or multiple sub-categories to <strong>{activeCategory.title}</strong> at once. Type or paste one sub-category per line.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title / Series Prefix (Optional)</Label>
                <Input
                  placeholder="e.g. Dars-e-Quran or Series (Optional)"
                  value={bulkSubCatPrefix}
                  onChange={(e) => setBulkSubCatPrefix(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">If provided, this prefix will be prepended (e.g. &quot;Prefix - SubCategory Name&quot;).</p>
              </div>

              <div className="space-y-2">
                <Label>Sub-Category Name(s) <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder={`Surah Al-Fatihah\nSurah Al-Baqarah\nSurah Ali 'Imran\nSurah An-Nisa`}
                  value={bulkSubCatInput}
                  onChange={(e) => setBulkSubCatInput(e.target.value)}
                  className="font-mono text-xs min-h-[140px]"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Enter 1 sub-category or paste hundreds (one per line).</span>
                  <span className="font-semibold text-primary">
                    {bulkSubCatInput.split("\n").filter(l => l.trim()).length} Item(s)
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkSubCatModalOpen(false)} disabled={isCreatingSubCats}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isCreatingSubCats || !bulkSubCatInput.trim()}
                onClick={() => handleBulkAddSubCategories(activeCategory.id)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {isCreatingSubCats ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Creating Sub-Categories...
                  </>
                ) : (
                  `Create ${bulkSubCatInput.split("\n").filter(l => l.trim()).length || 1} Sub-Category/Categories`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
