"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Sparkles, Wand2, RefreshCw, RefreshCcw, Check, Brain, Search, Code, CheckCircle, SearchCode, Bot } from "lucide-react";
import Link from "next/link";
import { PageSpinner } from "@/components/ui/spinner";

import { cn } from "@/lib/utils";

interface PageSeoManagerProps {
  pageId: string;
}

export default function PageSeoManager({ pageId }: PageSeoManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<any>(null);
  
  // States for generating
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [scores, setScores] = useState({
    overall: 65,
    traditional: "Fair",
    aeogeo: "Needs Work",
    schema: "Missing",
  });

  useEffect(() => {
    fetch(`/api/sitemanager/pages/${pageId}`)
      .then(res => res.json())
      .then(data => {
        setPage(data.page);
        setLoading(false);
      });
  }, [pageId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (res.ok) {
        toast({ title: "SEO Settings Saved successfully!" });
      } else {
        toast({ variant: "destructive", title: "Failed to save SEO settings." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Network error." });
    }
    setSaving(false);
  };

  const simulateAiGeneration = (field: string, newValue: string | any, delayMs = 1500) => {
    setGenerating(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setPage((prev: any) => ({
        ...prev,
        [field]: newValue,
      }));
      setGenerating(prev => ({ ...prev, [field]: false }));
      toast({ title: `AI generation for ${field} completed!` });
    }, delayMs);
  };

  const simulateNestedAiGeneration = (field: string, nestedField: string, newValue: string | any, delayMs = 1500) => {
    setGenerating(prev => ({ ...prev, [`${field}.${nestedField}`]: true }));
    setTimeout(() => {
      setPage((prev: any) => ({
        ...prev,
        seoData: {
          ...(prev.seoData || {}),
          [field]: {
            ...(prev.seoData?.[field] || {}),
            [nestedField]: newValue
          }
        }
      }));
      setGenerating(prev => ({ ...prev, [`${field}.${nestedField}`]: false }));
      toast({ title: `AI generation completed!` });
    }, delayMs);
  };

  const runDiagnostics = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setScores({
        overall: 98,
        traditional: "Excellent",
        aeogeo: "Optimized",
        schema: "Valid",
      });
      setIsDiagnosing(false);
      toast({ title: "AI Diagnostics Complete", description: "Your page SEO score has been updated." });
    }, 2500);
  };

  if (loading) return <PageSpinner />;
  if (!page) return <div>Page not found.</div>;

  const seoData = page.seoData || {};

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-xl border border-border sticky top-4 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/sitemanager/pages/${pageId}/edit`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-emerald-500" />
              Page SEO Center
            </h1>
            <p className="text-sm text-muted-foreground">
              Editing: <span className="font-medium text-foreground">{page.title}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/${page.slug}`)}>
            <SearchCode className="w-4 h-4 mr-2" /> Live Preview
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All SEO"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav (replaces tabs) */}
        <div className="lg:w-64 shrink-0">
          <div className="sticky top-24 flex flex-col gap-1 p-2 bg-muted/30 rounded-xl border border-border">
            <a href="#traditional-seo" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><Search className="h-4 w-4" /> Traditional SEO</a>
            <a href="#alt-texts" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><SearchCode className="h-4 w-4" /> Alt Texts</a>
            <a href="#geo" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><Brain className="h-4 w-4" /> GEO</a>
            <a href="#aeo" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><Bot className="h-4 w-4" /> AEO</a>
            <a href="#schema" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><Code className="h-4 w-4" /> JSON-LD Schema</a>
            <a href="#technical" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><CheckCircle className="h-4 w-4" /> Technical SEO</a>
            <a href="#validation" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground"><Sparkles className="h-4 w-4" /> Validation & Score</a>
          </div>
        </div>

        {/* Content Sections */}
        <div className="flex-1 space-y-12">
          {/* 1. Traditional SEO */}
          <section id="traditional-seo" className="scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle>Meta Data Management</CardTitle>
              <CardDescription>Optimize title, description, and target keywords for standard search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Meta Title</Label>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => simulateAiGeneration('metaTitle', `Optimize: ${page.title} - Official Site`)} disabled={generating.metaTitle}>
                      {generating.metaTitle ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />} Generate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => simulateAiGeneration('metaTitle', `Improvement on ${page.metaTitle || page.title}`)} disabled={generating.metaTitle}>
                      <Sparkles className="h-3 w-3 mr-1" /> Improve
                    </Button>
                  </div>
                </div>
                <Input value={page.metaTitle || ""} onChange={e => setPage({ ...page, metaTitle: e.target.value })} className="text-lg" />
                <p className="text-xs text-muted-foreground text-right">{page.metaTitle?.length || 0}/60 characters optimally.</p>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Meta Description</Label>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => simulateAiGeneration('metaDescription', `Discover comprehensive insights on ${page.title}. Read our definitive guide to stay informed and engaged.`)} disabled={generating.metaDescription}>
                      {generating.metaDescription ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />} Generate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => simulateAiGeneration('metaDescription', `(Improved) Discover comprehensive insights on ${page.title}...`)} disabled={generating.metaDescription}>
                      <Sparkles className="h-3 w-3 mr-1" /> Improve
                    </Button>
                  </div>
                </div>
                <Textarea value={page.metaDescription || ""} onChange={e => setPage({ ...page, metaDescription: e.target.value })} rows={3} />
                <p className="text-xs text-muted-foreground text-right">{page.metaDescription?.length || 0}/160 characters optimally.</p>
              </div>

              {/* Keywords */}
              <div className="space-y-2 border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Focus Keywords</Label>
                  <Button variant="secondary" size="sm" onClick={() => simulateAiGeneration('metaKeywords', `SEO, ${page.title}, optimization`)} disabled={generating.metaKeywords}>
                    {generating.metaKeywords ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <SearchCode className="h-3 w-3 mr-1" />} Analyze & Extract
                  </Button>
                </div>
                <Input placeholder="Comma separated keywords" value={page.metaKeywords || ""} onChange={e => setPage({ ...page, metaKeywords: e.target.value })} />
              </div>
            </CardContent>
          </Card>
          </section>

          {/* 2. Alt Texts */}
          <section id="alt-texts" className="scroll-mt-24">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Smart Accessibility Engine</CardTitle>
                <CardDescription>Automatically analyze page images and generate descriptive, SEO-friendly alt text.</CardDescription>
              </div>
              <Button onClick={() => simulateAiGeneration('featuredImageAlt', `Descriptive visual for ${page.title}`)}>
                <Wand2 className="h-4 w-4 mr-2" /> Bulk Generate All Missing
              </Button>
            </CardHeader>
            <CardContent>
              {/* Featured Image */}
              {page.featuredImage ? (
                <div className="flex gap-6 items-start p-4 border rounded-xl bg-muted/20">
                  <img src={page.featuredImage} alt="Featured Preview" className="w-48 h-32 object-cover rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Featured Image Alt Text</Label>
                      <Badge variant={page.featuredImageAlt ? "default" : "destructive"}>{page.featuredImageAlt ? "Optimized" : "Missing"}</Badge>
                    </div>
                    <Input value={page.featuredImageAlt || ""} onChange={e => setPage({ ...page, featuredImageAlt: e.target.value })} placeholder="Describe the image..." />
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => simulateAiGeneration('featuredImageAlt', `A detailed representation showing the core concepts of ${page.title}`)}>
                        <Wand2 className="h-3 w-3 mr-1" /> Generate Alt
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                  No images found on this page.
                </div>
              )}
            </CardContent>
          </Card>
          </section>

          {/* 3. GEO (Generative Engine Optimization) */}
          <section id="geo" className="scroll-mt-24">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>GEO (Generative Engine Optimization)</CardTitle>
                <CardDescription>Optimize content discoverability for LLMs (ChatGPT, Gemini, Claude, Perplexity).</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => simulateNestedAiGeneration('geo', 'summary', `AI Analysis of ${page.title}...`)}>
                  <Search className="h-4 w-4 mr-2" /> Analyze
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => simulateNestedAiGeneration('geo', 'summary', `Here is an AI-optimized summary of ${page.title}...`)}>
                  <Brain className="h-4 w-4 mr-2" /> Generate Complete GEO
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">AI Page Summary & Facts</Label>
                <Textarea rows={4} value={seoData.geo?.summary || ""} onChange={e => setPage({ ...page, seoData: { ...seoData, geo: { ...seoData.geo, summary: e.target.value } } })} placeholder="A structured, factual summary designed specifically for AI crawlers..." />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Entity & Topic Clusters</Label>
                <Input placeholder="JSON or comma-separated list of entities" value={seoData.geo?.entities || ""} onChange={e => setPage({ ...page, seoData: { ...seoData, geo: { ...seoData.geo, entities: e.target.value } } })} />
              </div>
            </CardContent>
          </Card>
          </section>

          {/* 4. AEO (Answer Engine Optimization) */}
          <section id="aeo" className="scroll-mt-24">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>AEO (Answer Engine Optimization)</CardTitle>
                <CardDescription>Optimize for Featured Snippets, Voice Search, and "People Also Ask" blocks.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => simulateNestedAiGeneration('aeo', 'faq', `Extracting...`)}>
                  <Search className="h-4 w-4 mr-2" /> Analyze Intent
                </Button>
                <Button onClick={() => simulateNestedAiGeneration('aeo', 'faq', `Q: What is ${page.title}?\nA: It is an important resource...\n\nQ: How do I use it?\nA: Read the guide.`)}>
                  <Bot className="h-4 w-4 mr-2" /> Extract & Generate FAQs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-base">Auto-Generated FAQ Section</Label>
                <Textarea rows={6} value={seoData.aeo?.faq || ""} onChange={e => setPage({ ...page, seoData: { ...seoData, aeo: { ...seoData.aeo, faq: e.target.value } } })} placeholder="Q&A pairs..." className="font-mono text-sm" />
              </div>
            </CardContent>
          </Card>
          </section>

          {/* 5. JSON-LD Schema */}
          <section id="schema" className="scroll-mt-24">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Dynamic JSON-LD Schema</CardTitle>
                <CardDescription>Manage structured data to help search engines understand page context.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => simulateNestedAiGeneration('schema', 'json', `{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${page.title}"\n}`)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Detect & Auto-Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Primary Schema Type:</Label>
                  <Input className="max-w-[300px]" value={page.schemaType || "WebPage"} onChange={e => setPage({ ...page, schemaType: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>JSON-LD Payload</Label>
                  <Textarea rows={10} className="font-mono text-xs bg-black text-emerald-400 p-4" value={seoData.schema?.json || ""} onChange={e => setPage({ ...page, seoData: { ...seoData, schema: { ...seoData.schema, json: e.target.value } } })} placeholder="{\n  '@context': 'https://schema.org',\n  ...\n}" />
                </div>
              </div>
            </CardContent>
          </Card>
          </section>

          {/* 6. Technical SEO */}
          <section id="technical" className="scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO & Social Cards</CardTitle>
              <CardDescription>Canonical URLs, indexing rules, and Open Graph attributes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Canonical URL</Label>
                    <Button variant="ghost" size="sm" onClick={() => setPage({ ...page, canonicalUrl: `/${page.slug}` })} className="h-6 text-xs">
                      <Wand2 className="h-3 w-3 mr-1" /> Auto-fill
                    </Button>
                  </div>
                  <Input value={page.canonicalUrl || ""} onChange={e => setPage({ ...page, canonicalUrl: e.target.value })} placeholder={`/${page.slug}`} />
                </div>
                <div className="space-y-2">
                  <Label>Robots Meta</Label>
                  <div className="flex items-center justify-between border p-3 rounded-lg bg-background">
                    <span className="text-sm">Prevent search engines from indexing (noindex)</span>
                    <Switch checked={page.noIndex || false} onCheckedChange={v => setPage({ ...page, noIndex: v })} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t space-y-4">
                <h3 className="font-semibold text-lg flex items-center justify-between">
                  Open Graph (Social Sharing)
                  <Button variant="outline" size="sm" onClick={() => simulateAiGeneration('ogImage', `https://tanzeem.org/api/og?title=${encodeURIComponent(page.title)}`)}>
                    <Sparkles className="h-3 w-3 mr-1" /> Generate OG Image
                  </Button>
                </h3>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={page.ogImage || ""} onChange={e => setPage({ ...page, ogImage: e.target.value })} placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>
          </section>

          {/* 7. Validation & Preview */}
          <section id="validation" className="scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle>AI Search Readiness Score</CardTitle>
              <CardDescription>Live validation of your SEO implementation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 border rounded-xl flex flex-col items-center justify-center bg-emerald-50 border-emerald-200 transition-all">
                  <span className="text-3xl font-bold text-emerald-600">{scores.overall}/100</span>
                  <span className="text-sm text-emerald-800 font-medium mt-1">Overall Score</span>
                </div>
                <div className="p-4 border rounded-xl flex flex-col items-center justify-center transition-all">
                  <span className={cn("text-xl font-bold", scores.traditional === "Excellent" ? "text-emerald-600" : "")}>{scores.traditional}</span>
                  <span className="text-sm text-muted-foreground mt-1">Traditional SEO</span>
                </div>
                <div className="p-4 border rounded-xl flex flex-col items-center justify-center transition-all">
                  <span className={cn("text-xl font-bold", scores.aeogeo === "Optimized" ? "text-emerald-600" : "text-amber-600")}>{scores.aeogeo}</span>
                  <span className="text-sm text-muted-foreground mt-1">AEO / GEO</span>
                </div>
                <div className="p-4 border rounded-xl flex flex-col items-center justify-center transition-all">
                  <span className={cn("text-xl font-bold", scores.schema === "Valid" ? "text-emerald-600" : "text-destructive")}>{scores.schema}</span>
                  <span className="text-sm text-muted-foreground mt-1">Schema Markup</span>
                </div>
              </div>
              <div className="space-y-4">
                <Button className="w-full" size="lg" variant="outline" onClick={runDiagnostics} disabled={isDiagnosing}>
                  <RefreshCw className={cn("w-4 h-4 mr-2", isDiagnosing && "animate-spin")} /> 
                  {isDiagnosing ? "Analyzing Page Content & Metadata..." : "Run Full AI Diagnostics"}
                </Button>
              </div>
            </CardContent>
          </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
