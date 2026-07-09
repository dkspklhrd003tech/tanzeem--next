"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { resolveMediaUrl } from "@/lib/utils";

export function GlobalBannerManager() {
  const [settings, setSettings] = useState<Record<string, any>>({
    banner_bg_image: "",
    banner_overlay_color: "#005031",
    banner_overlay_opacity: "0.7",
    banner_text_color: "#ffffff",
    banner_height: "350px",
    banner_breadcrumb_separator: "›",
    banner_show_breadcrumbs: true,
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
        if (data.settings.global_banner) {
          const s = data.settings.global_banner;
          setSettings({
            banner_bg_image: s.banner_bg_image || "",
            banner_overlay_color: s.banner_overlay_color || "#005031",
            banner_overlay_opacity: s.banner_overlay_opacity || "0.7",
            banner_text_color: s.banner_text_color || "#ffffff",
            banner_height: s.banner_height || "350px",
            banner_breadcrumb_separator: s.banner_breadcrumb_separator || "›",
            banner_show_breadcrumbs: s.banner_show_breadcrumbs === "true",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch banner settings", err);
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
          group: "global_banner",
          settings: {
            ...settings,
            banner_show_breadcrumbs: String(settings.banner_show_breadcrumbs),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Settings Saved",
        description: "Global banner configuration has been updated.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save banner settings.",
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
          <h1 className="text-3xl font-bold tracking-tight">Global Page Banner</h1>
          <p className="text-foreground-muted mt-1">Configure the appearance of the automatic banner used on all sub-pages.</p>
        </div>
        <ConfirmDialog
          title="Save Banner Configuration"
          description="Are you sure you want to update the global page banner settings? This will affect all sub-pages on the site."
          onConfirm={handleSave}
        >
          <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] rounded-xl px-8">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Configuration
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visual Appearance</CardTitle>
            <CardDescription>Background and overlay settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Background Image</Label>
              <ImageUploader 
                value={settings.banner_bg_image} 
                onChange={(url) => setSettings({ ...settings, banner_bg_image: url })} 
                aspectRatio={21 / 9}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Overlay Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={settings.banner_overlay_color} 
                    onChange={(e) => setSettings({ ...settings, banner_overlay_color: e.target.value })}
                    className="w-12 p-1 h-10"
                  />
                  <Input 
                    value={settings.banner_overlay_color} 
                    onChange={(e) => setSettings({ ...settings, banner_overlay_color: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Overlay Opacity (0-1)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="1" 
                  value={settings.banner_overlay_opacity} 
                  onChange={(e) => setSettings({ ...settings, banner_overlay_opacity: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography & Layout</CardTitle>
            <CardDescription>Text and breadcrumb configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <Input 
                  type="color" 
                  value={settings.banner_text_color} 
                  onChange={(e) => setSettings({ ...settings, banner_text_color: e.target.value })}
                  className="w-full p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Height</Label>
                <Input 
                  value={settings.banner_height} 
                  onChange={(e) => setSettings({ ...settings, banner_height: e.target.value })}
                  placeholder="350px or 40vh"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Breadcrumb Separator</Label>
              <Input 
                value={settings.banner_breadcrumb_separator} 
                onChange={(e) => setSettings({ ...settings, banner_breadcrumb_separator: e.target.value })}
                maxLength={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label>Show Breadcrumbs</Label>
                <p className="text-xs text-foreground-muted">Enable or disable breadcrumb trail globally.</p>
              </div>
              <Switch 
                checked={settings.banner_show_breadcrumbs} 
                onCheckedChange={(checked) => setSettings({ ...settings, banner_show_breadcrumbs: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="relative w-full rounded-xl overflow-hidden flex items-center justify-center text-center p-12"
            style={{ 
              height: settings.banner_height, 
              backgroundColor: settings.banner_overlay_color,
              backgroundImage: settings.banner_bg_image ? `url(${resolveMediaUrl(settings.banner_bg_image)})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: settings.banner_overlay_color, opacity: parseFloat(settings.banner_overlay_opacity) }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4" style={{ color: settings.banner_text_color }}>Sample Page Title</h2>
              {settings.banner_show_breadcrumbs && (
                <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: settings.banner_text_color }}>
                  <span>Home</span>
                  <span>{settings.banner_breadcrumb_separator}</span>
                  <span>Organization</span>
                  <span>{settings.banner_breadcrumb_separator}</span>
                  <span className="opacity-70">Background</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
