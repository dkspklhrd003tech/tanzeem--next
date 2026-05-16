"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function FooterManager() {
  const [settings, setSettings] = useState({
    footer_copyright: "© 2024 Tanzeem-e-Islami. All rights reserved.",
    footer_about_text: "",
    footer_columns: "[]",
    footer_social_links: "[]",
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
        if (data.settings.footer) {
          setSettings((prev) => ({ ...prev, ...data.settings.footer }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch footer settings", err);
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
          group: "footer",
          settings,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Footer Updated",
        description: "Footer settings have been saved.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save footer settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Footer Management</h1>
          <p className="text-foreground-muted mt-1">Configure footer columns, social icons, and copyright text.</p>
        </div>
        <ConfirmDialog
          title="Save Footer Settings"
          description="Are you sure you want to save the updated footer settings? This will immediately affect the site-wide footer."
          onConfirm={handleSave}
        >
          <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] rounded-xl px-8">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Footer
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Footer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Copyright Text</Label>
              <Input 
                value={settings.footer_copyright} 
                onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>About Us Text (Short)</Label>
              <RichTextEditor 
                content={settings.footer_about_text} 
                onChange={(content) => setSettings({ ...settings, footer_about_text: content })} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer Links & Socials</CardTitle>
            <CardDescription>Advanced configuration via JSON (UI for this coming soon)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Social Links (JSON)</Label>
              <Textarea 
                value={settings.footer_social_links} 
                onChange={(e) => setSettings({ ...settings, footer_social_links: e.target.value })} 
                className="font-mono text-xs"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
