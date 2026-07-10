"use client";

import React, { useState, useEffect } from "react";
import {
  useOrganizationPageState,
  EMPTY_STATE,
  OrganizationPageState,
  IdeologyCardState,
  JoinCardState
} from "@/components/organization/OrganizationPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Save, Eye, EyeOff, LayoutGrid, FileText, Settings, HelpCircle,
  Plus, Trash2, ArrowUp, ArrowDown, Upload, Link2, Sparkles,
  Globe2, Compass, Heart, Share2, Search, MapPin, Code, ChevronRight, User
} from "lucide-react";

// Initial default state if localStorage is empty
const INITIAL_DEMO_DATA: OrganizationPageState = {
  heroBanner: {
    topLabel: "WELCOME TO TANZEEM-E-ISLAMI",
    quoteText: 'THERE IS NO "MOLVI" PROFESSION IN ISLAM EVERYONE SHOULD CAPABLE OF LEARNING ISLAM',
    attribution: "Dr. Israr Ahmed",
    backgroundImage: "",
    decorativeImage: ""
  },
  history: {
    heading: "Our History",
    body: "The essence of what we call the \"Islamic revolutionary thought\" consists of the idea that it is not enough to perform rites in one's individual life, but the supremacy of the Quran and those of the sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, political, and economic spheres of life...",
    buttonLabel: "Read Full History",
    buttonUrl: "/background",
    sideImage: ""
  },
  missionStatement: {
    heading: "Mission Statement",
    subheading: "The Mission Statement of Tanzeem-e-Islami is given below:",
    body: "\"To organize the selectees of Deen in an individual to provide his moral and spiritual fulfillment and elevation...\""
  },
  founder: {
    name: "Dr Israr Ahmed",
    designation: "Founder",
    bio: "Dr. Israr Ahmed, the second son of a government servant, was born on April 26, 1932...",
    avatar: "",
    readMoreLabel: "More Details",
    readMoreUrl: "/the-founder"
  },
  ameer: {
    name: "Shujah Uddin Sheikh",
    designation: "Ameer",
    bio: "Mohammad Shujah Uddin Sheikh is the current Ameer of Tanzeem-e-Islami...",
    avatar: "",
    readMoreLabel: "About Ameer",
    readMoreUrl: "/the-ameer"
  },
  ideology: {
    heading: "Our Ideology",
    cards: [
      { icon: "book", title: "Our Foundation", urduTitle: "قرآن الکریم", description: "The Quran is the final and complete word of Allah...", linkLabel: "Our Belief", linkUrl: "/our-ideology" },
      { icon: "star", title: "Methodology", urduTitle: "نبوت", description: "Belief in the Prophethood of Muhammad (SAWS) as the final messenger...", linkLabel: "Prophethood", linkUrl: "/our-ideology" },
      { icon: "compass", title: "Our Obligations", urduTitle: "دینِ قیّم", description: "Islam is a complete and comprehensive way of life...", linkLabel: "Obligations", linkUrl: "/our-ideology" },
      { icon: "heart", title: "Our Belief", urduTitle: "ہمارا عقیدہ", description: "Tanzeem-e-Islami works to re-establish the Khilafah...", linkLabel: "Foundation", linkUrl: "/our-ideology" }
    ]
  },
  join: {
    heading: "Join US",
    subtitle: "Any Muslim (Male/Female) Can Join Tanzeem-e-Islami by Pledging / Oath of Obedience.",
    cards: [
      { title: "RAFEEQ", location: "Markaz Tanzeem-e-Islami", phone: "+92-42-35473375-78", description: "For male members wishing to pledge allegiance to the cause.", linkLabel: "Join Rafeeq", linkUrl: "/join" },
      { title: "RAFEEQAH", location: "Tanzeem-e-Islami Halqa-e-Khawateen", phone: "+92-42-3586551-53", description: "For female members wishing to join the women wing.", linkLabel: "Join Rafeeqah", linkUrl: "/join" }
    ]
  }
};

interface SeoState {
  // BASIC
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  robotsIndex: string;
  robotsFollow: string;
  author: string;
  // SOCIAL
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  socialUrl: string;
  // SCHEMA
  schemaType: string;
  schemaManualOverride: boolean;
  schemaJson: string;
  // GEO
  region: string;
  placename: string;
  latitude: string;
  longitude: string;
  icbm: string;
  hreflang: string;
  // AEO
  primaryQuestion: string;
  directAnswer: string;
  faqs: Array<{ question: string; answer: string }>;
  howToSteps: Array<{ step: string; image: string }>;
  entityName: string;
  entityType: string;
  speakableSelectors: string;
  // CRAWL
  preloadUrls: string;
  preconnectOrigins: string;
  priorityHints: string;
}

