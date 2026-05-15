"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, ImageIcon, Loader2 } from "lucide-react";
import { RichTextEditor } from "../RichTextEditor";
import { ImageUploader } from "../ImageUploader";

export function AboutMissionSettings() {
    const [settings, setSettings] = useState({
        homepage_about_title: "",
        homepage_about_description: "",
        homepage_about_button_text: "About Tanzeem",
        homepage_about_button_link: "/about",
        homepage_about_image: "",
        homepage_mission_text: "",
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isImageUploading, setIsImageUploading] = useState(false);

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

    // Removed handleImageUpload as we use ImageUploader now

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
                description: "Homepage configurations have been updated successfully.",
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
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">About & Mission Info</h2>
                    <p className="text-sm text-foreground-muted mt-1">Manage the Core Statement Text Blocks Present on the Landing Page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-[#fefefc] rounded-full animate-spin"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 max-w-6xl">
                {/* About Us Banner Settings */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">Top "About Us" Banner</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">About Title *</label>
                            <input
                                type="text"
                                value={settings.homepage_about_title}
                                onChange={(e) => setSettings({ ...settings, homepage_about_title: e.target.value })}
                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Tanzeem-e-Islami"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">About Description Block *</label>
                            <RichTextEditor
                                content={settings.homepage_about_description}
                                onChange={(content) => setSettings({ ...settings, homepage_about_description: content })}
                                placeholder="It is not enough to practice Islam in one's individual life..."
                            />
                        </div>

                        {/* Image Upload Block */}
                        <div className="pt-4 border-t border-border/50">
                            <label className="text-sm font-semibold text-foreground block mb-4">About Section Illustration</label>
                            <ImageUploader
                                value={settings.homepage_about_image}
                                onChange={(url) => setSettings({ ...settings, homepage_about_image: url })}
                                aspectRatio={1}
                            />
                            <p className="text-xs text-foreground-muted leading-relaxed mt-2">
                                <span className="font-bold text-primary mr-1">Recommended:</span>
                                1:1 aspect ratio. Rendered size is exactly 185px x 185px on the homepage for optimal alignment.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Button Text</label>
                                <input
                                    type="text"
                                    value={settings.homepage_about_button_text}
                                    onChange={(e) => setSettings({ ...settings, homepage_about_button_text: e.target.value })}
                                    className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="About Tanzeem"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Button Link</label>
                                <input
                                    type="text"
                                    value={settings.homepage_about_button_link}
                                    onChange={(e) => setSettings({ ...settings, homepage_about_button_link: e.target.value })}
                                    className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="/about"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Banner Settings */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">Mission Banner (Full Width)</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Mission Statement *</label>
                            <RichTextEditor
                                content={settings.homepage_mission_text}
                                onChange={(content) => setSettings({ ...settings, homepage_mission_text: content })}
                                placeholder="Establish an Islamic State based on socio-political-economic Principles of Islam..."
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
