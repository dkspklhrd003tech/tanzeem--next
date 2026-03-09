"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function AboutMissionSettings() {
    const [settings, setSettings] = useState({
        homepage_about_title: "",
        homepage_about_description: "",
        homepage_about_button_text: "About Tanzeem",
        homepage_about_button_link: "/about",
        homepage_mission_text: "",
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

                // Map array of {key, value} to object map
                data.settings.forEach((s: any) => {
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
            // Convert state object to array of {key, value} mapped to 'homepage' group
            const payload = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                type: "text",
                group: "homepage"
            }));

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: payload })
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast({
                title: "Settings Saved",
                description: "Homepage text strings have been updated successfully.",
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">About & Mission Info</h2>
                    <p className="text-foreground-muted text-sm mt-1">Manage the core statement text blocks present on the landing page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm"
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 max-w-4xl">
                {/* About Us Banner Settings */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">Top "About Us" Banner</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">About Title *</label>
                            <input
                                type="text"
                                value={settings.homepage_about_title}
                                onChange={(e) => setSettings({ ...settings, homepage_about_title: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Tanzeem-e-Islami"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">About Description Block *</label>
                            <textarea
                                value={settings.homepage_about_description}
                                onChange={(e) => setSettings({ ...settings, homepage_about_description: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[120px]"
                                placeholder="It is not enough to practice Islam in one's individual life..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Button Text</label>
                                <input
                                    type="text"
                                    value={settings.homepage_about_button_text}
                                    onChange={(e) => setSettings({ ...settings, homepage_about_button_text: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="About Tanzeem"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Button Link</label>
                                <input
                                    type="text"
                                    value={settings.homepage_about_button_link}
                                    onChange={(e) => setSettings({ ...settings, homepage_about_button_link: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
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
                            <label className="text-sm font-medium text-foreground">Mission Statement *</label>
                            <textarea
                                value={settings.homepage_mission_text}
                                onChange={(e) => setSettings({ ...settings, homepage_mission_text: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[100px]"
                                placeholder="Establish an Islamic State based on socio-political-economic Principles of Islam..."
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
