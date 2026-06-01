"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dashboard } from "./Dashboard";
import { ContentList } from "./ContentList";
import { ContentEditor } from "./ContentEditor";
import { MediaLibrary } from "./MediaLibrary";
import { MenuList } from "./MenuList";
import { UserManagement } from "./UserManagement";
import { HomeSlidersManagement } from "./HomeSlidersManagement";
import { HomepageManager } from "./HomepageManager";
import { DarseQuranManager } from "./DarseQuranManager";
import { SettingsManager } from "./SettingsManager";
import { SocialMediaManager } from "./SocialMedia/SocialMediaManager";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Globe,
  Calendar,
} from "lucide-react";

import { GlobalBannerManager } from "./GlobalBannerManager";
import { SiteIdentityManager } from "./SiteIdentityManager";
import { FooterManager } from "./FooterManager";
import { SEOManager } from "./SEOManager";

interface AdminPagesProps {
  section: string;
}

export function AdminPages({ section }: AdminPagesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const [deletingPage, setDeletingPage] = useState<any | null>(null);
  const { toast } = useToast();

  const isGenericSection = [
    "posts",
    "audio",
    "videos",
    "books",
    "team",
    "events",
    "press-releases",
    "magazines",
    "campaigns",
    "locations",
  ].includes(section);

  useEffect(() => {
    if (section === "pages") {
      fetchPages();
    } else if (isGenericSection) {
      fetchGenericData(section);
    }
  }, [section]);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const json = await res.json();
        setData(json.pages || []);
      }
    } catch (error) {
      console.error("Failed to load pages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenericData = async (entity: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/${entity}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.items || []);
      }
    } catch (error) {
      console.error(`Failed to load ${entity}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePage = async (pageData: Record<string, unknown>) => {
    try {
      const isNew = editingId === "new";

      const url = isNew ? "/api/pages" : `/api/pages/${editingId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save page");
      }

      toast({
        title: "Success",
        description: `Page ${isNew ? "created" : "updated"} successfully.`,
      });

      setEditingId(null);
      fetchPages();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save page. Please try again.",
      });
    }
  };

  const handleDeletePage = async (item: any) => {
    try {
      const res = await fetch(`/api/pages/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete page");

      toast({
        title: "Success",
        description: "Page deleted successfully.",
      });

      fetchPages();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete page. Please try again.",
      });
    }
  };

  const handleSaveGeneric = async (itemData: Record<string, unknown>) => {
    try {
      const isNew = editingId === "new";

      const url = isNew ? `/api/admin/${section}` : `/api/admin/${section}/${editingId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!res.ok) throw new Error(`Failed to save ${section}`);

      toast({
        title: "Success",
        description: `Item ${isNew ? "created" : "updated"} successfully.`,
      });

      setEditingId(null);
      fetchGenericData(section);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save ${section}. Please try again.`,
      });
    }
  };

  const handleDeleteGeneric = async (item: any) => {
    try {
      const res = await fetch(`/api/admin/${section}/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete ${section}`);

      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });

      fetchGenericData(section);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete ${section}. Please try again.`,
      });
    }
  };

  // Dashboard
  if (section === "dashboard" || !section) {
    return <Dashboard />;
  }

  // Homepage Setup Section
  if (section === "homepage") {
    return <HomepageManager />;
  }

  // Dars-e-Quran Section
  if (section === "darse-quran") {
    return <DarseQuranManager />;
  }

  // Pages Section — Smart Card Grid
  if (section === "pages") {
    if (editingId) {
      return (
        <ContentEditor
          title={editingId === "new" ? "New Page" : "Edit Page"}
          contentType="page"
          initialData={editingId === "new" ? undefined : data.find(p => String(p.id) === editingId)}
          onSave={handleSavePage}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    const filteredPages = data.filter((page) =>
      (page.title || "").toLowerCase().includes(pageSearch.toLowerCase()) ||
      (page.slug || "").toLowerCase().includes(pageSearch.toLowerCase())
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Pages</h1>
            <p className="text-sm text-foreground-muted mt-1">Manage website pages</p>
          </div>
          <Button
            onClick={() => setEditingId("new")}
            className="bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search pages..."
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Card Grid */}
        {filteredPages.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-foreground-muted">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No pages found</p>
              <p className="text-sm mt-1">Create a new page to get started.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setEditingId(String(page.id))}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30 hover:-translate-y-1"
              >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary-light" />

                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {page.title || "Untitled"}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(String(page.id)); }}
                        className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5 text-primary" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingPage(page); }}
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Slug */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-foreground-muted">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">/{page.slug || "—"}</span>
                  </div>

                  {/* Footer: Status + Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <Badge variant={page.isPublished ? "default" : "secondary"} className="text-xs">
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(page.updatedAt || new Date()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingPage}
          onOpenChange={(isOpen) => !isOpen && setDeletingPage(null)}
          title="Delete Page"
          description="Are you sure you want to delete this page? This action cannot be undone."
          onConfirm={() => {
            if (deletingPage) handleDeletePage(deletingPage);
            setDeletingPage(null);
          }}
        />
      </motion.div>
    );
  }

  // Menus Section
  if (section === "menus") {
    return <MenuList />;
  }

  // Generic Sections handling via ContentList
  if (isGenericSection) {
      if (editingId) {
        return (
          <ContentEditor
            title={editingId === "new" ? `New ${section}` : `Edit ${section}`}
            contentType={section}
            initialData={editingId === "new" ? undefined : data.find(p => String(p.id) === editingId)}
            onSave={handleSaveGeneric}
            onCancel={() => setEditingId(null)}
          />
        );
      }

      // Column mappings for generic sections
      let columns: any[] = [{ key: "title", header: "Title" }];
      if (section === "team") columns = [{ key: "name", header: "Name" }, { key: "designation", header: "Designation" }];
      if (section === "events") columns = [{ key: "title", header: "Title" }, { key: "date", header: "Date" }, { key: "location", header: "Location" }];
      if (section === "books") columns.push({ key: "authorName", header: "Author" });
      if (section === "audio" || section === "videos" || section === "posts") columns.push({ key: "category", header: "Category" });
      if (section === "press-releases") columns = [{ key: "title", header: "Title" }, { key: "slug", header: "Slug" }];
      if (section === "magazines") columns = [{ key: "title", header: "Title" }, { key: "issueNumber", header: "Issue" }];
      if (section === "campaigns") columns = [{ key: "title", header: "Title" }, { key: "isActive", header: "Active" }];
      if (section === "locations") columns = [{ key: "name", header: "Name" }, { key: "city", header: "City" }];
      
      columns.push({
          key: "status",
          header: "Status",
          render: (item: any) => (
            <Badge variant={item.status === "published" || item.status === "active" ? "default" : "secondary"}>
              {item.status || "draft"}
            </Badge>
          ),
      });

      return (
        <ContentList
          title={section.charAt(0).toUpperCase() + section.slice(1)}
          description={`Manage ${section} content`}
          columns={columns}
          data={data}
          onAdd={() => setEditingId("new")}
          onEdit={(item: any) => setEditingId(String(item.id))}
          onDelete={handleDeleteGeneric}
        />
      );
  }

  // Settings Section
  if (section === "settings") {
    return <SettingsManager />;
  }

  // Global Banner Section
  if (section === "banner") {
    return <GlobalBannerManager />;
  }

  // Site Identity Section
  if (section === "identity") {
    return <SiteIdentityManager />;
  }

  // Footer Section
  if (section === "footer") {
    return <FooterManager />;
  }

  // SEO Section
  if (section === "seo") {
    return <SEOManager />;
  }

  // Social Media Hub Section
  if (section === "social-media") {
    return <SocialMediaManager />;
  }

  // Users Section
  if (section === "users") {
    return <UserManagement />;
  }

  // Media Section
  if (section === "media") {
    return <MediaLibrary />;
  }

  // Default: Coming Soon
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </h2>
        <p className="text-foreground-muted">
          This section is coming soon...
        </p>
      </div>
    </div>
  );
}
