"use client";

import { useState, useEffect } from "react";
import { Save, ImageIcon, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function SiteIdentityManager() {
  const [settings, setSettings] = useState({
    site_name: "Tanzeem-e-Islami",
    site_description: "",
    site_logo: "",
    site_favicon: "",
    contact_email: "",
    contact_phone: "",
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
        if (data.settings.general) {
          const safe = Object.fromEntries(Object.entries(data.settings.general).filter(([, v]) => v != null));
          setSettings((prev) => ({ ...prev, ...safe }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch identity settings", err);
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
          group: "general",
          settings,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Identity Updated",
        description: "Site identity settings have been saved.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save identity settings.",
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
          <h1 className="text-3xl font-bold tracking-tight">Site Identity</h1>
          <p className="text-foreground-muted mt-1">Manage your website's core branding and metadata.</p>
        </div>
        <ConfirmDialog
          title="Save Identity Settings"
          description="Are you sure you want to update the site's core identity and branding assets?"
          onConfirm={handleSave}
        >
          <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] rounded-xl px-8">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input 
                value={settings.site_name} 
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline / Description</Label>
              <Input 
                value={settings.site_description} 
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Logo</Label>
              <ImageUploader 
                value={settings.site_logo} 
                onChange={(url) => setSettings({ ...settings, site_logo: url })} 
                aspectRatio={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <ImageUploader 
                value={settings.site_favicon} 
                onChange={(url) => setSettings({ ...settings, site_favicon: url })} 
                aspectRatio={1}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
