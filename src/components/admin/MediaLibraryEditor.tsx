"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, PlaySquare, Save, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { MediaCategoryManager } from "./MediaCategoryManager";

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
          metaTitle: pageForm.metaTitle, metaDescription: pageForm.metaDescription, metaKeywords: pageForm.metaKeywords,
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

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="library" className="px-4 py-2">
            <PlaySquare className="w-4 h-4 mr-2" /> {mediaType === "audio" ? "Audio Library" : "Video Library"}
          </TabsTrigger>
          <TabsTrigger value="settings" className="px-4 py-2">
            <Settings2 className="w-4 h-4 mr-2" /> Page Setup & SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <MediaCategoryManager mediaType={mediaType} />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <form onSubmit={handlePageSave} className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader><CardTitle>Page Setup & SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} /></div>
                
                <div className="pt-4 space-y-4 border-t border-border mt-4">
                  <h4 className="font-semibold text-sm">SEO Meta Data</h4>
                  <div className="space-y-2"><Label>Meta Title</Label><Input value={pageForm.metaTitle || ""} onChange={e => setPageForm({ ...pageForm, metaTitle: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Meta Description</Label><Input value={pageForm.metaDescription || ""} onChange={e => setPageForm({ ...pageForm, metaDescription: e.target.value })} /></div>
                </div>

                <Button type="submit" disabled={isSavingPage} className="w-full mt-4">
                  {isSavingPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
