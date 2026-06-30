"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, Settings, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HistoryPageData {
  hero: {
    heading: string;
    quoteTitle: string;
    quoteText: string;
    content: string; // The paragraphs below the quote (can be HTML/RichText)
  };
  banner: {
    text: string;
  };
  joinUs: {
    heading: string;
    subheading: string;
    rafeeq: {
      landline: string;
      email: string;
      address: string;
    };
    rafeeqah: {
      landline: string;
      email: string;
      address: string;
    };
    note: string;
  };
}

const DEFAULT_DATA: HistoryPageData = {
  hero: {
    heading: "Our History",
    quoteTitle: "The essence of what we call the",
    quoteText: "\"It is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life.\"",
    content: "The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal...\n\nWhen Jama'at-e-Islami entered in the electoral process in 1956, a group of individuals including Dr. Israr Ahmed resigned..."
  },
  banner: {
    text: "Prayer's are Important in Islam, Being Muslim is for all day. Not just 5 times a day."
  },
  joinUs: {
    heading: "Join Us",
    subheading: "Any Male Or Female Muslim Can Join Tanzeem-E-Islami By Giving A Pledge (Or Baiy'ah) Of Obedience.",
    rafeeq: {
      landline: "+92-42-35473375-78",
      email: "markaz@tanzeem.org",
      address: "Dar ul Islam, Markaz Tanzeem-e-Islami, Multan Road, Chung Lahore."
    },
    rafeeqah: {
      landline: "+92-42-35869501-03",
      email: "khwateen@tanzeem.org",
      address: "Office Tanzeem-e-Islami Halqa Khwateen 36-K, Model Town, Lahore."
    },
    note: "Note:\nSend us an email that you have sent us the forms by mail or courier."
  }
};

export default function HistoryPageEditor({ pageId, initialPageData }: { pageId: string; initialPageData: any }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  // Parse JSON content if available, else use default
  let parsedContent = DEFAULT_DATA;
  try {
    if (initialPageData.content && initialPageData.content.startsWith("{")) {
      parsedContent = JSON.parse(initialPageData.content);
      if (!parsedContent.hero) parsedContent = DEFAULT_DATA; // Fallback if schema doesn't match
    }
  } catch (e) {
    console.error("Failed to parse history page content", e);
  }

  const [data, setData] = useState<HistoryPageData>(parsedContent);

  const updateSection = (section: keyof HistoryPageData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: (initialPageData.title || "History of Tanzeem-e-Islami").trim(),
        slug: (initialPageData.slug || "history-of-tanzeem-e-islami").trim(),
        content: JSON.stringify(data),
      };

      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: "Page content saved successfully." });
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg = errorData?.error || JSON.stringify(errorData?.errors) || res.statusText;
        toast({ variant: "destructive", title: "Failed to save page content.", description: errMsg });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Network error saving page." });
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden border border-border bg-background rounded-xl">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 border-b border-border gap-4 shrink-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2 mr-2">
              <Link href="/sitemanager/pages">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Settings className="w-5 h-5" />
            History Page Manager
          </h1>
          <p className="text-xs text-muted-foreground ml-11">
            Configure layout and content for the History of Tanzeem-e-Islami page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-sm" disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Live Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <div className="text-xs font-semibold flex items-center">
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              Sections
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {[
              { id: "hero", label: "Hero & History Text" },
              { id: "banner", label: "Middle Banner" },
              { id: "joinUs", label: "Join Us & Contact" },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between",
                  activeTab === sec.id
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "hover:bg-muted text-foreground-muted"
                )}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Forms / Editing Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-muted/10">
          <Card className="shadow-sm max-w-4xl">
            <CardHeader className="pb-3 border-b border-border mb-6">
              <CardTitle className="text-base font-bold text-foreground capitalize">
                {activeTab.replace(/([A-Z])/g, ' $1').trim()} Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeTab === "hero" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase">Main Heading</Label>
                    <Input
                      value={data.hero.heading}
                      onChange={(e) => updateSection("hero", "heading", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <Label className="text-xs font-bold uppercase">Quote Pre-Title</Label>
                      <Input
                        value={data.hero.quoteTitle}
                        onChange={(e) => updateSection("hero", "quoteTitle", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label className="text-xs font-bold uppercase">Quote Text</Label>
                      <Textarea
                        value={data.hero.quoteText}
                        onChange={(e) => updateSection("hero", "quoteText", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">History Content (Paragraphs)</Label>
                    <p className="text-xs text-muted-foreground mb-2">Use newlines for separate paragraphs. HTML tags (like &lt;br&gt;) are supported.</p>
                    <Textarea
                      value={data.hero.content}
                      onChange={(e) => updateSection("hero", "content", e.target.value)}
                      rows={12}
                    />
                  </div>
                </div>
              )}

              {activeTab === "banner" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase">Banner Text</Label>
                    <Textarea
                      value={data.banner.text}
                      onChange={(e) => updateSection("banner", "text", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {activeTab === "joinUs" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Section Heading</Label>
                      <Input
                        value={data.joinUs.heading}
                        onChange={(e) => updateSection("joinUs", "heading", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-bold uppercase">Subheading / Description</Label>
                      <Input
                        value={data.joinUs.subheading}
                        onChange={(e) => updateSection("joinUs", "subheading", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="border border-border p-4 rounded-xl bg-card space-y-3">
                      <h4 className="text-sm font-bold text-primary uppercase">Rafeeq (Male)</h4>
                      <div>
                        <Label className="text-xs">Landline</Label>
                        <Input value={data.joinUs.rafeeq.landline} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeq, landline: e.target.value };
                          updateSection("joinUs", "rafeeq", updated);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input value={data.joinUs.rafeeq.email} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeq, email: e.target.value };
                          updateSection("joinUs", "rafeeq", updated);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">Address</Label>
                        <Textarea value={data.joinUs.rafeeq.address} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeq, address: e.target.value };
                          updateSection("joinUs", "rafeeq", updated);
                        }} rows={2} />
                      </div>
                    </div>

                    <div className="border border-border p-4 rounded-xl bg-card space-y-3">
                      <h4 className="text-sm font-bold text-primary uppercase">Rafeeqah (Female)</h4>
                      <div>
                        <Label className="text-xs">Landline</Label>
                        <Input value={data.joinUs.rafeeqah.landline} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeqah, landline: e.target.value };
                          updateSection("joinUs", "rafeeqah", updated);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input value={data.joinUs.rafeeqah.email} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeqah, email: e.target.value };
                          updateSection("joinUs", "rafeeqah", updated);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">Address</Label>
                        <Textarea value={data.joinUs.rafeeqah.address} onChange={(e) => {
                          const updated = { ...data.joinUs.rafeeqah, address: e.target.value };
                          updateSection("joinUs", "rafeeqah", updated);
                        }} rows={2} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Label className="text-xs font-bold uppercase">Bottom Note</Label>
                    <Textarea
                      value={data.joinUs.note}
                      onChange={(e) => updateSection("joinUs", "note", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
