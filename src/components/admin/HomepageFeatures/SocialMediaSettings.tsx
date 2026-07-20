"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, XCircle, GripVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    // Drag and Drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
        // Optional: set drag image or style
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.classList.add("opacity-50");
            }
        }, 0);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.target instanceof HTMLElement) {
            e.target.classList.remove("opacity-50");
        }
        
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const _links = [...links];
            const draggedItemContent = _links.splice(dragItem.current, 1)[0];
            _links.splice(dragOverItem.current, 0, draggedItemContent);
            setLinks(_links);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

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
                    const defaultLinks: SocialLink[] = [];
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
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
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
                            <div 
                                key={link.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()} // necessary to allow dropping
                                className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[#f8fafc] p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-move"
                            >
                                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 px-2 py-4 md:py-0">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full cursor-default" onDragStart={e => e.preventDefault()} draggable={true}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Platform Name</label>
                                        <Input
                                            placeholder="e.g. YouTube"
                                            value={link.name}
                                            onChange={(e) => updateLink(link.id, "name", e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Icon SVG (Slug)</label>
                                        <Select 
                                            value={link.icon} 
                                            onValueChange={(val) => {
                                                updateLink(link.id, "icon", val);
                                                const colorMap: Record<string, string> = {
                                                    youtube: "#dc2626", facebook: "#2563eb", twitter: "#000000",
                                                    whatsapp: "#22c55e", instagram: "#e1306c", telegram: "#229ED9",
                                                    tiktok: "#000000", web: "#0ea5e9", soundcloud: "#ff5500",
                                                    rumble: "#85c742", pinterest: "#bd081c"
                                                };
                                                if (colorMap[val]) {
                                                    updateLink(link.id, "color", colorMap[val]);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select icon..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="youtube">YouTube</SelectItem>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="twitter">X (Twitter)</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="telegram">Telegram</SelectItem>
                                                <SelectItem value="tiktok">TikTok / Snack Video</SelectItem>
                                                <SelectItem value="web">Web</SelectItem>
                                                <SelectItem value="soundcloud">SoundCloud</SelectItem>
                                                <SelectItem value="rumble">Rumble</SelectItem>
                                                <SelectItem value="pinterest">Pinterest</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">URL Target</label>
                                        <Input
                                            placeholder="e.g. /social-media#youtube"
                                            value={link.url}
                                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Theme Color</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                className="w-12 p-1 h-9 cursor-pointer bg-white"
                                                value={link.color}
                                                onChange={(e) => updateLink(link.id, "color", e.target.value)}
                                            />
                                            <Input
                                                className="flex-1 bg-white"
                                                value={link.color}
                                                onChange={(e) => updateLink(link.id, "color", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex h-full items-center justify-center pt-6 md:pt-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                                        onClick={() => removeLink(link.id)}
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
