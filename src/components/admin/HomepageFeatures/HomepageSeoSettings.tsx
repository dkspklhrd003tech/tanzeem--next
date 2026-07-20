"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export function HomepageSeoSettings() {
    const [settings, setSettings] = useState({
        homepage_meta_title: "",
        homepage_meta_description: "",
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
                const currentSettings = { ...settings };

                // Map array of {key, value} to object map from the 'raw' response
                data.raw.forEach((s: any) => {
                    if (s.key in currentSettings) {
                        (currentSettings as any)[s.key] = s.value;
                    }
                });
                setSettings(currentSettings);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings, group: "homepage" })
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast({
                title: "Settings Saved",
                description: "Homepage SEO configurations have been updated successfully.",
            });

            fetchSettings();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save settings.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    function charCount(val: string, max: number) {
        const n = val.length;
        return (
            <span className={cn("text-[11px] tabular-nums", n > max ? "text-destructive font-medium" : "text-muted-foreground")}>
                {n}/{max}
            </span>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-pulse space-y-4 w-full">
                    <div className="h-12 bg-muted rounded-lg w-full"></div>
                    <div className="h-48 bg-muted rounded-lg w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Basic SEO Info</h2>
                    <p className="text-sm text-foreground-muted mt-1">Manage the Meta Title and Description for the Landing Page.</p>
                </div>
                <ConfirmDialog
                    title="Save Homepage SEO Settings"
                    description="Are you sure you want to update the SEO metadata for the homepage?"
                    onConfirm={() => { document.getElementById("homepage-seo-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); }}
                >
                    <button
                        type="button"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-[#fefefc] rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </ConfirmDialog>
            </div>

            <form id="homepage-seo-form" onSubmit={handleSave} className="grid grid-cols-1 gap-8 max-w-4xl">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">Metadata</h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">Meta Title</label>
                                {charCount(settings.homepage_meta_title, 60)}
                            </div>
                            <input
                                type="text"
                                maxLength={60}
                                value={settings.homepage_meta_title}
                                onChange={(e) => setSettings({ ...settings, homepage_meta_title: e.target.value })}
                                className="w-full px-2 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Tanzeem-e-Islami | Official Website"
                            />
                            <p className="text-xs text-foreground-muted">Aim for 50–60 characters. Put the most important keyword first.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">Meta Description</label>
                                {charCount(settings.homepage_meta_description, 155)}
                            </div>
                            <textarea
                                rows={4}
                                maxLength={155}
                                value={settings.homepage_meta_description}
                                onChange={(e) => setSettings({ ...settings, homepage_meta_description: e.target.value })}
                                className="w-full px-2 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="Tanzeem-e-Islami is working to re-establish Khilafah following the methodology of Prophet Muhammad (SAWS)..."
                            />
                            <p className="text-xs text-foreground-muted">Aim for 120–155 characters to ensure it displays correctly on both desktop and mobile devices.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
