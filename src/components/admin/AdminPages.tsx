"use client";

import { useState, useEffect } from "react";
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
  const { toast } = useToast();

  const isGenericSection = ["posts", "audio", "videos", "books", "team", "events"].includes(section);

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

  // Pages Section
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

    return (
      <ContentList
        title="Pages"
        description="Manage website pages"
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug" },
          {
            key: "status",
            header: "Status",
            render: (item: any) => (
              <Badge variant={item.isPublished ? "default" : "secondary"}>
                {item.isPublished ? "Published" : "Draft"}
              </Badge>
            ),
          },
          {
            key: "updatedAt",
            header: "Updated",
            render: (item: any) => new Date(item.updatedAt || new Date()).toLocaleDateString()
          },
        ]}
        data={data}
        onAdd={() => setEditingId("new")}
        onEdit={(item: any) => setEditingId(String(item.id))}
        onDelete={handleDeletePage}
      />
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
      if (section === "books") columns.push({ key: "author", header: "Author" });
      if (section === "audio" || section === "videos" || section === "posts") columns.push({ key: "category", header: "Category" });
      
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