const DEFAULT_SEO: SeoState = {
  metaTitle: "Organization | Tanzeem-e-Islami",
  metaDescription: "Learn about Tanzeem-e-Islami's history, mission, ideology, and leadership.",
  metaKeywords: "Tanzeem-e-Islami, Dr Israr Ahmed, Shujah Uddin Sheikh, Rafeeq, Rafeeqah",
  canonicalUrl: "https://tanzeem.org/organization",
  robotsIndex: "index",
  robotsFollow: "follow",
  author: "Tanzeem-e-Islami",
  ogTitle: "Organization | Tanzeem-e-Islami",
  ogDescription: "Learn about Tanzeem-e-Islami's history, mission, ideology, and leadership.",
  ogImage: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  socialUrl: "https://tanzeem.org/organization",
  schemaType: "WebPage",
  schemaManualOverride: false,
  schemaJson: "",
  region: "PK-PB",
  placename: "Lahore",
  latitude: "31.5204",
  longitude: "74.3587",
  icbm: "31.5204, 74.3587",
  hreflang: "ur-PK, en-PK",
  primaryQuestion: "What is Tanzeem-e-Islami?",
  directAnswer: "Tanzeem-e-Islami is an Islamic organization based in Pakistan, founded by Islamic scholar Dr. Israr Ahmed in 1975.",
  faqs: [{ question: "Who founded Tanzeem-e-Islami?", answer: "It was founded by Dr. Israr Ahmed in 1975." }],
  howToSteps: [{ step: "Visit join page", image: "" }],
  entityName: "Tanzeem-e-Islami",
  entityType: "NGO / Islamic Organization",
  speakableSelectors: "#org-ideology-heading, #history-heading",
  preloadUrls: "/fonts/jameel-noori.woff2",
  preconnectOrigins: "https://fonts.gstatic.com",
  priorityHints: "high"
};

