"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Search, GripVertical, FileText,
  Settings2, Check, UploadCloud, Loader2, ArrowLeft, Image as ImageIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PageRecord } from "@/components/sitemanager/PageForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// TYPES
// ==========================================

interface CategoryItem {
  id: string;
  name: string;
  urduName?: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
}

interface BookItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  fileUrl?: string;
  categoryId?: string;
  isPublished: boolean;
  order: number;
}

// ==========================================
// SORTABLE COMPONENTS
// ==========================================

function SortableCategoryCard({ id, item, onEdit, onDelete, onClick, bookCount }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 cursor-pointer",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-primary/50"
      )}
      onClick={() => onClick(item)}
    >
      <div className="h-auto w-full bg-muted relative border-b border-border">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">Category</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{bookCount} Books</Badge>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
}

function SortableBookCard({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex bg-card rounded-xl border border-border overflow-hidden transition-all duration-200",
        isDragging ? "shadow-2xl border-primary scale-[1.02]" : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="w-24 bg-muted relative border-r border-border shrink-0">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <FileText className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] py-0 px-2">
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:bg-green-500/10" onClick={() => onEdit(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{item.title}</h3>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BooksByCategoryPageEditor({ pageId, initialPageData }: { pageId: string, initialPageData: PageRecord }) {
  const { toast } = useToast();
  const [pageForm, setPageForm] = useState<PageRecord>({ ...initialPageData });
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<Date | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: "", urduName: "", slug: "", description: "", coverImage: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookFormData, setBookFormData] = useState({ title: "", slug: "", description: "", coverImage: "", fileUrl: "", isPublished: true });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation dialogs
  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/book-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories((data.items || []).sort((a: any, b: any) => a.order - b.order));
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        setBooks((data.items || []).sort((a: any, b: any) => a.order - b.order));
      }
    } catch (e) { console.error(e); }
  };

  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPage(true);
    try {
      await fetch(`/api/sitemanager/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageForm.title, slug: pageForm.slug, excerpt: pageForm.excerpt,
          content: pageForm.content, isPublished: pageForm.isPublished,
          metaTitle: pageForm.metaTitle, metaDescription: pageForm.metaDescription, metaKeywords: pageForm.metaKeywords,
        }),
      });
      setLastSavedPage(new Date());
      toast({ title: "Saved", description: "Page settings updated." });
    } catch (error) { toast({ variant: "destructive", title: "Error", description: "Failed to save settings." }); }
    finally { setIsSavingPage(false); }
  };

  // --- Category CRUD ---
  const handleCatSave = async () => {
    if (!catFormData.name || !catFormData.slug) return;
    try {
      const url = editingCatId ? `/api/admin/book-categories/${editingCatId}` : "/api/admin/book-categories";
      const method = editingCatId ? "PUT" : "POST";
      const payload: any = { ...catFormData };
      if (!editingCatId) payload.order = categories.length;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Category saved" });
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleCatDelete = async (item: CategoryItem) => {
    try {
      await fetch(`/api/admin/book-categories/${item.id}`, { method: "DELETE" });
      fetchCategories();
      toast({ title: "Category deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete category" });
    } finally {
      setDeletingCat(null);
    }
  };

  const handleCatDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex(i => i.id === active.id);
    const newIndex = categories.findIndex(i => i.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));
    setCategories(reordered);
    await fetch("/api/admin/book-categories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map(i => ({ id: i.id, orderIndex: i.order })) }),
    });
  };

  // --- Book CRUD ---
  const handleBookSave = async () => {
    if (!bookFormData.title || !bookFormData.slug) return;
    try {
      const url = editingBookId ? `/api/admin/books/${editingBookId}` : "/api/admin/books";
      const method = editingBookId ? "PUT" : "POST";
      const payload: any = { ...bookFormData, categoryId: activeCategory?.id };
      if (!editingBookId) payload.order = books.filter(b => b.categoryId === activeCategory?.id).length;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Success", description: "Book saved" });
      setIsBookModalOpen(false);
      fetchBooks();
    } catch (e) { toast({ variant: "destructive", title: "Error", description: "Save failed." }); }
  };

  const handleBookDelete = async (item: BookItem) => {
    try {
      await fetch(`/api/admin/books/${item.id}`, { method: "DELETE" });
      fetchBooks();
      toast({ title: "Book deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete book" });
    } finally {
      setDeletingBook(null);
    }
  };

  const handleBookDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const catBooks = books.filter(b => b.categoryId === activeCategory?.id);
    const oldIndex = catBooks.findIndex(i => i.id === active.id);
    const newIndex = catBooks.findIndex(i => i.id === over.id);
    const reordered = arrayMove(catBooks, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));

    // update local state
    setBooks(prev => {
      const otherBooks = prev.filter(b => b.categoryId !== activeCategory?.id);
      return [...otherBooks, ...reordered].sort((a, b) => a.order - b.order);
    });

    await fetch("/api/admin/books", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map(i => ({ id: i.id, orderIndex: i.order })) }),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isCat: boolean) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", e.target.files[0]);
    formDataObj.append("type", "uploads");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (isCat) setCatFormData(p => ({ ...p, [field]: url }));
      else setBookFormData(p => ({ ...p, [field]: url }));
    } catch (err) { toast({ variant: "destructive", title: "Error", description: "Upload failed" }); }
    finally { setIsUploading(false); }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handlePdfUploadDirectly(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handlePdfUploadDirectly(e.target.files[0]);
    }
  };

  const { uploadFile: chunkedUpload } = useChunkedUpload();

  const handlePdfUploadDirectly = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a valid PDF document." });
      return;
    }
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: "File too large", description: "Files must be under 100MB." });
      return;
    }
    setIsUploading(true);
    try {
      const data = await chunkedUpload(file, {
        onProgress: (pct) => console.log(`[BooksByCategory] Upload progress: ${pct}%`),
      });

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanedTitle = baseName.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

      setEditingBookId(null);
      setBookFormData({
        title: cleanedTitle,
        slug: slugify(cleanedTitle),
        description: "",
        coverImage: "",
        fileUrl: data.url,
        isPublished: true,
      });
      setIsBookModalOpen(true);
      toast({ title: "PDF Uploaded Successfully", description: "Configure details to save this book." });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Failed to upload the file." });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeBooks = books.filter(b => b.categoryId === activeCategory?.id).filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            {activeCategory ? (
              <Button variant="outline" size="icon" onClick={() => { setActiveCategory(null); setSearchQuery(""); }} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/sitemanager/pages">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {activeCategory ? `${activeCategory.name} Books` : pageForm.title}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {activeCategory ? "Manage books inside this category." : "Manage categories and their associated books."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!activeCategory ? (
            <Button onClick={() => { setEditingCatId(null); setCatFormData({ name: "", urduName: "", slug: "", description: "", coverImage: "" }); setIsCatModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          ) : (
            <Button onClick={() => { setEditingBookId(null); setBookFormData({ title: "", slug: "", description: "", coverImage: "", fileUrl: "", isPublished: true }); setIsBookModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Book
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="list" className="px-4 py-2"><FileText className="w-4 h-4 mr-2" /> Content Library</TabsTrigger>
          {!activeCategory && <TabsTrigger value="settings" className="px-4 py-2"><Settings2 className="w-4 h-4 mr-2" /> Page Setup</TabsTrigger>}
        </TabsList>

        <TabsContent value="list" className="space-y-6">

          {!activeCategory ? (
            // CATEGORIES GRID
            isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin text-primary mr-2" /> Loading Books...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-card rounded-2xl border p-12 text-center text-muted-foreground">No Books Found.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                <SortableContext items={filteredCategories.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCategories.map(cat => (
                      <SortableCategoryCard key={cat.id} id={cat.id} item={cat} onClick={setActiveCategory}
                        bookCount={books.filter(b => b.categoryId === cat.id).length}
                        onEdit={(item: any) => { setEditingCatId(item.id); setCatFormData({ name: item.name, urduName: item.urduName || "", slug: item.slug, description: item.description || "", coverImage: item.coverImage || "" }); setIsCatModalOpen(true); }}
                        onDelete={(item: CategoryItem) => setDeletingCat(item)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : (
            // BOOKS GRID
            <div className="space-y-6">
              {/* File Drag-and-Drop Area for Books */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer py-10 px-6 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center text-center",
                  dragActive ? "border-primary bg-primary/5 scale-[1.005]" : "border-border hover:border-muted-foreground/50 bg-card",
                  isUploading && "pointer-events-none opacity-60"
                )}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="font-semibold text-foreground">Uploading PDF document...</p>
                    <p className="text-xs text-muted-foreground">This will only take a moment.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-foreground text-lg">Drag & Drop a PDF Book here</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Or click anywhere to choose a file from your computer. Titles will auto-generate.
                    </p>
                  </div>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBookDragEnd}>
                <SortableContext items={activeBooks.map(b => b.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBooks.map(book => (
                      <SortableBookCard key={book.id} id={book.id} item={book}
                        onEdit={(item: any) => { setEditingBookId(item.id); setBookFormData({ title: item.title, slug: item.slug, description: item.description || "", coverImage: item.coverImage || "", fileUrl: item.fileUrl || "", isPublished: item.isPublished }); setIsBookModalOpen(true); }}
                        onDelete={(item: BookItem) => setDeletingBook(item)} />
                    ))}
                    {activeBooks.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-xl">No books found in this category.</div>}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <form onSubmit={handlePageSave} className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader><CardTitle>Page SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} /></div>
                <Button type="submit" disabled={isSavingPage}>{isSavingPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Settings"}</Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingCatId ? "Edit Category" : "Add Category"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsCatModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value, slug: editingCatId ? catFormData.slug : slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Urdu Name (Optional)</Label><Input value={catFormData.urduName} onChange={e => setCatFormData({ ...catFormData, urduName: e.target.value })} dir="rtl" /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={catFormData.slug} onChange={e => setCatFormData({ ...catFormData, slug: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUploader
                  value={catFormData.coverImage}
                  onChange={(url) => setCatFormData(prev => ({ ...prev, coverImage: url }))}
                  aspectRatio={5 / 4}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
              <ConfirmDialog
                title={editingCatId ? "Update Category" : "Create Category"}
                description={`Are you sure you want to ${editingCatId ? "update" : "create"} this book category?`}
                onConfirm={handleCatSave}
              >
                <Button disabled={isUploading} className="bg-primary text-primary-foreground hover:bg-primary/95">
                  {editingCatId ? "Update Category" : "Save Category"}
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingBookId ? "Edit Book" : "Add Book"}
              </h2>
              <Button type="button" variant="destructive" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center p-0" onClick={() => setIsBookModalOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={bookFormData.title} onChange={e => setBookFormData({ ...bookFormData, title: e.target.value, slug: editingBookId ? bookFormData.slug : slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={bookFormData.slug} onChange={e => setBookFormData({ ...bookFormData, slug: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUploader
                  value={bookFormData.coverImage}
                  onChange={(url) => setBookFormData(prev => ({ ...prev, coverImage: url }))}
                  aspectRatio={75 / 113}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
              <ConfirmDialog
                title={editingBookId ? "Update Book" : "Add Book"}
                description={`Are you sure you want to ${editingBookId ? "update" : "add"} this book?`}
                onConfirm={handleBookSave}
              >
                <Button disabled={isUploading} className="bg-primary text-primary-foreground hover:bg-primary/95">
                  {editingBookId ? "Update Book" : "Save Book"}
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={!!deletingCat}
        onOpenChange={(open) => !open && setDeletingCat(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deletingCat?.name}"? All books inside will also be removed.`}
        onConfirm={() => { if (deletingCat) handleCatDelete(deletingCat); }}
      />

      {/* Delete Book Confirmation */}
      <ConfirmDialog
        open={!!deletingBook}
        onOpenChange={(open) => !open && setDeletingBook(null)}
        title="Delete Book"
        description={`Are you sure you want to delete "${deletingBook?.title}"?`}
        onConfirm={() => { if (deletingBook) handleBookDelete(deletingBook); }}
      />
    </div>
  );
}
