"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function PolicyPageEditor() {
  const [settings, setSettings] = useState<Record<string, any>>({
    policy_title: "Privacy Policy",
    policy_content: "",
    policy_featured_image: "",
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
        if (data.settings.policy_page) {
          const s = data.settings.policy_page;
          setSettings({
            policy_title: s.policy_title || "Privacy Policy",
            policy_content: s.policy_content || "",
            policy_featured_image: s.policy_featured_image || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch policy page settings", err);
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
          group: "policy_page",
          settings: {
            ...settings,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Policy Saved",
        description: "The Policy page content has been updated.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save policy page settings.",
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Policy Page Editor
          </h1>
          <p className="text-foreground-muted mt-1">Configure the content and layout of the main Policy page.</p>
        </div>
        <ConfirmDialog
          title="Save Policy Content"
          description="Are you sure you want to update the policy page? These changes will be live immediately."
          onConfirm={handleSave}
        >
          <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] rounded-xl px-8">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </ConfirmDialog>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              General Details
            </CardTitle>
            <CardDescription>The title and featured banner for the policy page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Page Title</Label>
              <Input 
                value={settings.policy_title} 
                onChange={(e) => setSettings({ ...settings, policy_title: e.target.value })}
                placeholder="e.g. Privacy Policy or Terms of Service"
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Featured Header Image
              </Label>
              <ImageUploader 
                value={settings.policy_featured_image} 
                onChange={(url) => setSettings({ ...settings, policy_featured_image: url })} 
                aspectRatio={21 / 9}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Content</CardTitle>
            <CardDescription>Use the rich text editor to format the document.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <RichTextEditor
                content={settings.policy_content}
                onChange={(content) => setSettings({ ...settings, policy_content: content })}
                placeholder="Write your policy content here..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