export default function OrganizationPageEditor() {
  const { state: savedState, save: saveState, loaded } = useOrganizationPageState();
  const [localState, setLocalState] = useState<OrganizationPageState>(EMPTY_STATE);
  const [seoState, setSeoState] = useState<SeoState>(DEFAULT_SEO);

  // Navigation / Tab states
  const [activeSection, setActiveSection] = useState<string>("heroBanner");
  const [activeTab, setActiveTab] = useState<string>("sections"); // sections | seo
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const { toast } = useToast();
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loaded) {
      // If the localStorage is clean (all empty), initialize with our default demo template
      const isClean = !savedState.heroBanner.quoteText && !savedState.history.heading;
      if (isClean) {
        setLocalState(INITIAL_DEMO_DATA);
      } else {
        setLocalState(savedState);
      }
    }
  }, [loaded, savedState]);

  // Load SEO State
  useEffect(() => {
    try {
      const savedSeo = localStorage.getItem("tanzeem_org_seo_organization");
      if (savedSeo) {
        setSeoState(JSON.parse(savedSeo));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    saveState(localState);
    localStorage.setItem("tanzeem_org_seo_organization", JSON.stringify(seoState));
    toast({
      title: "Content Saved Successfully",
      description: "Changes have been persisted and are live on the organization page.",
    });
  };

  // Image Upload helper converting to Blob URL (and generating temporary local display)
  const handleImageUpload = (
    section: keyof OrganizationPageState,
    field: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    const errorKey = `${section}.${field}`;
    if (file) {
      const fileSizeKb = file.size / 1024;
      if (file.size > 70 * 1024) {
        setImageErrors(prev => ({
          ...prev,
          [errorKey]: `Image size exceeds 70KB limit. Current size is ${fileSizeKb.toFixed(1)}KB.`
        }));
        // Reset file input value so it doesn't show selected name
        e.target.value = "";
        return;
      }

      // Clear error if valid
      setImageErrors(prev => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField(section, field, base64String);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image Uploaded",
        description: `Successfully loaded preview for ${file.name}`
      });
    }
  };

  const handleSeoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const errorKey = "seo.ogImage";
    if (file) {
      const fileSizeKb = file.size / 1024;
      if (file.size > 70 * 1024) {
        setImageErrors(prev => ({
          ...prev,
          [errorKey]: `Image size exceeds 70KB limit. Current size is ${fileSizeKb.toFixed(1)}KB.`
        }));
        e.target.value = "";
        return;
      }

      setImageErrors(prev => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setSeoState(prev => ({ ...prev, ogImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (section: keyof OrganizationPageState, field: string, value: any) => {
    setLocalState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Repeater controls for Ideology Cards
  const addIdeologyCard = () => {
    const newCard: IdeologyCardState = {
      icon: "book",
      title: "New Foundation Pillar",
      urduTitle: "قرآن الکریم",
      description: "Describe the new pillar of ideology...",
      linkLabel: "Learn More",
      linkUrl: "/organization"
    };
    updateField("ideology", "cards", [...localState.ideology.cards, newCard]);
  };

  const removeIdeologyCard = (index: number) => {
    const updated = localState.ideology.cards.filter((_, i) => i !== index);
    updateField("ideology", "cards", updated);
  };

  const updateIdeologyCard = (index: number, field: keyof IdeologyCardState, value: string) => {
    const updated = [...localState.ideology.cards];
    updated[index] = { ...updated[index], [field]: value };
    updateField("ideology", "cards", updated);
  };

  // Repeater controls for Join Cards
  const addJoinCard = () => {
    const newCard: JoinCardState = {
      title: "NEW DIVISION",
      location: "Lahore Headquarters",
      phone: "+92-42-111-222-333",
      description: "Brief details about joining the new division.",
      linkLabel: "Join Wing",
      linkUrl: "/join"
    };
    updateField("join", "cards", [...localState.join.cards, newCard]);
  };

  const removeJoinCard = (index: number) => {
    const updated = localState.join.cards.filter((_, i) => i !== index);
    updateField("join", "cards", updated);
  };

  const updateJoinCard = (index: number, field: keyof JoinCardState, value: string) => {
    const updated = [...localState.join.cards];
    updated[index] = { ...updated[index], [field]: value };
    updateField("join", "cards", updated);
  };

  // SEO Repeater controls
  const addFaq = () => {
    setSeoState(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }]
    }));
  };

  const removeFaq = (index: number) => {
    setSeoState(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...seoState.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setSeoState(prev => ({ ...prev, faqs: updated }));
  };

  const addHowToStep = () => {
    setSeoState(prev => ({
      ...prev,
      howToSteps: [...prev.howToSteps, { step: "", image: "" }]
    }));
  };

  const removeHowToStep = (index: number) => {
    setSeoState(prev => ({
      ...prev,
      howToSteps: prev.howToSteps.filter((_, i) => i !== index)
    }));
  };

  const updateHowToStep = (index: number, value: string) => {
    const updated = [...seoState.howToSteps];
    updated[index] = { ...updated[index], step: value };
    setSeoState(prev => ({ ...prev, howToSteps: updated }));
  };

  // Auto schema builder JSON preview
  const autoSchemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": seoState.schemaType,
    "name": seoState.entityName || "Tanzeem-e-Islami",
    "url": seoState.canonicalUrl || "https://tanzeem.org/organization",
    "description": seoState.metaDescription,
    "mainEntity": {
      "@type": "Question",
      "name": seoState.primaryQuestion,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": seoState.directAnswer
      }
    }
  }, null, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden border border-border bg-background rounded-xl">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 border-b border-border gap-4 shrink-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Organization Page Site Manager
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure layout, text, media, assets and premium SEO schemas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-sm">
            <Save className="w-4 h-4" />
            Save Live Changes
          </Button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 border-r border-border bg-card/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="sections" className="text-xs font-semibold">
                  <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                  Sections
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs font-semibold">
                  <Globe2 className="w-3.5 h-3.5 mr-1" />
                  SEO Panel
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {activeTab === "sections" && (
              <>
                <p className="text-[10px] uppercase font-bold text-muted-foreground px-3 mb-2 tracking-widest">
                  Page Layout Sections
                </p>
                {[
                  { id: "heroBanner", label: "① Hero Quote Banner" },
                  { id: "history", label: "② Our History Section" },
                  { id: "missionStatement", label: "③ Mission Statement" },
                  { id: "founder", label: "④ Founder Biography" },
                  { id: "ameer", label: "⑤ Current Ameer Bio" },
                  { id: "ideology", label: "⑥ Our Ideology Pillars" },
                  { id: "join", label: "⑦ Join Us CTA Banner" }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between",
                      activeSection === sec.id
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-muted text-foreground-muted"
                    )}
                  >
                    {sec.label}
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </>
            )}

            {activeTab === "seo" && (
              <>
                <p className="text-[10px] uppercase font-bold text-muted-foreground px-3 mb-2 tracking-widest">
                  SEO Optimization Tabs
                </p>
                {[
                  { id: "seoBasic", label: "Basic Meta & Robots" },
                  { id: "seoSocial", label: "Social Cards (OG/Twitter)" },
                  { id: "seoSchema", label: "Rich Schema Markup" },
                  { id: "seoGeo", label: "Geotagging & Location" },
                  { id: "seoAeo", label: "AEO & Voice Search" },
                  { id: "seoCrawl", label: "Crawler Performance" }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between",
                      activeSection === sec.id
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-muted text-foreground-muted"
                    )}
                  >
                    {sec.label}
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Dynamic Forms / Editing Area */}
        <div className="flex-1 p-6 overflow-y-auto border-r border-border bg-muted/10 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">
                {activeTab === "sections" ? "Content Editor Block" : "SEO Parameters Panel"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* === SECTION EDITORS === */}

              {activeTab === "sections" && activeSection === "heroBanner" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase">Top Little Accent Label</Label>
                    <Input
                      value={localState.heroBanner.topLabel}
                      onChange={(e) => updateField("heroBanner", "topLabel", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Quote Banner Title</Label>
                    <Textarea
                      value={localState.heroBanner.quoteText}
                      onChange={(e) => updateField("heroBanner", "quoteText", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Quote Author/Attribution</Label>
                    <Input
                      value={localState.heroBanner.attribution}
                      onChange={(e) => updateField("heroBanner", "attribution", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Hero Background Image</Label>
                      <div className="mt-1 flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload("heroBanner", "backgroundImage", e)}
                          className="text-xs"
                        />
                      </div>
                      {imageErrors["heroBanner.backgroundImage"] && (
                        <p className="text-xs text-red-500 font-semibold mt-1">{imageErrors["heroBanner.backgroundImage"]}</p>
                      )}
                      {localState.heroBanner.backgroundImage && (
                        <img
                          src={localState.heroBanner.backgroundImage}
                          alt="preview"
                          className="mt-2 h-20 w-auto object-cover rounded-lg border"
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Islamic Decorative Art Overlay</Label>
                      <div className="mt-1 flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload("heroBanner", "decorativeImage", e)}
                          className="text-xs"
                        />
                      </div>
                      {imageErrors["heroBanner.decorativeImage"] && (
                        <p className="text-xs text-red-500 font-semibold mt-1">{imageErrors["heroBanner.decorativeImage"]}</p>
                      )}
                      {localState.heroBanner.decorativeImage && (
                        <img
                          src={localState.heroBanner.decorativeImage}
                          alt="preview"
                          className="mt-2 h-20 w-auto object-cover rounded-lg border"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sections" && activeSection === "history" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase">Section Heading Title</Label>
                    <Input
                      value={localState.history.heading}
                      onChange={(e) => updateField("history", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">History Description Body (HTML supported)</Label>
                    <Textarea
                      value={localState.history.body}
                      onChange={(e) => updateField("history", "body", e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Button Text Label</Label>
                      <Input
                        value={localState.history.buttonLabel}
                        onChange={(e) => updateField("history", "buttonLabel", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Button Link URL</Label>
                      <Input
                        value={localState.history.buttonUrl}
                        onChange={(e) => updateField("history", "buttonUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">History Callout Side Artwork</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("history", "sideImage", e)}
                        className="text-xs"
                      />
                    </div>
                    {imageErrors["history.sideImage"] && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{imageErrors["history.sideImage"]}</p>
                    )}
                    {localState.history.sideImage && (
                      <img
                        src={localState.history.sideImage}
                        alt="preview"
                        className="mt-2 h-24 w-auto object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "sections" && activeSection === "missionStatement" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase">Little Title Tag</Label>
                    <Input
                      value={localState.missionStatement.subheading}
                      onChange={(e) => updateField("missionStatement", "subheading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Mission Main Heading</Label>
                    <Input
                      value={localState.missionStatement.heading}
                      onChange={(e) => updateField("missionStatement", "heading", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Mission Main Body Paragraphs (HTML supported)</Label>
                    <Textarea
                      value={localState.missionStatement.body}
                      onChange={(e) => updateField("missionStatement", "body", e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {activeTab === "sections" && (activeSection === "founder" || activeSection === "ameer") && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary capitalize">{activeSection} Details Card</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Full Name</Label>
                      <Input
                        value={localState[activeSection as "founder" | "ameer"].name}
                        onChange={(e) => updateField(activeSection as "founder" | "ameer", "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Designation / Role Title</Label>
                      <Input
                        value={localState[activeSection as "founder" | "ameer"].designation}
                        onChange={(e) => updateField(activeSection as "founder" | "ameer", "designation", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Biography text / Introduction (HTML supported)</Label>
                    <Textarea
                      value={localState[activeSection as "founder" | "ameer"].bio}
                      onChange={(e) => updateField(activeSection as "founder" | "ameer", "bio", e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Read More Button Label</Label>
                      <Input
                        value={localState[activeSection as "founder" | "ameer"].readMoreLabel}
                        onChange={(e) => updateField(activeSection as "founder" | "ameer", "readMoreLabel", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Read More URL</Label>
                      <Input
                        value={localState[activeSection as "founder" | "ameer"].readMoreUrl}
                        onChange={(e) => updateField(activeSection as "founder" | "ameer", "readMoreUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase">Avatar Profile Photo</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(activeSection as "founder" | "ameer", "avatar", e)}
                        className="text-xs"
                      />
                    </div>
                    {imageErrors[`${activeSection}.avatar`] && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{imageErrors[`${activeSection}.avatar`]}</p>
                    )}
                    {localState[activeSection as "founder" | "ameer"].avatar && (
                      <img
                        src={localState[activeSection as "founder" | "ameer"].avatar}
                        alt="preview"
                        className="mt-2 h-24 w-auto object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "sections" && activeSection === "ideology" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-xs font-bold uppercase">Section Main Header</Label>
                      <Input
                        value={localState.ideology.heading}
                        onChange={(e) => updateField("ideology", "heading", e.target.value)}
                        className="w-80 mt-1"
                      />
                    </div>
                    <Button onClick={addIdeologyCard} size="sm" className="bg-primary text-white flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add Pillar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localState.ideology.cards.map((card, i) => (
                      <div key={i} className="border border-border p-4 rounded-xl bg-card space-y-4 relative shadow-sm">
                        <button
                          onClick={() => removeIdeologyCard(i)}
                          className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-primary uppercase">Pillar Card #{i + 1}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs font-medium">Select Icon</Label>
                            <Select value={card.icon} onValueChange={(val) => updateIdeologyCard(i, "icon", val)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="book">Book (Quran)</SelectItem>
                                <SelectItem value="star">Star (Prophethood)</SelectItem>
                                <SelectItem value="compass">Compass (Obligations)</SelectItem>
                                <SelectItem value="heart">Heart (Belief)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Title (English)</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => updateIdeologyCard(i, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Title (Urdu calligraphy)</Label>
                            <Input
                              value={card.urduTitle}
                              onChange={(e) => updateIdeologyCard(i, "urduTitle", e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Short Explanation Description</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) => updateIdeologyCard(i, "description", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium">Link Anchor Text</Label>
                            <Input
                              value={card.linkLabel}
                              onChange={(e) => updateIdeologyCard(i, "linkLabel", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Link Target URL</Label>
                            <Input
                              value={card.linkUrl}
                              onChange={(e) => updateIdeologyCard(i, "linkUrl", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "sections" && activeSection === "join" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">CTA Big Heading</Label>
                      <Input
                        value={localState.join.heading}
                        onChange={(e) => updateField("join", "heading", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">CTA Subtitle Description</Label>
                      <Input
                        value={localState.join.subtitle}
                        onChange={(e) => updateField("join", "subtitle", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Membership Forms / Wing Cards</h4>
                    <Button onClick={addJoinCard} size="sm" className="bg-primary text-white flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add Membership Card
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localState.join.cards.map((card, i) => (
                      <div key={i} className="border border-border p-4 rounded-xl bg-card space-y-4 relative shadow-sm">
                        <button
                          onClick={() => removeJoinCard(i)}
                          className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs font-medium">Card/Wing Title (e.g. RAFEEQ)</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => updateJoinCard(i, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Head Office Location</Label>
                            <Input
                              value={card.location}
                              onChange={(e) => updateJoinCard(i, "location", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Helpline / Landline Phone</Label>
                            <Input
                              value={card.phone}
                              onChange={(e) => updateJoinCard(i, "phone", e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Brief info of requirements</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) => updateJoinCard(i, "description", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium">CTA Button Label</Label>
                            <Input
                              value={card.linkLabel}
                              onChange={(e) => updateJoinCard(i, "linkLabel", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Form / Route URL</Label>
                            <Input
                              value={card.linkUrl}
                              onChange={(e) => updateJoinCard(i, "linkUrl", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === SEO TAB EDITORS === */}

              {activeTab === "seo" && activeSection === "seoBasic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Meta Title Tag</Label>
                      <Input
                        value={seoState.metaTitle}
                        onChange={(e) => setSeoState(prev => ({ ...prev, metaTitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Author Tag</Label>
                      <Input
                        value={seoState.author}
                        onChange={(e) => setSeoState(prev => ({ ...prev, author: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs font-bold uppercase">Meta Description (160 Chars max)</Label>
                      <span className={cn("text-xs font-semibold", seoState.metaDescription.length > 160 ? "text-red-500" : "text-green-600")}>
                        {seoState.metaDescription.length} / 160
                      </span>
                    </div>
                    <Textarea
                      value={seoState.metaDescription}
                      onChange={(e) => setSeoState(prev => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Keywords</Label>
                      <Input
                        value={seoState.metaKeywords}
                        onChange={(e) => setSeoState(prev => ({ ...prev, metaKeywords: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Canonical URL</Label>
                      <Input
                        value={seoState.canonicalUrl}
                        onChange={(e) => setSeoState(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-bold uppercase">Index</Label>
                        <Select value={seoState.robotsIndex} onValueChange={(val) => setSeoState(prev => ({ ...prev, robotsIndex: val }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index">Index</SelectItem>
                            <SelectItem value="noindex">No Index</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase">Follow</Label>
                        <Select value={seoState.robotsFollow} onValueChange={(val) => setSeoState(prev => ({ ...prev, robotsFollow: val }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="follow">Follow</SelectItem>
                            <SelectItem value="nofollow">No Follow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seo" && activeSection === "seoSocial" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Open Graph Title</Label>
                      <Input
                        value={seoState.ogTitle}
                        onChange={(e) => setSeoState(prev => ({ ...prev, ogTitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Social Link URL</Label>
                      <Input
                        value={seoState.socialUrl}
                        onChange={(e) => setSeoState(prev => ({ ...prev, socialUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase">Open Graph Description</Label>
                    <Textarea
                      value={seoState.ogDescription}
                      onChange={(e) => setSeoState(prev => ({ ...prev, ogDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">OG Type</Label>
                      <Select value={seoState.ogType} onValueChange={(val) => setSeoState(prev => ({ ...prev, ogType: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">website</SelectItem>
                          <SelectItem value="article">article</SelectItem>
                          <SelectItem value="profile">profile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Twitter Card Style</Label>
                      <Select value={seoState.twitterCard} onValueChange={(val) => setSeoState(prev => ({ ...prev, twitterCard: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">summary</SelectItem>
                          <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                          <SelectItem value="app">app</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Social Share Card Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSeoImageUpload}
                        className="text-xs"
                      />
                      {imageErrors["seo.ogImage"] && (
                        <p className="text-xs text-red-500 font-semibold mt-1">{imageErrors["seo.ogImage"]}</p>
                      )}
                      {seoState.ogImage && (
                        <img
                          src={seoState.ogImage}
                          alt="preview"
                          className="mt-2 h-14 w-auto object-cover rounded-lg border"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seo" && activeSection === "seoSchema" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Schema Markup Template Type</Label>
                      <Select value={seoState.schemaType} onValueChange={(val) => setSeoState(prev => ({ ...prev, schemaType: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WebPage">WebPage Schema</SelectItem>
                          <SelectItem value="Organization">Organization Schema</SelectItem>
                          <SelectItem value="LocalBusiness">LocalBusiness Schema</SelectItem>
                          <SelectItem value="Article">Article Schema</SelectItem>
                          <SelectItem value="Person">Person Bio Schema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="override"
                        checked={seoState.schemaManualOverride}
                        onCheckedChange={(val) => setSeoState(prev => ({ ...prev, schemaManualOverride: val }))}
                      />
                      <Label htmlFor="override" className="text-xs font-bold cursor-pointer">Enable Manual JSON-LD Override</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Generated Structured Data Preview</Label>
                      <pre className="mt-1 p-3 text-xs bg-slate-950 text-slate-100 rounded-lg overflow-x-auto h-64 font-mono">
                        {autoSchemaJson}
                      </pre>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Custom Manual JSON-LD Schema Override</Label>
                      <Textarea
                        value={seoState.schemaJson || autoSchemaJson}
                        onChange={(e) => setSeoState(prev => ({ ...prev, schemaJson: e.target.value }))}
                        rows={12}
                        disabled={!seoState.schemaManualOverride}
                        className="font-mono text-xs mt-1"
                        placeholder="Paste your custom JSON-LD schema markup script here..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seo" && activeSection === "seoGeo" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Target Region / ISO Code</Label>
                      <Input
                        value={seoState.region}
                        onChange={(e) => setSeoState(prev => ({ ...prev, region: e.target.value }))}
                        placeholder="e.g. PK-PB"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Placename Location</Label>
                      <Input
                        value={seoState.placename}
                        onChange={(e) => setSeoState(prev => ({ ...prev, placename: e.target.value }))}
                        placeholder="e.g. Lahore"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Hreflang Configuration</Label>
                      <Input
                        value={seoState.hreflang}
                        onChange={(e) => setSeoState(prev => ({ ...prev, hreflang: e.target.value }))}
                        placeholder="e.g. en-PK, ur-PK"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Latitude coordinate</Label>
                      <Input
                        value={seoState.latitude}
                        onChange={(e) => setSeoState(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Longitude coordinate</Label>
                      <Input
                        value={seoState.longitude}
                        onChange={(e) => setSeoState(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">ICBM Tag Code</Label>
                      <Input
                        value={seoState.icbm}
                        onChange={(e) => setSeoState(prev => ({ ...prev, icbm: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seo" && activeSection === "seoAeo" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Voice Search Primary Question</Label>
                      <Input
                        value={seoState.primaryQuestion}
                        onChange={(e) => setSeoState(prev => ({ ...prev, primaryQuestion: e.target.value }))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs font-bold uppercase">Direct Voice Answer (Max 300 Chars)</Label>
                        <span className={cn("text-xs font-semibold", seoState.directAnswer.length > 300 ? "text-red-500" : "text-green-600")}>
                          {seoState.directAnswer.length} / 300
                        </span>
                      </div>
                      <Input
                        value={seoState.directAnswer}
                        onChange={(e) => setSeoState(prev => ({ ...prev, directAnswer: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Entity Knowledge Name</Label>
                      <Input
                        value={seoState.entityName}
                        onChange={(e) => setSeoState(prev => ({ ...prev, entityName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Entity Type classification</Label>
                      <Input
                        value={seoState.entityType}
                        onChange={(e) => setSeoState(prev => ({ ...prev, entityType: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Speakable CSS Selectors</Label>
                      <Input
                        value={seoState.speakableSelectors}
                        onChange={(e) => setSeoState(prev => ({ ...prev, speakableSelectors: e.target.value }))}
                        placeholder="e.g. #history-heading, .bio"
                      />
                    </div>
                  </div>

                  {/* FAQ repeater */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase">Voice Assistant FAQ Repeater</Label>
                      <Button onClick={addFaq} size="sm" variant="outline" className="h-7 text-xs flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add FAQ
                      </Button>
                    </div>

                    {seoState.faqs.map((faq, i) => (
                      <div key={i} className="border border-border p-3 rounded-lg bg-card space-y-3 relative">
                        <button onClick={() => removeFaq(i)} className="absolute top-2 right-2 text-destructive p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                          <div>
                            <Label className="text-[10px] font-bold uppercase">Question</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaq(i, "question", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold uppercase">Voice / Smart Answer</Label>
                            <Input
                              value={faq.answer}
                              onChange={(e) => updateFaq(i, "answer", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HowTo steps repeater */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase">How-To Walkthrough Steps</Label>
                      <Button onClick={addHowToStep} size="sm" variant="outline" className="h-7 text-xs flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Step
                      </Button>
                    </div>

                    {seoState.howToSteps.map((step, i) => (
                      <div key={i} className="border border-border p-3 rounded-lg bg-card space-y-3 relative flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground">Step {i + 1}</span>
                        <Input
                          value={step.step}
                          onChange={(e) => updateHowToStep(i, e.target.value)}
                          placeholder="Walkthrough step text..."
                          className="h-8 text-xs flex-1"
                        />
                        <button onClick={() => removeHowToStep(i)} className="text-destructive p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "seo" && activeSection === "seoCrawl" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase">Preload URLs List (comma split)</Label>
                      <Input
                        value={seoState.preloadUrls}
                        onChange={(e) => setSeoState(prev => ({ ...prev, preloadUrls: e.target.value }))}
                        placeholder="e.g. /styles.css, /logo.png"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Preconnect Origin URLs</Label>
                      <Input
                        value={seoState.preconnectOrigins}
                        onChange={(e) => setSeoState(prev => ({ ...prev, preconnectOrigins: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase">Performance Priority Hint</Label>
                      <Select value={seoState.priorityHints} onValueChange={(val) => setSeoState(prev => ({ ...prev, priorityHints: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">high priority</SelectItem>
                          <SelectItem value="low">low priority</SelectItem>
                          <SelectItem value="auto">auto detect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Pane */}
        {showPreview && (
          <div className={cn(
            "border-l border-border bg-white flex flex-col transition-all overflow-hidden",
            isPreviewFullscreen ? "fixed inset-16 z-50 shadow-deep rounded-2xl" : "w-full lg:w-[480px] shrink-0"
          )}>
            <div className="flex justify-between items-center bg-slate-50 px-4 py-2 border-b border-border text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5 text-primary">
                <Eye className="w-3.5 h-3.5" />
                Live Parity Preview
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 rounded"
                  onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                >
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isPreviewFullscreen ? "rotate-180" : "")} />
                </Button>
              </div>
            </div>

            {/* Inner Interactive Webpage Preview Frame */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 scrollbar-thin">
              <div className="bg-white rounded-xl shadow-mid overflow-hidden border max-w-lg mx-auto select-none min-h-[800px] flex flex-col font-sans">
                {/* Simulated Header Topbar */}
                <div className="bg-primary text-white py-2 px-4 text-[10px] text-center font-medium">
                  Official Website Clone Preview
                </div>

                {/* ① Hero quote banner preview */}
                <div className="bg-primary text-white text-center py-10 px-6 relative overflow-hidden flex flex-col items-center justify-center">
                  {localState.heroBanner.backgroundImage && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${localState.heroBanner.backgroundImage}')` }} />
                  )}
                  <span className="text-[8px] text-white/50 tracking-widest uppercase relative z-10 mb-2">{localState.heroBanner.topLabel}</span>
                  <h1 className="text-sm md:text-base font-bold relative z-10 max-w-xs">{localState.heroBanner.quoteText}</h1>
                  <p className="text-[10px] text-accent-gold mt-3 font-semibold relative z-10">{localState.heroBanner.attribution}</p>
                </div>

                {/* ② History section preview */}
                <div className="p-6 space-y-3 bg-white">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-primary">{localState.history.heading}</h2>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-2 line-clamp-6">{localState.history.body}</p>
                      {localState.history.buttonLabel && (
                        <div className="mt-3 text-[10px] font-bold text-primary border border-primary/20 rounded-full px-3 py-1 inline-block">
                          {localState.history.buttonLabel} →
                        </div>
                      )}
                    </div>
                    {localState.history.sideImage && (
                      <img src={localState.history.sideImage} className="w-20 h-20 rounded-lg object-cover border" alt="side history" />
                    )}
                  </div>
                </div>

                {/* ③ Mission statement preview */}
                <div className="p-6 bg-slate-50 border-t border-b">
                  <span className="text-[9px] uppercase tracking-wider text-primary font-bold">{localState.missionStatement.subheading}</span>
                  <h3 className="text-sm font-bold mt-1 text-slate-800">{localState.missionStatement.heading}</h3>
                  <p className="text-[11px] text-slate-600 italic mt-2 leading-relaxed">"{localState.missionStatement.body}"</p>
                </div>

                {/* ④ Founder Biography preview */}
                <div className="p-6 bg-white border-b">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl border bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {localState.founder.avatar ? (
                        <img src={localState.founder.avatar} className="w-full h-full object-cover" alt="founder" />
                      ) : (
                        <User className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-primary tracking-wider uppercase">{localState.founder.designation}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{localState.founder.name}</h4>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">{localState.founder.bio}</p>
                    </div>
                  </div>
                </div>

                {/* ⑤ Ameer Biography preview */}
                <div className="p-6 bg-white border-b">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl border bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {localState.ameer.avatar ? (
                        <img src={localState.ameer.avatar} className="w-full h-full object-cover" alt="ameer" />
                      ) : (
                        <User className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-primary tracking-wider uppercase">{localState.ameer.designation}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{localState.ameer.name}</h4>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">{localState.ameer.bio}</p>
                    </div>
                  </div>
                </div>

                {/* ⑥ Ideology pillars preview */}
                <div className="p-6 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-center text-primary mb-4">{localState.ideology.heading}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {localState.ideology.cards.map((card, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 text-center space-y-1.5 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-900 block truncate">{card.title}</span>
                        {card.urduTitle && <span className="text-[10px] font-nastaleeq text-primary block">{card.urduTitle}</span>}
                        <p className="text-[9px] text-slate-500 line-clamp-3 leading-tight">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⑦ Join CTA banner preview */}
                <div className="bg-primary text-white p-6 text-center space-y-4">
                  <div>
                    <h4 className="text-sm font-bold">{localState.join.heading}</h4>
                    <p className="text-[9px] text-white/70 mt-1">{localState.join.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {localState.join.cards.map((card, idx) => (
                      <div key={idx} className="bg-white/10 border border-white/20 p-3 rounded-lg text-center">
                        <span className="text-[10px] font-bold text-accent-gold block">{card.title}</span>
                        <span className="text-[8px] text-white/50 block mt-1">{card.location}</span>
                        <p className="text-[9px] text-white/60 mt-1 line-clamp-2">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
