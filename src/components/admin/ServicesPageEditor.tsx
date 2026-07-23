"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, XCircle, Search, FileText, Sparkles,
  Settings2, Check, AlertCircle, UploadCloud, RefreshCw, ArrowLeft,
  GripVertical, Calendar, ExternalLink, Send, X
} from "lucide-react";
import { PageActionBar } from "@/components/admin/PageActionBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PdfUploader } from "@/components/admin/PdfUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

// DnD Kit imports
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  authorName?: string | null;
  updatedAt?: string;
}

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
  startDate?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  orderIndex: number;
  customFields?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesPageEditorProps {
  pageId: string;
  initialPageData: PageRecord;
}

export type BlockType = "image" | "pdf" | "text" | "thumbnails" | "slider" | "video";

export interface ServiceBlock {
  id: string;
  type: BlockType;
  value: any;
  title?: string;
}

const defaultFormData = {
  title: "",
  slug: "",
  imageUrl: "",
  blocks: [] as ServiceBlock[],
  isPublished: true,
  metaTitle: "",
  metaDescription: "",
  showInSpotlight: true,
  openInNewTab: false,
};

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Sortable Card Item Component ─────────────────────────────────────────────
interface SortableItemProps {
  id: string;
  item: ServiceItem;
  onEdit: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
}

