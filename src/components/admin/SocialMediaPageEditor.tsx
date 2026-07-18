"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  XCircle,
  Search,
  Settings2,
  FileText,
  Check,
  Loader2,
  Globe,
  ExternalLink,
  Sparkles,
  UploadCloud,
  Layers,
  Palette,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { PageActionBar } from "@/components/admin/PageActionBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";

// DnD Kit Imports
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
  verticalListSortingStrategy,
  rectSortingStrategy,
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
  template: string;
  metaTitle: string;
  metaDescription: string;
  authorName?: string | null;
  updatedAt?: string;
}

interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  themeColor?: string | null;
  anchorTag?: string | null;
  order: number;
  isActive: boolean;
}

interface AccountItem {
  id: string;
  platformId: string;
  title: string;
  url: string;
  imageUrl?: string | null;
  buttonText: string;
  order: number;
  isActive: boolean;
}

interface SocialMediaPageEditorProps {
  pageId: string;
  initialPageData: PageRecord;
}

const defaultAccountForm = {
  platformId: "",
  title: "",
  url: "",
  imageUrl: "",
  buttonText: "Follow",
  isActive: true,
};

const defaultPlatformForm = {
  name: "",
  slug: "",
  iconUrl: "globe",
  anchorTag: "",
  themeColor: "#0d5844",
  isActive: true,
};

// ─── Sortable Card Component for Social Accounts ───────────────────────────
interface SortableAccountCardProps {
  id: string;
  account: AccountItem;
  platformName: string;
  onEdit: (item: AccountItem) => void;
  onDelete: (item: AccountItem) => void;
}

