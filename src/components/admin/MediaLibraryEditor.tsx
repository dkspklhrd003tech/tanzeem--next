"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, PlaySquare, Save, RefreshCw, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { MediaCategoryManager } from "./MediaCategoryManager";
import PageSeoManager from "./PageSeoManager";

export default function MediaLibraryEditor({ pageId, initialPageData, mediaType }: { pageId: string, initialPageData: PageRecord, mediaType: "audio" | "video" }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);

  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPage(true);
    try {
      await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title, slug: pageForm.slug, excerpt: pageForm.excerpt,
          content: pageForm.content, isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle, metaDescription: pageForm.metaDescription,
        }),
      });
      toast({ title: "Saved", description: "Page settings updated." });
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to save settings." }); }
    finally { setIsSavingPage(false); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => window.history.back()} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {pageForm.title}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage {mediaType === "audio" ? "audio files, categories, and sub-categories" : "video files, categories, and sub-categories"}.
          </p>
        </div>
      </div>

      <Tabs defaultValue="library" variant="default" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">
            <PlaySquare className="w-4 h-4 mr-2" /> {mediaType === "audio" ? "Audio Library" : "Video Library"}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="w-4 h-4 mr-2" /> Page Setup & SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <MediaCategoryManager mediaType={mediaType} />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <PageSeoManager pageId={pageId} hideHeader={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