function SortableCard({ id, item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isimage = !!item.imageUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className={cn("h-1.5 w-full", isimage ? "bg-primary" : "bg-emerald-500")} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-wider rounded-md",
              isimage
                ? "bg-primary/10 text-green-600  border-green-500/20"
                : "bg-emerald-500/10 text-emerald-600  border-emerald-500/20"
            )}
          >
            {isimage ? "image Document" : "Written Statement"}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
              onClick={() => window.open(item.slug.startsWith("http") ? item.slug : `/services/${item.slug}`, '_blank')}
              title="View on Frontend"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-primary/10"
              onClick={() => onEdit(item)}
              title="Edit Details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => onDelete(item)}
              title="Delete Service"
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>

        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 mb-1" dir="auto">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground font-mono truncate mb-4" title={item.slug}>
          /{item.slug}
        </p>

        {/* Bottom meta information */}
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">

          <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] px-2 py-0">
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ServiceBlockBuilder({ blocks, onChange }: { blocks: ServiceBlock[], onChange: (blocks: ServiceBlock[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: string) => {
    const newBlock: ServiceBlock = {
      id: uuidv4(),
      type: type as BlockType,
      value: (type === "thumbnails" || type === "slider" || type === "video") ? [] : "",
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, value: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, value } : b));
  };

  const updateBlockField = (id: string, field: string, val: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-4 border-t border-border/50 pt-4">
      <div className="flex items-center justify-between mb-2">
        <Label>Dynamic Layout Fields</Label>
        <Select onValueChange={addBlock} value="">
          <SelectTrigger className="w-[180px]">
            <Plus className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Add Field..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image Block</SelectItem>
            <SelectItem value="pdf">PDF Document</SelectItem>
            <SelectItem value="video">Video Player</SelectItem>
            <SelectItem value="text">Rich Text</SelectItem>
            <SelectItem value="thumbnails">Thumbnails / Links</SelectItem>
            <SelectItem value="slider">Image Slider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {blocks.length === 0 && (
        <div className="text-center p-4 border border-dashed rounded-lg bg-muted/20">
          <p className="text-xs text-muted-foreground">No layout fields added yet. Select a field above.</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <SortableServiceBlock
                key={block.id}
                block={block}
                index={index}
                onUpdate={(val: any) => updateBlock(block.id, val)}
                onUpdateTitle={(val: string) => updateBlockField(block.id, "title", val)}
                onRemove={() => removeBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableServiceBlock({ block, index, onUpdate, onUpdateTitle, onRemove }: any) {
  const { toast } = useToast();
  const { uploadFile } = useChunkedUpload();
  const bulkUploadRef = useRef<HTMLInputElement>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative bg-muted/10 border border-border/50 p-4 rounded-xl group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-foreground hover:text-white">
            <GripVertical className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="bg-primary border border-primary uppercase text-[12px] text-white">{block.type}</Badge>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onRemove}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Optional Section Title"
          value={block.title || ""}
          onChange={(e) => onUpdateTitle(e.target.value)}
        />
      </div>

      {block.type === "image" && (
        <ImageUploader value={block.value} onChange={onUpdate} />
      )}
      {block.type === "pdf" && (
        <div className="space-y-3 p-3 border border-border rounded-lg bg-background">
          <PdfUploader
            value={typeof block.value === 'string' ? block.value : block.value?.url || ""}
            onChange={(url) => {
              const currentTitle = typeof block.value === 'string' ? "" : block.value?.title || "";
              onUpdate({ url, title: currentTitle });
            }}
          />
          <Input
            placeholder="Title (Optional) - e.g. 'Read the full report'"
            value={typeof block.value === 'string' ? "" : block.value?.title || ""}
            onChange={(e) => {
              const currentUrl = typeof block.value === 'string' ? block.value : block.value?.url || "";
              onUpdate({ url: currentUrl, title: e.target.value });
            }}
          />
        </div>
      )}
      {block.type === "text" && (
        <RichTextEditor content={block.value} onChange={onUpdate} />
      )}
      {block.type === "thumbnails" && (
        <div className="space-y-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onUpdate([...(block.value || []), { image: "", url: "", newTab: true }])}>
            <Plus className="h-3 w-3 mr-1" /> Add Thumbnail Link
          </Button>
          <div className="grid grid-cols-2 gap-3">
            {(block.value || []).map((thumb: any, i: number) => (
              <div key={i} className="border border-border/40 p-2 rounded-lg bg-background relative space-y-2 flex flex-col">
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full z-10 shadow-sm hover:bg-destructive hover:text-white"
                  onClick={() => onUpdate((block.value || []).filter((_: any, idx: number) => idx !== i))}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
                <div className="flex-1">
                  <ImageUploader value={thumb.image} onChange={(url) => {
                    const newThumbs = [...block.value];
                    newThumbs[i] = { ...newThumbs[i], image: url };
                    onUpdate(newThumbs);
                  }} />
                </div>
                <div className="space-y-2 mt-2">
                  <Input placeholder="Thumbnail Title (Optional)" value={thumb.title || ""} onChange={(e) => {
                    const newThumbs = [...block.value];
                    newThumbs[i] = { ...newThumbs[i], title: e.target.value };
                    onUpdate(newThumbs);
                  }} />
                  <Input placeholder="URL (e.g. /page or https://)" value={thumb.url || ""} onChange={(e) => {
                    const newThumbs = [...block.value];
                    newThumbs[i] = { ...newThumbs[i], url: e.target.value };
                    onUpdate(newThumbs);
                  }} />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={thumb.newTab !== false}
                        onCheckedChange={(checked) => {
                          const newThumbs = [...block.value];
                          newThumbs[i] = { ...newThumbs[i], newTab: checked };
                          onUpdate(newThumbs);
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Open in New Tab</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                      onClick={() => {
                        const matchYt = thumb.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                        if (matchYt) {
                          const newThumbs = [...block.value];
                          newThumbs[i] = { ...newThumbs[i], image: `https://img.youtube.com/vi/${matchYt[1]}/maxresdefault.jpg` };
                          onUpdate(newThumbs);
                          toast({ title: "Success", description: "Thumbnail fetched from YouTube." });
                        } else {
                          toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL to fetch its thumbnail.", variant: "destructive" });
                        }
                      }}
                    >
                      Fetch YT Thumb
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {block.type === "slider" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onUpdate([...(block.value || []), { image: "", alt: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Add Slider Image
            </Button>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={bulkUploadRef}
              onChange={async (e) => {
                if (!e.target.files || e.target.files.length === 0) return;
                setIsBulkUploading(true);
                try {
                  const newSlides: { image: string; alt: string }[] = [];
                  for (let i = 0; i < e.target.files.length; i++) {
                    const file = e.target.files[i];
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    const cleanedName = baseName.split(/[-_]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                    const { url } = await uploadFile(file);
                    newSlides.push({ image: url, alt: cleanedName });
                  }
                  onUpdate([...(block.value || []), ...newSlides]);
                  toast({ title: "Success", description: `Uploaded ${e.target.files.length} images to slider.` });
                } catch (error) {
                  toast({ title: "Upload failed", description: "Failed to bulk upload images.", variant: "destructive" });
                } finally {
                  setIsBulkUploading(false);
                  if (bulkUploadRef.current) bulkUploadRef.current.value = "";
                }
              }}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isBulkUploading}
              onClick={() => bulkUploadRef.current?.click()}
            >
              {isBulkUploading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <UploadCloud className="h-3 w-3 mr-1" />}
              Bulk Upload
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(block.value || []).map((slide: any, i: number) => (
              <div key={i} className="border border-border/40 p-2 rounded-lg bg-background relative space-y-2">
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full z-10 shadow-sm hover:bg-destructive hover:text-white"
                  onClick={() => onUpdate((block.value || []).filter((_: any, idx: number) => idx !== i))}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
                <ImageUploader
                  value={slide.image}
                  altValue={slide.alt || ""}
                  onAltChange={(alt) => {
                    const newSlides = [...block.value];
                    newSlides[i] = { ...newSlides[i], alt };
                    onUpdate(newSlides);
                  }}
                  onChange={(url, alt) => {
                    const newSlides = [...block.value];
                    newSlides[i] = { ...newSlides[i], image: url, alt: alt || newSlides[i].alt };
                    onUpdate(newSlides);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {block.type === "video" && (
        <div className="space-y-3">
          {/* Multi-URL list */}
          {(Array.isArray(block.value) ? block.value : block.value ? [block.value] : []).map((url: string, vIdx: number) => (
            <div key={vIdx} className="flex gap-2 items-center">
              <Input
                placeholder={`Video URL ${vIdx + 1} (YouTube, Vimeo, Ok.ru)`}
                value={url}
                onChange={(e) => {
                  let val = e.target.value;
                  const iframeMatch = val.match(/<iframe.*?src=["'](.*?)["']/i);
                  if (iframeMatch && iframeMatch[1]) {
                    val = iframeMatch[1];
                    toast({ title: "Iframe Parsed", description: "Extracted URL from iframe code." });
                  }
                  const arr = Array.isArray(block.value) ? [...block.value] : block.value ? [block.value] : [];
                  arr[vIdx] = val;
                  onUpdate(arr);
                }}
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => {
                  const arr = Array.isArray(block.value) ? [...block.value] : block.value ? [block.value] : [];
                  onUpdate(arr.filter((_: string, i: number) => i !== vIdx));
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => {
              const arr = Array.isArray(block.value) ? [...block.value] : block.value ? [block.value] : [];
              onUpdate([...arr, ""]);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Video URL
          </Button>
          {Array.isArray(block.value) && block.value.filter(Boolean).length > 0 && (
            <p className="text-xs text-muted-foreground">
              {block.value.filter(Boolean).length} video{block.value.filter(Boolean).length > 1 ? "s" : ""} — renders as grid-cols-2 on frontend
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ServicesPageEditor({ pageId, initialPageData }: ServicesPageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Page Settings (SEO) state
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<Date | null>(null);

  // Service Items State
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form State
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);

  // Drag and Drop DragActive State
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD Sensors config
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        // The API now returns them ordered by orderIndex
        setItems(data.items || []);
      } else {
        if (res.status === 401) {
          window.location.href = "/sitemanager/login?expired=true";
          return;
        }
        const errText = await res.text();
        console.error("API Error Status:", res.status, errText);
        throw new Error("Failed to fetch Services");
      }
    } catch (error) {
      console.error("Error fetching Services:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load Services. Please try again.",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Sync Slug automatically from Title
  const handleTitleChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, title: val };
      if (!slugManual) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  // Page SEO / Settings Save
  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pageForm.title.trim()) errors.title = "Title is required";
    if (!pageForm.slug.trim()) errors.slug = "Slug is required";
    if (Object.keys(errors).length > 0) {
      setPageErrors(errors);
      return;
    }

    setIsSavingPage(true);
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title,
          slug: pageForm.slug,
          excerpt: pageForm.excerpt,
          content: pageForm.content || "Services Page",
          isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle,
          metaDescription: pageForm.metaDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update page settings");
      }

      setLastSavedPage(new Date());
      toast({
        title: "Success",
        description: "Page settings updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save page settings. Please try again.",
      });
    } finally {
      setIsSavingPage(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch("/api/sitemanager/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pageForm, title: `${pageForm.title} (Copy)`, slug: `${pageForm.slug}-copy`, isPublished: false, duplicateFromId: pageId }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Page duplicated." });
        window.location.href = `/sitemanager/pages/${json.page.id}/edit`;
      } else {
        toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Duplicate failed." });
    }
  };

  // Drag over / Drag leave handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/image") {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid image document.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("type", "uploads");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Parse clean default title from the file name
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanedTitle = baseName
        .split(/[-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setEditingItem(null);
      setSlugManual(false);
      setFormData({
        title: cleanedTitle,
        slug: slugify(cleanedTitle),
        imageUrl: data.url,
        blocks: [],
        isPublished: true,
        metaTitle: cleanedTitle,
        metaDescription: `Service: ${cleanedTitle}`,
        showInSpotlight: true,
        openInNewTab: false,
      });
      setFormErrors({});
      setIsModalOpen(true);

      toast({
        title: "image Uploaded Successfully",
        description: "Configure details to save this release to the catalog.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload the file to servers. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingItem(item);
    setSlugManual(true);
    let cFields = item.customFields as any;
    if (typeof cFields === 'string') {
      try { cFields = JSON.parse(cFields); } catch (e) { cFields = {}; }
    }
    setFormData({
      title: item.title,
      slug: item.slug,
      imageUrl: item.imageUrl || "",
      blocks: cFields?.blocks || [],
      isPublished: item.isPublished,
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      showInSpotlight: !!(item as any).isSpotlight,
      openInNewTab: cFields?.openInNewTab || false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setSlugManual(false);
    setFormData({
      ...defaultFormData,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Modal CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.slug.trim()) errors.slug = "Slug is required";
    if (!/^[a-zA-Z0-9-/_.:?=&]+$/.test(formData.slug)) {
      errors.slug = "Slug contains invalid characters";
    }
    if (!formData.imageUrl) errors.imageUrl = "Main Image is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const isNew = !editingItem;
      const url = isNew ? "/api/admin/services" : `/api/admin/services/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      // If creating new, assign it to the top/bottom order index
      const payload: Record<string, any> = {
        title: formData.title,
        slug: formData.slug,
        imageUrl: formData.imageUrl || null,
        customFields: {
          blocks: formData.blocks,
          openInNewTab: formData.openInNewTab
        },
        isSpotlight: formData.showInSpotlight,
        isPublished: formData.isPublished,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
      };

      if (isNew) {
        // Place new items at the beginning of the list (orderIndex = lowest - 1 or 0)
        const minOrder = items.length > 0 ? Math.min(...items.map(i => i.orderIndex)) : 0;
        payload.orderIndex = minOrder - 1;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save Service");
      }

      toast({
        title: "Success",
        description: `Service ${isNew ? "created" : "updated"} successfully.`,
      });

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save the Service.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingItem(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");

      toast({
        title: "Deleted",
        description: "Service deleted successfully.",
      });

      fetchItems();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete Service. Please try again.",
      });
    }
  };

  // DnD Reorder handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    // Assign incremental orderIndex values for strict layout parity
    const updated = reordered.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    setItems(updated);

    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updated.map(item => ({
            id: item.id,
            orderIndex: item.orderIndex,
          })),
        }),
      });

      if (!res.ok) throw new Error("Reorder save failed");

      toast({
        title: "Order Saved",
        description: "Services grid sequence synchronized.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to save the layout order. Reverting changes...",
      });
      fetchItems(); // Revert back
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-end items-center gap-3">
        <Button onClick={() => document.getElementById("hidden-submit-page-btn")?.click()} disabled={isSavingPage} className="bg-primary text-white hover:bg-primary/95 shadow-sm">
          {isSavingPage ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Update Section
        </Button>
        <Button onClick={handleOpenAddModal} className="bg-primary text-white hover:bg-primary/95 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Release
        </Button>
      </div>

      {/* Hidden form trigger for page save */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="list" variant="default" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="w-4 h-4 mr-2" /> Services Grid
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="w-4 h-4 mr-2" /> Page SEO & Setup
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: List, Uploader & Drag Grid */}
        <TabsContent value="list" className="space-y-6 outline-none">


          {/* Sortable grid container */}
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span>Loading Services...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              {searchQuery ? "No search results match your criteria." : "No Services found. Drop a image file above to add one!"}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map(item => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <SortableCard
                      key={item.id}
                      id={item.id}
                      item={item}
                      onEdit={handleOpenEditModal}
                      onDelete={setDeletingItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

        </TabsContent>

        {/* Tab 2: SEO Settings Tab */}
        <TabsContent value="settings" className="outline-none">
          <form onSubmit={handlePageSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main parameters */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-xl border border-border">
                  <CardHeader>
                    <CardTitle>Page Metadata</CardTitle>
                    <CardDescription>
                      Configure standard page title, path, and excerpt fields.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="page-title">Page Title <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-title"
                          value={pageForm.title}
                          onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                          className={cn(pageErrors.title && "border-destructive")}
                        />
                        {pageErrors.title && <p className="text-xs text-destructive">{pageErrors.title}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page-slug">Url Slug <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-slug"
                          value={pageForm.slug}
                          onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                          className={cn("font-mono", pageErrors.slug && "border-destructive")}
                        />
                        {pageErrors.slug && <p className="text-xs text-destructive">{pageErrors.slug}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="page-excerpt">Brief Excerpt / Summary</Label>
                      <Textarea
                        id="page-excerpt"
                        value={pageForm.excerpt}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-border">
                  <CardHeader>
                    <CardTitle>Search Engine Optimization (SEO)</CardTitle>
                    <CardDescription>
                      Configure search meta keywords and descriptions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-title">Meta Title</Label>
                      <Input
                        id="seo-title"
                        value={pageForm.metaTitle}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="Default is Page Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo-desc">Meta Description</Label>
                      <Textarea
                        id="seo-desc"
                        value={pageForm.metaDescription}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Brief summary for Google search listings"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status and Action Column */}
              <div className="space-y-6">
                <Card className="rounded-xl border border-border">
                  <CardHeader>
                    <CardTitle>Publishing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Page Visibility</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pageForm.isPublished ? "Live on website" : "Saved as draft"}
                        </p>
                      </div>
                      <Switch
                        checked={pageForm.isPublished}
                        onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, isPublished: checked }))}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingPage}
                      className="w-full bg-primary text-white hover:bg-primary/95"
                    >
                      {isSavingPage ? "Saving Configuration..." : "Save Page Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingItem ? "Edit Service Details" : "New Service Details"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-7 h-7 flex items-center justify-center p-0 bg-destructive text-white" onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-white" /></Button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="press-release-form" onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="title">Release Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={cn(formErrors.title && "border-destructive")}
                    placeholder="e.g. Service on Academic Achievements"
                  />
                  {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">URL Slug <span className="text-destructive">*</span></Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="openInNewTab" className="text-xs font-normal">Open in New Tab</Label>
                      <Switch
                        id="openInNewTab"
                        checked={formData.openInNewTab}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, openInNewTab: checked }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugManual(true);
                        setFormData(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      className={cn("font-mono", formErrors.slug && "border-destructive")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSlugManual(false);
                        setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                      }}
                      title="Reset to title slug"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                  {formErrors.slug && <p className="text-xs text-destructive">{formErrors.slug}</p>}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Main Image <span className="text-destructive">*</span></Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="showInSpotlight" className="text-xs font-normal text-foreground">Show in Spotlight</Label>
                        <Switch
                          id="showInSpotlight"
                          checked={formData.showInSpotlight}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInSpotlight: checked }))}
                        />
                      </div>
                    </div>
                    <div className={cn("rounded-xl transition-colors", formErrors.imageUrl && "border border-destructive ring-1 ring-destructive")}>
                      <ImageUploader
                        value={formData.imageUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      />
                    </div>
                    {formErrors.imageUrl && <p className="text-xs text-destructive">{formErrors.imageUrl}</p>}
                  </div>

                  <ServiceBlockBuilder
                    blocks={formData.blocks || []}
                    onChange={(blocks) => setFormData(prev => ({ ...prev, blocks }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/10 mt-6 h-[42px]">
                  <span className="text-sm font-medium">Published Visibility</span>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                </div>

                <div className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-3">
                  <span className="text-sm font-bold text-foreground">SEO Information</span>

                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">SEO Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Defaults to release title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">SEO Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      rows={2}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Brief search snippet description..."
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="press-release-form" className="bg-primary text-white hover:bg-primary/95 hover:text-white">
                {editingItem ? "Save Changes" : "Create Release"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title="Delete Service"
        description={`Are you sure you want to permanently delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deletingItem) handleDeleteItem(deletingItem.id);
        }}
      />

    </div>
  );
}



