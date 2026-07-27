"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Save, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SectionSeoModalProps {
  sectionKey: string;
  sectionTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SectionSeoModal({ sectionKey, sectionTitle, isOpen, onClose }: SectionSeoModalProps) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSeo();
    }
  }, [isOpen, sectionKey]);

  const fetchSeo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        const raw = data.raw || [];
        const titleSetting = raw.find((s: any) => s.key === `seo_${sectionKey}_meta_title`);
        const descSetting = raw.find((s: any) => s.key === `seo_${sectionKey}_meta_description`);
        setMetaTitle(titleSetting?.value || "");
        setMetaDescription(descSetting?.value || "");
      }
    } catch (e) {
      console.error("Failed to fetch section SEO", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings = {
        [`seo_${sectionKey}_meta_title`]: metaTitle,
        [`seo_${sectionKey}_meta_description`]: metaDescription,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, group: "seo_sections" }),
      });

      if (!res.ok) throw new Error("Failed to save SEO settings");

      toast({
        title: "SEO Saved",
        description: `SEO Title & Description for ${sectionTitle} updated successfully.`,
      });
      onClose();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save SEO.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGenerate = () => {
    let generatedTitle = `${sectionTitle} | Tanzeem-e-Islami`;
    if (generatedTitle.length > 60) {
      generatedTitle = generatedTitle.substring(0, 57) + "...";
    }

    let generatedDesc = `Discover dynamic ${sectionTitle} content on the official Tanzeem-e-Islami portal. Access authentic resources, publications, and updates.`;
    if (generatedDesc.length > 155) {
      generatedDesc = generatedDesc.substring(0, 150) + "...";
    }

    setMetaTitle(generatedTitle);
    setMetaDescription(generatedDesc);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            SEO Settings — {sectionTitle}
          </DialogTitle>
          <DialogDescription>
            Configure dedicated Meta Title and Meta Description for search engines regarding this homepage section.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5 py-3">
            {/* Meta Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="secMetaTitle" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Meta Title
                </Label>
                <span className={cn("text-[11px]", metaTitle.length > 60 ? "text-destructive font-bold" : "text-muted-foreground")}>
                  {metaTitle.length}/60
                </span>
              </div>
              <Input
                id="secMetaTitle"
                maxLength={60}
                placeholder={`${sectionTitle} | Tanzeem-e-Islami`}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="secMetaDesc" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Meta Description
                </Label>
                <span className={cn("text-[11px]", metaDescription.length > 155 ? "text-destructive font-bold" : "text-muted-foreground")}>
                  {metaDescription.length}/155
                </span>
              </div>
              <Textarea
                id="secMetaDesc"
                rows={3}
                maxLength={155}
                placeholder={`Learn more about ${sectionTitle} provided by Tanzeem-e-Islami...`}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="text-sm resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
          <Button type="button" variant="outline" size="sm" onClick={handleAutoGenerate} className="text-xs gap-1.5 border border-primary text-primary hover:bg-primary-light hover:text-primary">
            <Wand2 className="w-3.5 h-3.5" /> Auto Fill
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary text-white hover:bg-primary-light">
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save SEO
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
