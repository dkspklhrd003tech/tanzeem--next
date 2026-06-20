"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, LayoutTemplate, Palette, Mail, MessageSquare, Send, CheckCircle2, Calendar } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { HeaderManager } from "./HeaderManager";
import { FooterManager } from "./FooterManager";

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
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Configuration Engine...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-border mb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    Site Configuration Hub
                </h1>
                <p className="text-sm text-foreground-muted mt-1">Manage global interface settings, brand identity, and monitor the live support Inbox in real-time.</p>
            </div>

            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="mb-8 bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
                    <TabsTrigger
                        value="identity"
                        className="rounded-none px-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-semibold transition-all flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        <Palette className="w-4 h-4" /> Branding Matrix
                    </TabsTrigger>

                    <TabsTrigger
                        value="header"
                        className="rounded-none px-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-semibold transition-all flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        <LayoutTemplate className="w-4 h-4" /> Header Control
                    </TabsTrigger>

                    <TabsTrigger
                        value="footer"
                        className="rounded-none px-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-semibold transition-all flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        <LayoutTemplate className="w-4 h-4 rotate-180" /> Footer Control
                    </TabsTrigger>

                    <TabsTrigger
                        value="inbox"
                        className="rounded-none px-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-semibold transition-all flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        <Mail className="w-4 h-4" /> Support Inbox
                        {submissions.filter(s => s.status !== 'replied').length > 0 && (
                            <Badge className="ml-1 bg-red-500 hover:bg-red-600 text-[10px] items-center justify-center">
                                {submissions.filter(s => s.status !== 'replied').length}
                            </Badge>
                        )}
                    </TabsTrigger>

                    <TabsTrigger
                        value="dates"
                        className="rounded-none px-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-semibold transition-all flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        <Calendar className="w-4 h-4" /> Manage Dates
                    </TabsTrigger>
                </TabsList>

                {/* IDENTITY TAB */}
                <TabsContent value="identity" className="animate-in fade-in-50 duration-500">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Color Engine
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Brand Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        className="h-10 w-20 rounded cursor-pointer"
                                        value={settings.primary_color || "#0d5844"}
                                        onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                                    />
                                    <Input
                                        value={settings.primary_color || "#0d5844"}
                                        onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                                        className="font-mono bg-background"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">This configures the global buttons, headers, and UI highlights.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Secondary Brand Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        className="h-10 w-20 rounded cursor-pointer"
                                        value={settings.secondary_color || "#c8a84e"}
                                        onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                                    />
                                    <Input
                                        value={settings.secondary_color || "#c8a84e"}
                                        onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                                        className="font-mono bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <ConfirmDialog
                                title="Deploy Identity Matrix"
                                description="Are you sure you want to update the global site branding? This will immediately affect the entire website's appearance."
                                onConfirm={() => saveSettings()}
                            >
                                <Button disabled={isSaving} className="bg-[#0d5844] hover:bg-[#0a4636] text-[#fefefc] rounded-xl px-10 font-bold shadow-md transition-all active:scale-95">
                                    {isSaving ? "Synchronizing..." : "Deploy Identity Matrix"}
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>
                </TabsContent>

                {/* HEADER TAB — full dynamic menu builder */}
                <TabsContent value="header" className="animate-in fade-in-50 duration-500">
                    <HeaderManager />
                </TabsContent>

                {/* FOOTER TAB — full dynamic column builder */}
                <TabsContent value="footer" className="animate-in fade-in-50 duration-500">
                    <FooterManager />
                </TabsContent>

                {/* INBOX TAB */}
                <TabsContent value="inbox" className="animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Messages List */}
                        <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h3 className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Support Inbox</h3>
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
                                                            style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: "16px" }}
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
                                                        style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: "16px" }}
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

            </Tabs>
        </div>
    );
}
