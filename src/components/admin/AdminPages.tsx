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
import { Badge } from "@/components/ui/badge";

// Mock data - in real app, this would come from API
const mockPages = [
  { id: "1", title: "About Us", slug: "about-us", status: "published", updatedAt: "2024-01-15" },
  { id: "2", title: "Contact", slug: "contact", status: "published", updatedAt: "2024-01-10" },
  { id: "3", title: "Our Mission", slug: "our-mission", status: "published", updatedAt: "2024-01-05" },
  { id: "4", title: "FAQ", slug: "faq", status: "draft", updatedAt: "2024-01-01" },
];

const mockPosts = [
  { id: "1", title: "Understanding Islamic Finance", slug: "understanding-islamic-finance", category: "Articles", status: "published", views: 1250, updatedAt: "2024-01-15" },
  { id: "2", title: "The Importance of Education", slug: "importance-of-education", category: "Articles", status: "published", views: 890, updatedAt: "2024-01-10" },
  { id: "3", title: "Ramadan Preparation Guide", slug: "ramadan-preparation", category: "Guides", status: "draft", views: 0, updatedAt: "2024-01-05" },
];

const mockAudio = [
  { id: "1", title: "The Concept of Khilafah", speaker: "Dr. Israr Ahmed", category: "Lectures", duration: "45:30", plays: 12500, status: "published" },
  { id: "2", title: "Understanding the Quran", speaker: "Dr. Israr Ahmed", category: "Tafseer", duration: "38:45", plays: 8900, status: "published" },
  { id: "3", title: "Friday Sermon: Unity", speaker: "Dr. Israr Ahmed", category: "Sermons", duration: "25:00", plays: 5000, status: "published" },
];

const mockVideos = [
  { id: "1", title: "Documentary: Journey of Islam", category: "Documentary", duration: "1:24:30", views: 45000, status: "published" },
  { id: "2", title: "Lecture Series: Islamic History", category: "Lectures", duration: "58:45", views: 32500, status: "published" },
  { id: "3", title: "Workshop: Quran Study Methods", category: "Workshop", duration: "1:15:00", views: 18000, status: "published" },
];

const mockBooks = [
  { id: "1", title: "The Islamic State", author: "Dr. Israr Ahmed", category: "Politics", language: "English", pages: 256, downloads: 15000, status: "published" },
  { id: "2", title: "Methodology of Dawah", author: "Dr. Israr Ahmed", category: "Dawah", language: "Urdu", pages: 180, downloads: 12000, status: "published" },
  { id: "3", title: "Understanding Seerah", author: "Dr. Israr Ahmed", category: "Seerah", language: "English", pages: 320, downloads: 8500, status: "published" },
];

const mockTeam = [
  { id: "1", name: "Dr. Israr Ahmed", designation: "Founder & Ameer", department: "Leadership", status: "active" },
  { id: "2", name: "Hafiz Abdullah", designation: "Secretary General", department: "Administration", status: "active" },
  { id: "3", name: "Maulana Yusuf", designation: "Education Director", department: "Education", status: "active" },
];

const mockEvents = [
  { id: "1", title: "Annual Conference 2024", date: "2024-03-15", location: "Lahore", attendees: 500, status: "upcoming" },
  { id: "2", title: "Quran Study Circle", date: "2024-02-20", location: "Online", attendees: 120, status: "upcoming" },
  { id: "3", title: "Youth Workshop", date: "2024-01-10", location: "Karachi", attendees: 85, status: "completed" },
];

interface AdminPagesProps {
  section: string;
}

export function AdminPages({ section }: AdminPagesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (section === "pages") {
      fetchPages();
    }
  }, [section]);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error("Failed to load pages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePage = async (data: Record<string, unknown>) => {
    try {
      const isNew = editingId === "new";
      const url = isNew ? "/api/pages" : `/api/pages/${editingId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save page");

      setEditingId(null);
      fetchPages();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save page. Please try again.");
    }
  };

  const handleDeletePage = async (item: any) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/pages/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete page");

      fetchPages();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete page. Please try again.");
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
          initialData={editingId === "new" ? undefined : pages.find(p => p.id === editingId)}
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
        data={pages}
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

  // Posts Section
  if (section === "posts") {
    return (
      <ContentList
        title="Posts"
        description="Manage blog posts and articles"
        columns={
          [
            { key: "title", header: "Title" },
            { key: "category", header: "Category" },
            {
              key: "status",
              header: "Status",
              render: (item) => (
                <Badge variant={item.status === "published" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              ),
            },
            { key: "views", header: "Views" },
            { key: "updatedAt", header: "Updated" },
          ]}
        data={mockPosts}
        onAdd={() => console.log("Add post")
        }
        onEdit={(item) => console.log("Edit:", item)
        }
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Audio Section
  if (section === "audio") {
    return (
      <ContentList
        title="Audio Lectures"
        description="Manage audio content"
        columns={[
          { key: "title", header: "Title" },
          { key: "speaker", header: "Speaker" },
          { key: "category", header: "Category" },
          { key: "duration", header: "Duration" },
          { key: "plays", header: "Plays" },
        ]}
        data={mockAudio}
        onAdd={() => console.log("Add audio")}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Videos Section
  if (section === "videos") {
    return (
      <ContentList
        title="Videos"
        description="Manage video content"
        columns={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "duration", header: "Duration" },
          { key: "views", header: "Views" },
        ]}
        data={mockVideos}
        onAdd={() => console.log("Add video")}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Books Section
  if (section === "books") {
    return (
      <ContentList
        title="Books"
        description="Manage book publications"
        columns={[
          { key: "title", header: "Title" },
          { key: "author", header: "Author" },
          { key: "language", header: "Language" },
          { key: "pages", header: "Pages" },
          { key: "downloads", header: "Downloads" },
        ]}
        data={mockBooks}
        onAdd={() => console.log("Add book")}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Team Section
  if (section === "team") {
    return (
      <ContentList
        title="Team Members"
        description="Manage team and leadership"
        columns={[
          { key: "name", header: "Name" },
          { key: "designation", header: "Designation" },
          { key: "department", header: "Department" },
          {
            key: "status",
            header: "Status",
            render: (item) => (
              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            ),
          },
        ]}
        data={mockTeam}
        onAdd={() => console.log("Add member")}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Events Section
  if (section === "events") {
    return (
      <ContentList
        title="Events"
        description="Manage events and gatherings"
        columns={[
          { key: "title", header: "Title" },
          { key: "date", header: "Date" },
          { key: "location", header: "Location" },
          { key: "attendees", header: "Attendees" },
          {
            key: "status",
            header: "Status",
            render: (item) => (
              <Badge variant={item.status === "upcoming" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            ),
          },
        ]}
        data={mockEvents}
        onAdd={() => console.log("Add event")}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(item) => console.log("Delete:", item)}
      />
    );
  }

  // Settings Section
  if (section === "settings") {
    return <SettingsManager />;
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


