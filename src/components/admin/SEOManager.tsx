"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Hash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function SEOManager() {
  const [settings, setSettings] = useState({
    global_meta_title_suffix: "| Tanzeem-e-Islami",
    global_meta_description: "Tanzeem-e-Islami Is Working To Re-establish / Re-instate Khilafah By Following The Methodology Of Prophet Muhammad (SAWS)",
    og_image_default: "",
    google_analytics_id: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings.seo) {
          const safe = Object.fromEntries(Object.entries(data.settings.seo).filter(([, v]) => v != null));
          setSettings((prev) => ({ ...prev, ...safe }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch SEO settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "seo",
          settings,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "SEO Settings Saved",
        description: "Global SEO defaults have been updated.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save SEO settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO / Meta Management</h1>
          <p className="text-foreground-muted mt-1">Configure global search engine defaults and tracking IDs.</p>
        </div>
        <ConfirmDialog
          title="Save SEO Defaults"
          description="Are you sure you want to update the global SEO settings? These will apply to all pages that don't have custom meta tags."
          onConfirm={handleSave}
        >
          <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] rounded-xl px-8">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Defaults
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Defaults</CardTitle>
            <CardDescription>These are used when per-page overrides are missing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title Suffix</Label>
              <Input
                value={settings.global_meta_title_suffix}
                onChange={(e) => setSettings({ ...settings, global_meta_title_suffix: e.target.value })}
                placeholder="| Site Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Meta Description</Label>
              <Textarea
                value={settings.global_meta_description}
                onChange={(e) => setSettings({ ...settings, global_meta_description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default OG Image URL</Label>
              <Input
                value={settings.og_image_default}
                onChange={(e) => setSettings({ ...settings, og_image_default: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Google Analytics ID</Label>
              <Input
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Hash className="w-5 h-5" /> Per-Page Overrides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted mb-4">
            You can override these defaults for individual pages by editing the page and expanding the "SEO Settings" card in the sidebar.
          </p>
          <Link href="/sitemanager/pages">
            <Button variant="outline" className="gap-2">
              Go to Pages <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
