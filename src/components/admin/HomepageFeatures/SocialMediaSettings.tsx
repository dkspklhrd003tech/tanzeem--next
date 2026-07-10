"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SocialLink = {
    id: string;
    name: string;
    icon: string;
    url: string;
    color: string;
};

export function SocialMediaSettings() {
    const [links, setLinks] = useState<SocialLink[]>([]);
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
                const socialSettings = data.raw.find((s: any) => s.key === "homepage_social_links");

                if (socialSettings && socialSettings.value) {
                    try {
                        setLinks(JSON.parse(socialSettings.value));
                    } catch (e) {
                        console.error("Failed to parse homepage_social_links", e);
                        setLinks([]);
                    }
                } else {
                    // Fallback to legacy settings if JSON doesn't exist
                    const legacyUrls: any = {};
                    data.raw.forEach((s: any) => { legacyUrls[s.key] = s.value; });
                    const defaultLinks = [];
                    if (legacyUrls.youtube_url) defaultLinks.push({ id: "youtube", name: "YouTube", icon: "youtube", url: legacyUrls.youtube_url, color: "#dc2626" });
                    if (legacyUrls.facebook_url) defaultLinks.push({ id: "facebook", name: "Facebook", icon: "facebook", url: legacyUrls.facebook_url, color: "#2563eb" });
                    if (legacyUrls.twitter_url) defaultLinks.push({ id: "twitter", name: "X (Twitter)", icon: "twitter", url: legacyUrls.twitter_url, color: "#000000" });
                    if (legacyUrls.whatsapp_url) defaultLinks.push({ id: "whatsapp", name: "WhatsApp", icon: "whatsapp", url: legacyUrls.whatsapp_url, color: "#22c55e" });
                    setLinks(defaultLinks);
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                homepage_social_links: JSON.stringify(links)
            };

            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: payload, group: "homepage" })
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast({
                title: "Social Links Saved",
                description: "Dynamic social media links have been updated successfully.",
            });

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

    const addLink = () => {
        setLinks([...links, {
            id: crypto.randomUUID(),
            name: "",
            icon: "globe",
            url: "",
            color: "#0d5844"
        }]);
    };

    const removeLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id));
    };

    const updateLink = (id: string, field: keyof SocialLink, value: string) => {
        setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
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
                    <p className="text-sm text-foreground-muted mt-1">Manage dynamic digital presence links for the "Stay Connected" platform section on the homepage.</p>
                </div>
                <ConfirmDialog
                    title="Save Social Connections"
                    description="Are you sure you want to update the homepage social media links?"
                    onConfirm={handleSave}
                >
                    <button
                        type="button"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-[#fefefc] rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Connections
                    </button>
                </ConfirmDialog>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Dynamic Social Icons</h3>
                    <Button onClick={addLink} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Platform
                    </Button>
                </div>

                {links.length === 0 ? (
                    <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
                        <p className="text-muted-foreground text-sm">No social platforms added yet. Click "Add Platform" to start.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {links.map((link, index) => (
                            <div key={link.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-background p-4 rounded-xl border border-border shadow-sm">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Platform Name</label>
                                        <Input
                                            placeholder="e.g. YouTube"
                                            value={link.name}
                                            onChange={(e) => updateLink(link.id, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Icon SVG (Slug)</label>
                                        <Input
                                            placeholder="e.g. youtube, facebook, instagram"
                                            value={link.icon}
                                            onChange={(e) => updateLink(link.id, "icon", e.target.value.toLowerCase())}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">URL Target</label>
                                        <Input
                                            placeholder="e.g. /social-media#youtube"
                                            value={link.url}
                                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Theme Color</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                className="w-12 p-1 h-9 cursor-pointer"
                                                value={link.color}
                                                onChange={(e) => updateLink(link.id, "color", e.target.value)}
                                            />
                                            <Input
                                                className="flex-1"
                                                value={link.color}
                                                onChange={(e) => updateLink(link.id, "color", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 mt-6 md:mt-0"
                                    onClick={() => removeLink(link.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