function SortableAccountCard({ id, account, platformName, onEdit, onDelete }: SortableAccountCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      {/* Top Drag Handle Accent */}
      <div
        {...attributes}
        {...listeners}
        className="h-9 bg-muted/40 hover:bg-muted/80 border-b border-border flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        title="Drag to reorder"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
          ⠿ Drag Handle
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col items-center text-center">
        <div className="flex w-full items-center justify-between gap-2 mb-4">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-md",
              account.isActive
                ? "bg-emerald-500/10 text-emerald-600  border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {account.isActive ? "Active" : "Disabled"}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onEdit(account)}
              title="Edit card"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/80"
              onClick={() => onDelete(account)}
              title="Delete card"
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Circular Avatar Preview */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200/80 p-0.5 mb-4 bg-white flex items-center justify-center">
          <img
            src={account.imageUrl || "https://img.icons8.com/color/144/user.png"}
            alt={account.title}
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2 min-h-[2.5rem] flex items-center">
          {account.title}
        </h3>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
          {platformName} Official
        </p>

        <a
          href={account.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs border border-border hover:bg-secondary/80 transition-colors"
        >
          {account.buttonText}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ─── Sortable Platform Row Component ─────────────────────────────────────────
interface SortablePlatformRowProps {
  id: string;
  platform: PlatformItem;
  onEdit: (item: PlatformItem) => void;
  onDelete: (item: PlatformItem) => void;
}

function SortablePlatformRow({ id, platform, onEdit, onDelete }: SortablePlatformRowProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 bg-card border rounded-xl transition-all duration-200",
        isDragging ? "shadow-lg border-primary scale-[1.01]" : "hover:border-border/80"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag handle button */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground p-1"
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Theme Color dot */}
        <div
          className="w-4 h-4 rounded-full border border-black/10"
          style={{ backgroundColor: platform.themeColor || "#ccc" }}
        />

        <div>
          <h4 className="font-bold text-foreground">{platform.name}</h4>
          <p className="text-xs text-muted-foreground font-mono">/{platform.slug} • Icon: {platform.iconUrl}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={platform.isActive ? "default" : "outline"} className={platform.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : ""}>
          {platform.isActive ? "Active" : "Inactive"}
        </Badge>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={() => onEdit(platform)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/80"
            onClick={() => onDelete(platform)}
            title="Delete"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Editor Component ──────────────────────────────────────────────
export default function SocialMediaPageEditor({ pageId, initialPageData }: SocialMediaPageEditorProps) {
  const { toast } = useToast();

  // Page settings state
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<Date | null>(null);

  // Platforms State
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(true);
  const [activePlatformId, setActivePlatformId] = useState("");
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformItem | null>(null);
  const [deletingPlatformItem, setDeletingPlatformItem] = useState<PlatformItem | null>(null);
  const [platformFormData, setPlatformFormData] = useState(defaultPlatformForm);
  const [platformErrors, setPlatformErrors] = useState<Record<string, string>>({});

  // Accounts State
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [deletingAccountItem, setDeletingAccountItem] = useState<AccountItem | null>(null);
  const [accountFormData, setAccountFormData] = useState(defaultAccountForm);
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  // File Upload State
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
    fetchPlatforms();
    fetchAccounts();
  }, []);

  const fetchPlatforms = async () => {
    setIsLoadingPlatforms(true);
    try {
      const res = await fetch("/api/admin/social-platforms");
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.items || []).sort((a: PlatformItem, b: PlatformItem) => a.order - b.order);
        setPlatforms(sorted);
        if (sorted.length > 0 && !activePlatformId) {
          setActivePlatformId(sorted[0].id);
        }
      } else {
        throw new Error("Failed to fetch platforms");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load social platforms.",
      });
    } finally {
      setIsLoadingPlatforms(false);
    }
  };

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch("/api/admin/social-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.items || []);
      } else {
        throw new Error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load social media cards.",
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Re-sync platforms when active ID might be empty
  useEffect(() => {
    if (platforms.length > 0 && !activePlatformId) {
      setActivePlatformId(platforms[0].id);
    }
  }, [platforms, activePlatformId]);

  // Page Settings Save
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
          content: pageForm.content || "Social Media Hub Page",
          template: pageForm.template || "horizontal",
          isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle,
          metaDescription: pageForm.metaDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to update page settings");

      setLastSavedPage(new Date());
      toast({
        title: "Success",
        description: "Page settings Saved Successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save page settings.",
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

  // ─── Platform CRUD Actions ───────────────────────────────────────────────
  const handleOpenAddPlatform = () => {
    setEditingPlatform(null);
    setPlatformFormData(defaultPlatformForm);
    setPlatformErrors({});
    setIsPlatformModalOpen(true);
  };

  const handleOpenEditPlatform = (item: PlatformItem) => {
    setEditingPlatform(item);
    setPlatformFormData({
      name: item.name,
      slug: item.slug,
      iconUrl: item.iconUrl || "globe",
      anchorTag: item.anchorTag || "",
      themeColor: item.themeColor || "#0d5844",
      isActive: item.isActive,
    });
    setPlatformErrors({});
    setIsPlatformModalOpen(true);
  };

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!platformFormData.name.trim()) errors.name = "Name is required";
    if (!platformFormData.slug.trim()) errors.slug = "Slug is required";
    if (!/^[a-zA-Z0-9-/_.:?=&]+$/.test(platformFormData.slug)) {
      errors.slug = "Slug contains invalid characters";
    }

    if (Object.keys(errors).length > 0) {
      setPlatformErrors(errors);
      return;
    }

    try {
      const isNew = !editingPlatform;
      const url = isNew ? "/api/admin/social-platforms" : `/api/admin/social-platforms/${editingPlatform.id}`;
      const method = isNew ? "POST" : "PUT";

      const payload: Record<string, any> = {
        name: platformFormData.name,
        slug: platformFormData.slug,
        iconUrl: platformFormData.iconUrl,
        anchorTag: platformFormData.anchorTag,
        themeColor: platformFormData.themeColor,
        isActive: platformFormData.isActive,
      };

      if (isNew) {
        const maxOrder = platforms.length > 0 ? Math.max(...platforms.map(p => p.order)) : 0;
        payload.order = maxOrder + 1;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save platform");
      }

      toast({
        title: "Success",
        description: `Platform ${isNew ? "created" : "updated"} successfully.`,
      });

      setIsPlatformModalOpen(false);
      fetchPlatforms();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save platform.",
      });
    }
  };

  const handleDeletePlatform = async (id: string) => {
    setDeletingPlatformItem(null);
    try {
      const res = await fetch(`/api/admin/social-platforms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete platform");

      toast({
        title: "Deleted",
        description: "Platform deleted successfully.",
      });

      if (activePlatformId === id) {
        setActivePlatformId("");
      }
      fetchPlatforms();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete platform.",
      });
    }
  };

  const handlePlatformDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = platforms.findIndex(p => p.id === active.id);
    const newIndex = platforms.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(platforms, oldIndex, newIndex);
    const updated = reordered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setPlatforms(updated);

    try {
      const res = await fetch("/api/admin/social-platforms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updated.map(p => ({
            id: p.id,
            orderIndex: p.order,
          })),
        }),
      });

      if (!res.ok) throw new Error("Reorder save failed");

      toast({
        title: "Order Saved",
        description: "Platforms sequence reordered.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to save reordered platforms. Reverting...",
      });
      fetchPlatforms();
    }
  };

  // ─── Social Accounts (Cards) CRUD Actions ─────────────────────────────────
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      ...defaultAccountForm,
      platformId: activePlatformId,
    });
    setAccountErrors({});
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (item: AccountItem) => {
    setEditingAccount(item);
    setAccountFormData({
      platformId: item.platformId,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl || "",
      buttonText: item.buttonText || "Follow",
      isActive: item.isActive,
    });
    setAccountErrors({});
    setIsAccountModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

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
      setAccountFormData(prev => ({
        ...prev,
        imageUrl: data.url,
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!accountFormData.platformId) errors.platformId = "Platform is required";
    if (!accountFormData.title.trim()) errors.title = "Title is required";
    if (!accountFormData.url.trim()) errors.url = "Link URL is required";

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      return;
    }

    try {
      const isNew = !editingAccount;
      const url = isNew ? "/api/admin/social-accounts" : `/api/admin/social-accounts/${editingAccount.id}`;
      const method = isNew ? "POST" : "PUT";

      // Filter cards in the target platform to determine order
      const platformAccounts = accounts.filter(a => a.platformId === accountFormData.platformId);

      const payload: Record<string, any> = {
        platformId: accountFormData.platformId,
        title: accountFormData.title,
        url: accountFormData.url,
        imageUrl: accountFormData.imageUrl || null,
        buttonText: accountFormData.buttonText,
        isActive: accountFormData.isActive,
      };

      if (isNew) {
        const maxOrder = platformAccounts.length > 0 ? Math.max(...platformAccounts.map(a => a.order)) : 0;
        payload.order = maxOrder + 1;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save account");
      }

      toast({
        title: "Success",
        description: `Social card ${isNew ? "added" : "updated"} successfully.`,
      });

      setIsAccountModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save social card.",
      });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setDeletingAccountItem(null);
    try {
      const res = await fetch(`/api/admin/social-accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");

      toast({
        title: "Deleted",
        description: "Social account card deleted.",
      });

      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete card.",
      });
    }
  };

  const handleAccountDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Filter accounts belonging to current active platform tab
    const platformAccounts = accounts.filter(a => a.platformId === activePlatformId);

    const oldIndex = platformAccounts.findIndex(a => a.id === active.id);
    const newIndex = platformAccounts.findIndex(a => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(platformAccounts, oldIndex, newIndex);
    const updatedSub = reordered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    // Merge reordered subset back into the full accounts list state
    const newFullAccounts = accounts.map(a => {
      const subItem = updatedSub.find(us => us.id === a.id);
      return subItem ? subItem : a;
    });

    setAccounts(newFullAccounts);

    try {
      const res = await fetch("/api/admin/social-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updatedSub.map(a => ({
            id: a.id,
            orderIndex: a.order,
          })),
        }),
      });

      if (!res.ok) throw new Error("Reorder save failed");

      toast({
        title: "Order Saved",
        description: "Social media card sequence synchronized.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to save card positions. Reverting...",
      });
      fetchAccounts();
    }
  };

  // Get active accounts for active platform tab
  const activeAccounts = accounts.filter(a => a.platformId === activePlatformId);
  const activePlatformName = platforms.find(p => p.id === activePlatformId)?.name || "Selected";

  return (
    <div className="space-y-6 max-w-7xl">
      <PageActionBar
        mode="edit"
        title={pageForm.title}
        authorName={initialPageData.authorName}
        updatedAt={initialPageData.updatedAt}
        lastSaved={lastSavedPage}
        previewUrl="/social-media"
        seoUrl={`/sitemanager/pages/${pageId}/edit/seo`}
        isPublished={pageForm.isPublished}
        saving={isSavingPage}
        onDuplicate={handleDuplicate}
        onSaveDraft={() => {
          setPageForm({ ...pageForm, isPublished: false });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
        onPublish={() => {
          setPageForm({ ...pageForm, isPublished: true });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
      />

      {/* Hidden button for triggering page save since the action bar is outside the form */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="cards" variant="default" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cards">
            <Layers className="w-4 h-4 mr-2" /> Social Cards
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <Palette className="w-4 h-4 mr-2" /> Platform Tabs
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="w-4 h-4 mr-2" /> Page SEO
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Dynamic Card grid inside platform tabs */}
        <TabsContent value="cards" className="space-y-6 outline-none">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left Sidebar - Platform Switchers */}
            <div className="w-full lg:w-64 shrink-0 space-y-2">
              <Card className="rounded-xl border border-border">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Platforms</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {isLoadingPlatforms ? (
                    <div className="flex items-center justify-center p-6 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : platforms.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-4 text-center">No platforms yet.</p>
                  ) : (
                    platforms.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => setActivePlatformId(platform.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between",
                          activePlatformId === platform.id
                            ? "bg-primary text-white shadow-md"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span>{platform.name}</span>
                        <span className="text-xs font-normal opacity-70">
                          ({accounts.filter(a => a.platformId === platform.id).length})
                        </span>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Main Grid - Accounts List */}
            <div className="flex-1 space-y-4">
              <Card className="rounded-xl border border-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border bg-muted/10">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      {activePlatformName} Cards
                    </CardTitle>
                    <CardDescription>
                      Drag & Drop to rearrange the sequence of {activePlatformName} handles.
                    </CardDescription>
                  </div>
                  <Button
                    disabled={!activePlatformId}
                    onClick={handleOpenAddAccount}
                    className="bg-primary text-white hover:bg-primary/95"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Social Card
                  </Button>
                </CardHeader>

                <CardContent className="p-6">
                  {isLoadingAccounts ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span>Loading Social Media...</span>
                    </div>
                  ) : activeAccounts.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                      No handles registered under {activePlatformName}. Click "Add Social Card" to insert one!
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleAccountDragEnd}
                    >
                      <SortableContext
                        items={activeAccounts.map(a => a.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {activeAccounts.map((account) => (
                            <SortableAccountCard
                              key={account.id}
                              id={account.id}
                              account={account}
                              platformName={activePlatformName}
                              onEdit={handleOpenEditAccount}
                              onDelete={setDeletingAccountItem}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* Tab 2: Platforms Management */}
        <TabsContent value="platforms" className="space-y-6 outline-none">
          <Card className="rounded-xl border border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border bg-muted/10">
              <div>
                <CardTitle className="text-xl font-bold">Platform Tabs</CardTitle>
                <CardDescription>
                  Manage the tabs shown at the top of the social media page. Reorder them below.
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddPlatform} className="bg-primary text-white hover:bg-primary/95">
                <Plus className="w-4 h-4 mr-2" /> Add Platform Tab
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingPlatforms ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Loading platform tabs...</span>
                </div>
              ) : platforms.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                  No platforms created. Create one to enable tabs!
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePlatformDragEnd}
                >
                  <SortableContext
                    items={platforms.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 max-w-3xl">
                      {platforms.map(platform => (
                        <SortablePlatformRow
                          key={platform.id}
                          id={platform.id}
                          platform={platform}
                          onEdit={handleOpenEditPlatform}
                          onDelete={setDeletingPlatformItem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Standard Page Settings Tab */}
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
                      <Label htmlFor="page-excerpt">Short Description (Excerpt)</Label>
                      <Input
                        id="page-excerpt"
                        value={pageForm.excerpt}
                        onChange={(e) => setPageForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SEO parameters */}
              <div className="space-y-6">
                <Card className="rounded-xl border border-border bg-muted/10">
                  <CardHeader>
                    <CardTitle className="text-lg">SEO optimization</CardTitle>
                    <CardDescription>Configure tags and canonical properties</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input
                        id="meta-title"
                        value={pageForm.metaTitle}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder={pageForm.title}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta-desc">Meta Description</Label>
                      <textarea
                        id="meta-desc"
                        rows={3}
                        value={pageForm.metaDescription}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full bg-background border border-input rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 pt-4 border-t border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="page-layout">Layout Orientation</Label>
                        <p className="text-xs text-muted-foreground">Horizontal vs Vertical Left-Tabs</p>
                      </div>
                      <select
                        id="page-layout"
                        value={pageForm.template || "horizontal"}
                        onChange={(e) => setPageForm(prev => ({ ...prev, template: e.target.value }))}
                        className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="horizontal">Horizontal View</option>
                        <option value="vertical">Vertical View</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-2 pt-4 border-t border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="page-status">Published status</Label>
                        <p className="text-xs text-muted-foreground">Toggle public access</p>
                      </div>
                      <Switch
                        id="page-status"
                        checked={pageForm.isPublished}
                        onCheckedChange={(val) => setPageForm(prev => ({ ...prev, isPublished: val }))}
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

      {/* CRUD Account Card Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {editingAccount ? "Edit Social Account" : "Add New Social Account"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsAccountModalOpen(false)}>×</Button>
            </div>

            <div className="overflow-y-auto p-5 flex-1">
              <form onSubmit={handleAccountSubmit} className="space-y-4">

                {/* Platform select dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="acc-platform">Platform <span className="text-destructive">*</span></Label>
                  <select
                    id="acc-platform"
                    value={accountFormData.platformId}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, platformId: e.target.value }))}
                    className="w-full bg-background border border-input rounded-xl p-2.5 text-sm"
                  >
                    <option value="">Select Platform</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {accountErrors.platformId && <p className="text-xs text-destructive">{accountErrors.platformId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acc-title">Account / Card Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="acc-title"
                    required
                    value={accountFormData.title}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Dr. Israr Ahmed Complete Lectures"
                  />
                  {accountErrors.title && <p className="text-xs text-destructive">{accountErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acc-url">Redirect URL (Link) <span className="text-destructive">*</span></Label>
                  <Input
                    id="acc-url"
                    required
                    value={accountFormData.url}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g. https://www.youtube.com/user/drisrar احمد"
                  />
                  {accountErrors.url && <p className="text-xs text-destructive">{accountErrors.url}</p>}
                </div>

                {/* Cover Image Upload field */}
                <div className="space-y-2">
                  <Label>Avatar / Profile Image</Label>
                  <div className="flex items-center gap-4 border border-border p-3.5 rounded-xl bg-muted/10">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-border bg-white flex items-center justify-center">
                      <img
                        src={accountFormData.imageUrl || "https://img.icons8.com/color/144/user.png"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                            Upload Image
                          </>
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <p className="text-[10px] text-muted-foreground">PNG, JPG, or WEBP. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acc-btn">Button Text</Label>
                    <Input
                      id="acc-btn"
                      value={accountFormData.buttonText}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="e.g. Follow, Subscribe"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 pt-6 border-t border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="acc-active" className="text-xs">Active Card</Label>
                      <p className="text-[10px] text-muted-foreground">Show in frontend</p>
                    </div>
                    <Switch
                      id="acc-active"
                      checked={accountFormData.isActive}
                      onCheckedChange={(val) => setAccountFormData(prev => ({ ...prev, isActive: val }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAccount ? "Save Card" : "Add Card"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Platform Modal */}
      {isPlatformModalOpen && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl relative overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {editingPlatform ? "Edit Platform Tab" : "Add Platform Tab"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsPlatformModalOpen(false)}>×</Button>
            </div>

            <div className="p-5">
              <form onSubmit={handlePlatformSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="plat-name">Platform Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="plat-name"
                    required
                    value={platformFormData.name}
                    onChange={(e) => {
                      setPlatformFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug ? prev.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                      }));
                    }}
                    placeholder="e.g. YouTube, SoundCloud"
                  />
                  {platformErrors.name && <p className="text-xs text-destructive">{platformErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plat-slug">Tab Slug <span className="text-destructive">*</span></Label>
                  <Input
                    id="plat-slug"
                    required
                    value={platformFormData.slug}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. youtube, soundcloud"
                    className="font-mono text-xs"
                  />
                  {platformErrors.slug && <p className="text-xs text-destructive">{platformErrors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plat-anchor">Optional Anchor Tag</Label>
                  <Input
                    id="plat-anchor"
                    value={platformFormData.anchorTag || ""}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, anchorTag: e.target.value }))}
                    placeholder="e.g. youtube (leave blank to use slug)"
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Used for #hashtag linking. If empty, the slug will be used.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plat-icon">Icon Key</Label>
                    <select
                      id="plat-icon"
                      value={platformFormData.iconUrl || "globe"}
                      onChange={(e) => setPlatformFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                      className="w-full bg-background border border-input rounded-xl p-2.5 text-xs"
                    >
                      <option value="globe">Globe (Default)</option>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="soundcloud">SoundCloud</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="rumble">Rumble</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plat-color">Theme Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="plat-color"
                        type="color"
                        value={platformFormData.themeColor || "#0d5844"}
                        onChange={(e) => setPlatformFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="w-12 h-10 p-1 cursor-pointer shrink-0 border"
                      />
                      <Input
                        value={platformFormData.themeColor || "#0d5844"}
                        onChange={(e) => setPlatformFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="font-mono text-xs uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 border-t border-border pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="plat-active" className="text-xs">Tab Active</Label>
                    <p className="text-[10px] text-muted-foreground">Show in frontend page</p>
                  </div>
                  <Switch
                    id="plat-active"
                    checked={platformFormData.isActive}
                    onCheckedChange={(val) => setPlatformFormData(prev => ({ ...prev, isActive: val }))}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsPlatformModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPlatform ? "Save Changes" : "Create Platform"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!deletingPlatformItem}
        onOpenChange={(open) => !open && setDeletingPlatformItem(null)}
        onConfirm={() => { if (deletingPlatformItem) handleDeletePlatform(deletingPlatformItem.id); }}
        title="Delete Platform Tab?"
        description={`This will permanently delete the "${deletingPlatformItem?.name}" platform tab and remove all associated cards. This action is irreversible.`}
      />

      <ConfirmDialog
        open={!!deletingAccountItem}
        onOpenChange={(open) => !open && setDeletingAccountItem(null)}
        onConfirm={() => { if (deletingAccountItem) handleDeleteAccount(deletingAccountItem.id); }}
        title="Delete Social Card?"
        description={`Are you sure you want to delete the card for "${deletingAccountItem?.title}"?`}
      />

    </div>
  );
}
