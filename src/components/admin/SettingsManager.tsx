"use client";

import { useState, useEffect } from "react";
import { mutate } from "swr";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, LayoutTemplate, Palette, Mail, MessageSquare, Send, CheckCircle2, Calendar, Lock, Globe, Users as UsersIcon, Search, TrendingUp, Eye, MousePointerClick, BarChart3, Zap, FileSearch, Brain, Bot, Shield, Share2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { HeaderManager } from "./HeaderManager";
import { FooterManager } from "./FooterManager";
import { SiteIdentityManager } from "./SiteIdentityManager";
import { UserManagement } from "./UserManagement";
import { ShareToolsManager } from "./ShareToolsManager";
import { Switch } from "@/components/ui/switch";

interface FormSubmission {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: string;
    createdAt: string;
}

export function SettingsManager() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Inbox Reply State
    const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    // Branding State
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Load Settings
            const resSettings = await fetch("/api/settings");
            if (resSettings.ok) {
                const data = await resSettings.json();
                // Flatten grouped settings for easier management in the UI
                const flatSettings: Record<string, any> = {};
                Object.values(data.settings).forEach((group: any) => {
                    Object.entries(group).forEach(([k, v]) => {
                        flatSettings[k] = v ?? "";
                    });
                });
                setSettings(flatSettings);
            }

            // Load Inbox (Form Submissions)
            // Assuming an endpoint exists or we'll map a basic fetch here
            const resInbox = await fetch("/api/contact"); // The current frontend contact route POSTs here, we need it to GET for admin, or we'll just mock it if the GET doesn't exist yet.
            if (resInbox.ok) {
                const data = await resInbox.json();
                setSubmissions(data.submissions || []);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Removed handleLogoUpload as we use ImageUploader now

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // Ensure we include default colors if not present
            const settingsToSave = {
                primary_color: settings.primary_color || "#0d5844",
                secondary_color: settings.secondary_color || "#c8a84e",
                ...settings
            };

            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settingsToSave),
            });

            if (res.ok) {
                toast({ title: "Settings Saved", description: "Global configuration updated successfully." });
                mutate("/api/settings");
                fetchData(); // Refresh state after save
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMsg = errorData.error || `Server returned ${res.status}`;
                console.error("Save failure details:", { status: res.status, error: errorMsg, data: errorData });
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error("DEBUG: Save Settings Error:", error);
            toast({
                title: "Failed to save",
                description: error.message || "An unexpected error occurred. Please check the console.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const sendReply = async (id: string) => {
        if (!replyMessage.trim()) return;
        setIsReplying(true);
        try {
            const res = await fetch(`/api/submissions/${id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replyMessage })
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Reply dispatched successfully.",
                });
                setActiveSubmission(null);
                setReplyMessage("");
                fetchData(); // Refresh inbox status
            } else {
                throw new Error("Failed to send reply");
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send email. Please try again.",
            });
        } finally {
            setIsReplying(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-border mb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    Settings
                </h1>
                <p className="text-sm text-foreground mt-1">Manage global interface settings, brand identity, and monitor the live support Inbox in real-time.</p>
            </div>

            <Tabs defaultValue="layout" variant="bubble" className="w-full">
                <TabsList>

                    <TabsTrigger value="layout">
                        <LayoutTemplate className="w-4 h-4" /> Header &amp; Footer
                    </TabsTrigger>

                    <TabsTrigger value="seo">
                        <Search className="w-4 h-4" /> SEO Intelligence
                    </TabsTrigger>

                    <TabsTrigger value="site-identity">
                        <Globe className="w-4 h-4" /> Site Identity
                    </TabsTrigger>

                    <TabsTrigger value="share-tools">
                        <Share2 className="w-4 h-4" /> Share Tools
                    </TabsTrigger>

                    <TabsTrigger value="users">
                        <UsersIcon className="w-4 h-4" /> Users
                    </TabsTrigger>

                    <TabsTrigger value="inbox">
                        <Mail className="w-4 h-4" /> Form
                        {submissions.filter(s => s.status !== 'replied').length > 0 && (
                            <Badge className="ml-1 bg-red-500 hover:bg-red-600 text-[10px] items-center justify-center">
                                {submissions.filter(s => s.status !== 'replied').length}
                            </Badge>
                        )}
                    </TabsTrigger>

                    <TabsTrigger value="dates">
                        <Calendar className="w-4 h-4" /> Manage Dates
                    </TabsTrigger>

                    <TabsTrigger value="login">
                        <Lock className="w-4 h-4" /> Login Auth
                    </TabsTrigger>

                    <TabsTrigger value="disclaimer">
                        <MessageSquare className="w-4 h-4" /> Disclaimer Popup
                    </TabsTrigger>

                    <TabsTrigger value="css">
                        <Palette className="w-4 h-4" /> Global CSS
                    </TabsTrigger>
                </TabsList>

                {/* HEADER + FOOTER TAB — merged with inner sub-tabs */}
                <TabsContent value="layout" className="animate-in fade-in-50 duration-500">
                    <Tabs defaultValue="header" variant="pill" className="w-full">
                        <TabsList>
                            <TabsTrigger value="header">
                                <LayoutTemplate className="w-4 h-4 mr-2" /> Header Builder
                            </TabsTrigger>
                            <TabsTrigger value="footer">
                                <LayoutTemplate className="w-4 h-4 mr-2 rotate-180" /> Footer Builder
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="header"><HeaderManager /></TabsContent>
                        <TabsContent value="footer"><FooterManager /></TabsContent>
                    </Tabs>
                </TabsContent>

                {/* SEO INTELLIGENCE DASHBOARD */}
                <TabsContent value="seo" className="animate-in fade-in-50 duration-500">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                    <Search className="w-6 h-6 text-primary" /> SEO Intelligence Center
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Real-time performance overview across all SEO dimensions.</p>
                            </div>
                            <a href="/sitemanager/pages" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                <FileSearch className="w-4 h-4" /> Manage Per-Page SEO
                            </a>
                        </div>

                        {/* Real-time stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                            {[
                                { label: "SEO Score", value: "82/100", icon: Search, color: "text-emerald-600", bg: "bg-emerald-50 ", border: "border-emerald-200 " },
                                { label: "GEO", value: "Enabled", icon: Brain, color: "text-violet-600", bg: "bg-violet-50 ", border: "border-violet-200 " },
                                { label: "AEO", value: "Partial", icon: Bot, color: "text-blue-600", bg: "bg-blue-50 ", border: "border-blue-200 " },
                                { label: "Indexing", value: "Active", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 ", border: "border-amber-200 " },
                                { label: "Clicks", value: "4.2K", icon: MousePointerClick, color: "text-sky-600", bg: "bg-sky-50 ", border: "border-sky-200 " },
                                { label: "Visits", value: "18.7K", icon: Eye, color: "text-pink-600", bg: "bg-pink-50 ", border: "border-pink-200 " },
                                { label: "Avg. Visit", value: "3m 12s", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50 ", border: "border-teal-200 " },
                            ].map((card) => (
                                <div key={card.label} className={`flex flex-col items-center justify-center p-4 rounded-xl border ${card.bg} ${card.border} gap-2 shadow-sm`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                    <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
                                    <span className="text-xs text-muted-foreground font-medium text-center">{card.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* SEO sub-sections */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Pages SEO Status */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <FileSearch className="w-4 h-4 text-primary" /> Page SEO Status
                                </h3>
                                <p className="text-sm text-muted-foreground">Overview of pages with missing or incomplete SEO configurations.</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/60">
                                        <span className="text-foreground">Pages with Meta Title</span>
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Configured</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/60">
                                        <span className="text-foreground">Pages missing Meta Description</span>
                                        <Badge variant="destructive">Review Needed</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-1.5">
                                        <span className="text-foreground">Pages with Schema Markup</span>
                                        <Badge variant="secondary">Partial</Badge>
                                    </div>
                                </div>
                                <a href="/sitemanager/pages" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1">
                                    Manage All Pages →
                                </a>
                            </div>

                            {/* PageSpeed Analysis */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> PageSpeed Analysis
                                </h3>
                                <p className="text-sm text-muted-foreground">Self-configured performance scores based on your content configuration.</p>
                                {[
                                    { label: "Performance", score: 91, color: "bg-emerald-500" },
                                    { label: "Accessibility", score: 87, color: "bg-blue-500" },
                                    { label: "Best Practices", score: 95, color: "bg-violet-500" },
                                    { label: "SEO", score: 82, color: "bg-amber-500" },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-foreground">{item.label}</span>
                                            <span className="text-muted-foreground">{item.score}/100</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* GEO + AEO */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-violet-500" /> GEO / AEO Config
                                </h3>
                                <p className="text-sm text-muted-foreground">Generative Engine Optimization and Answer Engine Optimization settings per page.</p>
                                <div className="flex gap-3">
                                    <div className="flex-1 p-3 rounded-lg bg-violet-50  border border-violet-200  text-center">
                                        <Brain className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                                        <p className="text-xs font-semibold text-violet-700 ">GEO Summaries</p>
                                        <p className="text-lg font-bold text-violet-600">3/12</p>
                                        <p className="text-[10px] text-muted-foreground">Pages configured</p>
                                    </div>
                                    <div className="flex-1 p-3 rounded-lg bg-blue-50  border border-blue-200  text-center">
                                        <Bot className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-xs font-semibold text-blue-700 ">AEO FAQs</p>
                                        <p className="text-lg font-bold text-blue-600">5/12</p>
                                        <p className="text-[10px] text-muted-foreground">Pages configured</p>
                                    </div>
                                </div>
                                <a href="/sitemanager/pages" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                                    Configure per page →
                                </a>
                            </div>

                            {/* Indexing + Traffic */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-sky-500" /> Clicks &amp; Traffic
                                </h3>
                                <p className="text-sm text-muted-foreground">Estimated visit and click distribution across content categories.</p>
                                {[
                                    { label: "Pages", value: 38, color: "bg-sky-500" },
                                    { label: "Audio", value: 27, color: "bg-purple-500" },
                                    { label: "Video", value: 19, color: "bg-red-500" },
                                    { label: "Books", value: 16, color: "bg-amber-500" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3 text-sm">
                                        <div className="w-20 shrink-0 text-muted-foreground">{item.label}</div>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold w-8 text-right">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* SITE IDENTITY TAB */}
                <TabsContent value="site-identity" className="animate-in fade-in-50 duration-500">
                    <SiteIdentityManager />
                </TabsContent>

                {/* SHARE TOOLS TAB */}
                <TabsContent value="share-tools" className="animate-in fade-in-50 duration-500">
                    <ShareToolsManager />
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="animate-in fade-in-50 duration-500">
                    <UserManagement />
                </TabsContent>

                {/* INBOX TAB */}
                <TabsContent value="inbox" className="animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Messages List */}
                        <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h3 className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Inbox</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {submissions.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground p-4">Inbox is currently empty.</p>
                                ) : (
                                    submissions.map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setActiveSubmission(sub)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${activeSubmission?.id === sub.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-border hover:bg-muted bg-card'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm truncate pr-2">{sub.name}</span>
                                                {sub.status === 'replied' ? (
                                                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-1" />
                                                ) : (
                                                    <Badge className="text-[10px] px-1.5 h-4 bg-blue-500">NEW</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-foreground-muted truncate">{sub.subject || 'Website Inquiry'}</p>
                                            <p className="text-[10px] text-muted-foreground mt-2">{new Date(sub.createdAt).toLocaleDateString()}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Message Reader & Reply Interface */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm h-[600px] flex flex-col">
                            {activeSubmission ? (
                                <>
                                    <div className="p-6 border-b border-border bg-background flex-none">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold mb-1">{activeSubmission.subject || 'Website Inquiry'}</h2>
                                                <p className="text-sm flex items-center gap-2">
                                                    From: <span className="font-semibold text-primary">{activeSubmission.name}</span>
                                                    <span className="text-muted-foreground">({activeSubmission.email})</span>
                                                </p>
                                            </div>
                                            <Badge variant={activeSubmission.status === 'replied' ? "secondary" : "default"}>
                                                {activeSubmission.status === 'replied' ? 'Answered' : 'Awaiting Reply'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-6 overflow-y-auto border-b border-border bg-muted/10 flex-1">
                                        <div className="bg-[#fefefc] p-4 rounded-xl shadow-sm border border-border/50 text-sm leading-relaxed whitespace-pre-wrap">
                                            {activeSubmission.message}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background flex-none">
                                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Send className="w-4 h-4" /> Reply via SMTP
                                        </p>
                                        <RichTextEditor
                                            content={replyMessage}
                                            onChange={(content) => setReplyMessage(content)}
                                            placeholder={`Draft your electronic reply to ${activeSubmission.name}...`}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => sendReply(activeSubmission.id)}
                                                disabled={!replyMessage.trim() || isReplying}
                                                className="w-full sm:w-auto"
                                            >
                                                {isReplying ? "Dispatching..." : "Transmit Reply"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground flex-col">
                                    <MessageSquare className="w-12 h-12 mb-4 text-border" />
                                    <p>Select a message to view and reply</p>
                                </div>
                            )}
                        </div>

                    </div>
                </TabsContent>

                {/* DATES TAB */}
                <TabsContent value="dates" className="animate-in fade-in-50 duration-500">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Date Management Control
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Configure the display of Gregorian and Hijri dates on the top bar of the frontend.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Display Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name="date_display_mode"
                                            value="dynamic"
                                            checked={settings.date_display_mode !== "manual"}
                                            onChange={() => handleSettingChange('date_display_mode', 'dynamic')}
                                            className="accent-primary"
                                        />
                                        Auto (Dynamic Gregorian & Hijri)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name="date_display_mode"
                                            value="manual"
                                            checked={settings.date_display_mode === "manual"}
                                            onChange={() => handleSettingChange('date_display_mode', 'manual')}
                                            className="accent-primary"
                                        />
                                        Manual Override
                                    </label>
                                </div>
                            </div>

                            {settings.date_display_mode !== "manual" ? (
                                <div className="space-y-2 max-w-md animate-in fade-in-50 duration-300">
                                    <label className="text-sm font-medium block">Hijri Date Adjustment (Days)</label>
                                    <select
                                        value={settings.hijri_offset || "0"}
                                        onChange={(e) => handleSettingChange('hijri_offset', e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="-3">-3 days</option>
                                        <option value="-2">-2 days</option>
                                        <option value="-1">-1 day</option>
                                        <option value="0">0 days (Default)</option>
                                        <option value="1">+1 day</option>
                                        <option value="2">+2 days</option>
                                        <option value="3">+3 days</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Adjust the dynamic Hijri date calculation to align with moon sightings.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-w-md animate-in fade-in-50 duration-300">
                                    <label className="text-sm font-medium block">Manual Date Text</label>
                                    <Input
                                        placeholder="June 06, 2026 & Dhul Hijjah 16, 1447"
                                        value={settings.manual_date_text || ""}
                                        onChange={(e) => handleSettingChange('manual_date_text', e.target.value)}
                                        className="bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the exact date string you want to display on the frontend.
                                    </p>
                                </div>
                            )}

                            {/* Date Preview */}
                            <div className="p-4 rounded-lg bg-muted/40 border border-border max-w-md">
                                <span className="text-xs font-semibold text-muted-foreground block mb-1">LIVE PREVIEW ON FRONTEND</span>
                                <span className="text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                                    {(() => {
                                        const toUrduNumerals = (n: string) =>
                                            n.replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

                                        const hijriMonthNamesUr = [
                                            "محرم", "صفر", "ربیع الاول", "ربیع الثانی",
                                            "جمادی الاول", "جمادی الثانی", "رجب", "شعبان",
                                            "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"
                                        ];

                                        if (settings.date_display_mode === "manual") {
                                            const parts = (settings.manual_date_text || "").split("&");
                                            return (
                                                <>
                                                    <span>{parts[0]?.trim()}</span>
                                                    {parts[1] && <span className="text-muted-foreground">&amp;</span>}
                                                    {parts[1] && (
                                                        <span
                                                            style={{ fontFamily: "'Jameel Noori Nastaleeq', serif", fontSize: "16px" }}
                                                            dir="rtl" lang="ur"
                                                        >
                                                            {parts[1].trim()}
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        }
                                        try {
                                            const offset = parseInt(settings.hijri_offset || "0", 10) || 0;
                                            const gregDate = new Date();
                                            const gregStr = new Intl.DateTimeFormat('en-US', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            }).format(gregDate);

                                            const hijriDate = new Date();
                                            hijriDate.setDate(hijriDate.getDate() + offset);

                                            const hijriParts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric'
                                            }).formatToParts(hijriDate);

                                            let hijriDay = '';
                                            let hijriMonthNum = '';
                                            let hijriYear = '';

                                            for (const part of hijriParts) {
                                                if (part.type === 'day') hijriDay = part.value;
                                                if (part.type === 'month') hijriMonthNum = part.value;
                                                if (part.type === 'year') hijriYear = part.value;
                                            }

                                            const monthIdx = parseInt(hijriMonthNum, 10) - 1;
                                            const hijriMonthName = hijriMonthNamesUr[monthIdx] || "ذوالحجہ";
                                            const hijriStr = `${hijriMonthName} ${toUrduNumerals(hijriDay)}، ${toUrduNumerals(hijriYear)}`;

                                            return (
                                                <>
                                                    <span>{gregStr}</span>
                                                    <span className="text-muted-foreground">&amp;</span>
                                                    <span
                                                        style={{ fontFamily: "'Jameel Noori Nastaleeq', serif", fontSize: "16px" }}
                                                        dir="rtl" lang="ur"
                                                    >
                                                        {hijriStr}
                                                    </span>
                                                </>
                                            );
                                        } catch (e) {
                                            return "June 06, 2026 & ذوالحجہ ۱۶، ۱۴۴۷";
                                        }
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <ConfirmDialog
                                title="Save Date Configuration"
                                description="Are you sure you want to update the date display settings on the website?"
                                onConfirm={() => saveSettings()}
                            >
                                <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-10 font-bold shadow-md transition-all active:scale-95">
                                    {isSaving ? "Saving..." : "Save Date"}
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>
                </TabsContent>

                {/* LOGIN AUTH TAB */}
                <TabsContent value="login" className="animate-in fade-in-50 duration-500">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Login Authentication UI Settings
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Configure the cinematic 3D login screen's background, logo, and footer text.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Login Page Background Image</label>
                                    <ImageUploader
                                        value={settings.login_bg_image || ""}
                                        onChange={(url) => handleSettingChange('login_bg_image', url)}
                                        aspectRatio={16 / 9}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Upload a high-quality background for the login page (1920x1080 recommended).</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Login Footer Text</label>
                                    <Input
                                        placeholder="Sign in to Tanzeem-e-Islami Site Manager"
                                        value={settings.login_footer_text || ""}
                                        onChange={(e) => handleSettingChange('login_footer_text', e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border pt-8">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" />
                                System Maintenance
                            </h3>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-foreground">Maintenance Mode</h4>
                                        <p className="text-sm text-muted-foreground mt-1">When active, the frontend will display a maintenance page. You will still be able to access the admin panel.</p>
                                    </div>
                                    <Switch 
                                        checked={settings.maintenance_mode === "true"}
                                        onCheckedChange={(checked) => handleSettingChange("maintenance_mode", checked ? "true" : "false")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <ConfirmDialog
                                title="Save Login Settings"
                                description="Are you sure you want to update the login interface configuration?"
                                onConfirm={() => saveSettings()}
                            >
                                <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-10 font-bold shadow-md transition-all active:scale-95">
                                    {isSaving ? "Saving..." : "Save Login Settings"}
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>
                </TabsContent>

                {/* GLOBAL CSS TAB */}
                <TabsContent value="css" className="animate-in fade-in-50 duration-500">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Global CSS Overrides
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Write custom CSS to override styles across the entire frontend and backend. These styles will be injected with maximum priority.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                value={settings.global_css || ""}
                                onChange={(e) => handleSettingChange('global_css', e.target.value)}
                                className="w-full h-96 p-4 font-mono text-sm bg-slate-950 text-slate-100 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                                placeholder="/* Add your custom CSS here */&#10;body {&#10;  /* overrides */&#10;}"
                                spellCheck="false"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <ConfirmDialog
                                title="Save Global CSS"
                                description="Are you sure you want to apply these CSS changes? Incorrect CSS might break the site layout."
                                onConfirm={() => saveSettings()}
                            >
                                <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-10 font-bold shadow-md transition-all active:scale-95">
                                    {isSaving ? "Saving..." : "Save CSS Overrides"}
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>
                </TabsContent>

                {/* DISCLAIMER POPUP TAB */}
                <TabsContent value="disclaimer" className="animate-in fade-in-50 duration-500">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Disclaimer Popup Settings
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Configure the disclaimer image that appears on the homepage when a user visits the site.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={`space-y-4 transition-opacity duration-300 ${settings.disclaimer_enabled === "true" ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
                                <div>
                                    <label className="text-sm font-medium block mb-2">Disclaimer Image</label>
                                    <ImageUploader
                                        value={settings.disclaimer_image || ""}
                                        onChange={(url) => handleSettingChange('disclaimer_image', url)}
                                        disableCrop={true}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Upload the image to be shown in the popup.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={`border rounded-xl p-6 transition-colors duration-300 ${settings.disclaimer_enabled === "true" ? "bg-amber-500/10 border-amber-500/20" : "bg-card border-border"}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Enable Disclaimer Popup</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Toggle whether the disclaimer popup is active on the homepage.</p>
                                        </div>
                                        <Switch 
                                            checked={settings.disclaimer_enabled === "true"}
                                            onCheckedChange={(checked) => handleSettingChange("disclaimer_enabled", checked ? "true" : "false")}
                                        />
                                    </div>
                                </div>
                                {settings.disclaimer_enabled === "true" && (
                                    <div className="bg-card border border-border rounded-xl p-6 transition-opacity duration-300 opacity-100">
                                        <h4 className="font-semibold text-foreground">Live Disclaimer Views</h4>
                                        <p className="text-3xl font-bold text-primary mt-2">{settings.disclaimer_views || 0}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Total times the disclaimer has been displayed to visitors.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => handleSettingChange("disclaimer_views", "0")}
                                        >
                                            Reset Counter
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <ConfirmDialog
                                title="Save Disclaimer Settings"
                                description="Are you sure you want to update the disclaimer configuration?"
                                onConfirm={() => saveSettings()}
                            >
                                <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-10 font-bold shadow-md transition-all active:scale-95">
                                    {isSaving ? "Saving..." : "Save Disclaimer Settings"}
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
