"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Youtube, Facebook, Twitter, MessageCircle } from "lucide-react";

export function SocialMediaSettings() {
    const [settings, setSettings] = useState({
        youtube_url: "",
        facebook_url: "",
        twitter_url: "",
        whatsapp_url: "",
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
                title: "Social Links Saved",
                description: "Social media links have been updated successfully.",
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
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Social Media Ecosystem</h2>
                    <p className="text-sm text-foreground-muted mt-1">Manage the digital presence links for the "Stay Connected" platform section.</p>
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
                    Save Connections
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 max-w-4xl">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-600" />
                                YouTube Official Channel
                            </label>
                            <input
                                type="text"
                                value={settings.youtube_url}
                                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://youtube.com/@..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Facebook Page URL
                            </label>
                            <input
                                type="text"
                                value={settings.facebook_url}
                                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-black" />
                                X (Formerly Twitter) Profile
                            </label>
                            <input
                                type="text"
                                value={settings.twitter_url}
                                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://twitter.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-500" />
                                WhatsApp Community Link
                            </label>
                            <input
                                type="text"
                                value={settings.whatsapp_url}
                                onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                                className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://wa.me/..."
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
