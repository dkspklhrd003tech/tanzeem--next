"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle, Settings2, Plus, ArrowUp, ArrowDown,
  Trash2, GripVertical, Check, ArrowLeft, Search, Eye, Pencil
} from "lucide-react";
import { PageActionBar } from "@/components/admin/PageActionBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaqStyles } from "@/components/faq/FaqStyles";

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  authorName?: string | null;
  updatedAt?: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqPageEditorProps {
  pageId: string;
  initialPageData: PageRecord;
}

const defaultFaqFormData = {
  question: "",
  answer: "",
  category: "English",
  order: 0,
  isPublished: true,
};

export default function FaqPageEditor({ pageId, initialPageData }: FaqPageEditorProps) {
  const { toast } = useToast();

  // Page Settings State
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<Date | null>(null);

  // FAQ Items State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingFaqItem, setDeletingFaqItem] = useState<FaqItem | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [faqFormData, setFaqFormData] = useState(defaultFaqFormData);
  const [faqErrors, setFaqErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoadingFaqs(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.items || []).sort((a: FaqItem, b: FaqItem) => a.order - b.order);
        setFaqs(sorted);
      } else {
        throw new Error("Failed to fetch FAQ items");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load FAQ items. Please try again.",
      });
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  // Page SEO / Settings Save
  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pageForm.title.trim()) errors.title = "Title is required";
    if (!pageForm.slug.trim()) errors.slug = "Slug is required";
    if (Object.keys(errors).length > 0) {
      setPageErrors(errors);
      return;
    }

    setIsSavingPage(true);
    try {
      const res = await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title,
          slug: pageForm.slug,
          excerpt: pageForm.excerpt,
          content: pageForm.content,
          isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle,
          metaDescription: pageForm.metaDescription,
          metaKeywords: pageForm.metaKeywords,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update page settings");
      }

      setLastSavedPage(new Date());
      toast({
        title: "Success",
        description: "FAQs page settings updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save page settings. Please try again.",
      });
    } finally {
      setIsSavingPage(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch("/api/sitemanager/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pageForm, title: `${pageForm.title} (Copy)`, slug: `${pageForm.slug}-copy`, isPublished: false, duplicateFromId: pageId }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Page duplicated." });
        window.location.href = `/sitemanager/pages/${json.page.id}/edit`;
      } else {
        toast({ variant: "destructive", title: json.error ?? "Duplicate failed." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Duplicate failed." });
    }
  };

  // FAQ CRUD Actions
  const handleOpenFaqModal = (faq?: FaqItem) => {
    setFaqErrors({});
    if (faq) {
      setEditingFaq(faq);
      setFaqFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "English",
        order: faq.order,
        isPublished: faq.isPublished,
      });
    } else {
      setEditingFaq(null);
      // Auto-increment order
      const nextOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 0;
      setFaqFormData({
        ...defaultFaqFormData,
        order: nextOrder,
      });
    }
    setIsFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!faqFormData.question.trim()) errors.question = "Question is required";
    if (!faqFormData.answer.trim() || faqFormData.answer === "<p></p>") errors.answer = "Answer is required";
    if (Object.keys(errors).length > 0) {
      setFaqErrors(errors);
      return;
    }

    try {
      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : "/api/admin/faqs";
      const method = editingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqFormData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save FAQ item");
      }

      toast({
        title: "Success",
        description: `FAQ item ${editingFaq ? "updated" : "created"} successfully.`,
      });

      setIsFaqModalOpen(false);
      fetchFaqs();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save FAQ item.",
      });
    }
  };

  const handleFaqDelete = async (id: string) => {
    setDeletingFaqItem(null);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete FAQ item");

      toast({
        title: "Success",
        description: "FAQ item deleted successfully.",
      });

      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete FAQ item. Please try again.",
      });
    }
  };

  const handleReorder = async (faq: FaqItem, direction: "up" | "down") => {
    // Only reorder within the same category to maintain independent ordering
    const targetCategory = getCategory(faq.category);
    const categoryFaqs = faqs.filter(f => getCategory(f.category) === targetCategory).sort((a, b) => a.order - b.order);
    
    const currentIndex = categoryFaqs.findIndex(f => f.id === faq.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categoryFaqs.length) return;

    const currentFaq = categoryFaqs[currentIndex];
    const targetFaq = categoryFaqs[targetIndex];

    // Swap orders
    const tempOrder = currentFaq.order;
    currentFaq.order = targetFaq.order;
    targetFaq.order = tempOrder;

    try {
      // Optimistic state updates
      const newFaqs = [...faqs];
      newFaqs[currentIndex] = targetFaq;
      newFaqs[targetIndex] = currentFaq;
      newFaqs.sort((a, b) => a.order - b.order);
      setFaqs(newFaqs);

      // Save both to backend
      await Promise.all([
        fetch(`/api/admin/faqs/${currentFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentFaq.order }),
        }),
        fetch(`/api/admin/faqs/${targetFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetFaq.order }),
        }),
      ]);

      toast({ title: "Order updated" });
      fetchFaqs(); // sync order back fully
    } catch (error) {
      console.error("Failed to reorder FAQs:", error);
      fetchFaqs(); // Revert on failure
    }
  };

  const getCategory = (cat?: string) => (cat === "General" ? "English" : cat) || "English";

  // Fixed categories list (User wants exactly these to always show)
  const categories = ["all", "English", "Urdu"];

  // Filtered lists
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
      
    const itemCat = getCategory(faq.category).toLowerCase();
    const matchesTab =
      selectedCategoryTab === "all" ||
      itemCat === selectedCategoryTab.toLowerCase() ||
      itemCat === "all";
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    // English first, then Urdu, then by order
    const catA = getCategory(a.category).toLowerCase();
    const catB = getCategory(b.category).toLowerCase();
    
    if (catA === 'english' && catB !== 'english') return -1;
    if (catA !== 'english' && catB === 'english') return 1;
    
    // Within the same category, sort by order
    return a.order - b.order;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <FaqStyles />
      <PageActionBar
        mode="edit"
        title={pageForm.title}
        authorName={initialPageData.authorName}
        updatedAt={initialPageData.updatedAt}
        lastSaved={lastSavedPage}
        previewUrl="/faqs"
        seoUrl={`/sitemanager/pages/${pageId}/edit/seo`}
        isPublished={pageForm.isPublished}
        saving={isSavingPage}
        onDuplicate={handleDuplicate}
        onSaveDraft={() => {
          setPageForm({ ...pageForm, isPublished: false });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
        onPublish={() => {
          setPageForm({ ...pageForm, isPublished: true });
          document.getElementById("hidden-submit-page-btn")?.click();
        }}
      >
        <Button onClick={() => handleOpenFaqModal()} className="bg-primary text-primary-foreground hover:bg-primary/95 ml-2">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ Item
        </Button>
      </PageActionBar>

      {/* Hidden button for triggering page save since the action bar is outside the form */}
      <form onSubmit={handlePageSave} className="hidden">
        <button id="hidden-submit-page-btn" type="submit"></button>
      </form>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="items" className="flex items-center gap-2 px-4 py-2 rounded">
            <HelpCircle className="w-4 h-4" /> FAQ Items
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 px-4 py-2 rounded">
            <Settings2 className="w-4 h-4" /> Page SEO & Setup
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: FAQ Items List */}
        <TabsContent value="items" className="space-y-6 outline-none">
          {/* Filters & Actions */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search FAQs by question or answer..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryTab(cat)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap capitalize",
                    selectedCategoryTab === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-card hover:text-foreground"
                  )}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-12 text-center">Order</th>
                    <th className="px-6 py-4 font-semibold">Question</th>
                    <th className="px-6 py-4 font-semibold w-32">Category</th>
                    <th className="px-6 py-4 font-semibold w-24">Status</th>
                    <th className="px-6 py-4 text-right font-semibold w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingFaqs ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <span className="flex items-center justify-center gap-2">
                          <HelpCircle className="w-5 h-5 animate-pulse text-primary" />
                          Loading FAQ items from database...
                        </span>
                      </td>
                    </tr>
                  ) : filteredFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No FAQs found. Click "Add FAQ Item" to create your first dynamic FAQ!
                      </td>
                    </tr>
                  ) : (
                    filteredFaqs.map((faq, index) => (
                      <tr key={faq.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="font-mono font-medium text-xs bg-muted border border-border px-1.5 py-0.5 rounded">
                              {faq.order}
                            </span>
                            <div className="flex gap-0.5 mt-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-sm"
                                disabled={index === 0}
                                onClick={() => handleReorder(faq, "up")}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-sm"
                                disabled={index === filteredFaqs.length - 1}
                                onClick={() => handleReorder(faq, "down")}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground line-clamp-2" dir="auto">
                            {faq.question}
                          </p>
                          <div
                            className="text-xs text-muted-foreground line-clamp-1 mt-1 font-normal"
                            dir="auto"
                            dangerouslySetInnerHTML={{ __html: faq.answer.replace(/<[^>]*>?/gm, '') }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="capitalize">
                            {getCategory(faq.category)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={faq.isPublished ? "default" : "secondary"}>
                            {faq.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenFaqModal(faq)}
                              aria-label="Edit FAQ"
                            >
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingFaqItem(faq)}
                              aria-label="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Page Setup & SEO */}
        <TabsContent value="settings" className="outline-none">
          <form onSubmit={handlePageSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main settings column */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Metadata</CardTitle>
                    <CardDescription>
                      Manage standard page configurations like title, slug, and description.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="page-title">Page Title <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-title"
                          value={pageForm.title}
                          onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                          className={cn(pageErrors.title && "border-destructive")}
                        />
                        {pageErrors.title && <p className="text-xs text-destructive">{pageErrors.title}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page-slug">Url Slug <span className="text-destructive">*</span></Label>
                        <Input
                          id="page-slug"
                          value={pageForm.slug}
                          onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                          className={cn("font-mono", pageErrors.slug && "border-destructive")}
                        />
                        {pageErrors.slug && <p className="text-xs text-destructive">{pageErrors.slug}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="page-excerpt">Brief Excerpt / Summary</Label>
                      <Textarea
                        id="page-excerpt"
                        value={pageForm.excerpt}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Search Engine Optimization (SEO)</CardTitle>
                    <CardDescription>
                      Configure SEO meta tags to optimize the FAQ page for search indexing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-title">Meta Title</Label>
                      <Input
                        id="seo-title"
                        value={pageForm.metaTitle}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="Default is Page Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo-desc">Meta Description</Label>
                      <Textarea
                        id="seo-desc"
                        value={pageForm.metaDescription}
                        rows={3}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Brief summary for search engine results snippets"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo-kw">Meta Keywords</Label>
                      <Input
                        id="seo-kw"
                        value={pageForm.metaKeywords}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="e.g. faq, beliefs, mission, methodology"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Page Visibility</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pageForm.isPublished ? "Live on website" : "Saved as draft"}
                        </p>
                      </div>
                      <Switch
                        checked={pageForm.isPublished}
                        onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, isPublished: checked }))}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingPage}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      {isSavingPage ? "Saving Configuration..." : "Save Page Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* FAQ Form Dialog / Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl border border-border rounded-xl shadow-lg relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold">
                {editingFaq ? "Edit FAQ Item" : "Add FAQ Item"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsFaqModalOpen(false)}>×</Button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="faq-item-form" onSubmit={handleFaqSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faq-category">Language Category <span className="text-destructive">*</span></Label>
                    <select
                      id="faq-category"
                      required
                      value={faqFormData.category}
                      onChange={(e) => setFaqFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="All">All</option>
                      <option value="English">English</option>
                      <option value="Urdu">Urdu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faq-order">Display Order Index <span className="text-destructive">*</span></Label>
                    <Input
                      id="faq-order"
                      type="number"
                      required
                      value={faqFormData.order}
                      onChange={(e) => setFaqFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-question">Question Text <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="faq-question"
                    required
                    dir="auto"
                    placeholder="Enter English or Urdu question..."
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData(prev => ({ ...prev, question: e.target.value }))}
                    className={cn("min-h-[80px]", faqErrors.question && "border-destructive")}
                  />
                  {faqErrors.question && <p className="text-xs text-destructive">{faqErrors.question}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Answer Text (HTML/RichText supported) <span className="text-destructive">*</span></Label>
                  <RichTextEditor
                    content={faqFormData.answer}
                    onChange={(content) => setFaqFormData(prev => ({ ...prev, answer: content }))}
                    placeholder="Enter FAQ answer details..."
                    defaultToUrdu={faqFormData.category === "Urdu"}
                  />
                  {faqErrors.answer && <p className="text-xs text-destructive">{faqErrors.answer}</p>}
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border border-border">
                  <Switch
                    checked={faqFormData.isPublished}
                    onCheckedChange={(checked) => setFaqFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                  <div>
                    <span className="text-sm font-medium">Visible to Public</span>
                    <p className="text-xs text-muted-foreground">Uncheck to hide this FAQ or keep as draft.</p>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsFaqModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="faq-item-form">
                {editingFaq ? "Update FAQ" : "Save FAQ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        open={!!deletingFaqItem}
        onOpenChange={(open) => !open && setDeletingFaqItem(null)}
        title="Delete FAQ Item"
        description={`Are you sure you want to permanently delete the FAQ item "${deletingFaqItem?.question.substring(0, 50)}..."? This action cannot be undone.`}
        onConfirm={() => deletingFaqItem && handleFaqDelete(deletingFaqItem.id)}
      />
    </div>
  );
}
