"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "../ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBookRow({ book, onEdit, onDelete }: { book: any; onEdit: (b: any) => void; onDelete: (id: string, title: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: book.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-muted/30 group">
            <td className="py-3 w-10">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-primary transition-colors">
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>
            <td className="py-3">
                <div className="w-12 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                    {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                </div>
            </td>
            <td className="py-3 font-medium text-foreground">
                {book.title}
                <div className="text-xs text-foreground-muted font-normal">{book.authorName}</div>
            </td>
            <td className="py-3">
                <Badge variant={book.isFeatured ? "default" : "secondary"}>{book.isFeatured ? "Featured" : "Hidden"}</Badge>
            </td>
            <td className="py-3 text-right">
                <button onClick={() => onEdit(book)} className="p-2 text-foreground-light hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(book.id, book.title)} className="p-2 text-foreground-light hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </td>
        </tr>
    );
}

export function FeaturedBooks() {
    const [books, setBooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        authorName: "",
        category: "",
        coverImage: "",
        isFeatured: true,
        buttonText: "",
        buttonUrl: "",
    });

    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch("/api/books?featured=true");
            if (res.ok) {
                const data = await res.json();
                setBooks(data.books || []);
            }
        } catch (error) {
            console.error("Failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = books.findIndex((book) => book.id === active.id);
            const newIndex = books.findIndex((book) => book.id === over.id);

            const newOrder = arrayMove(books, oldIndex, newIndex);
            setBooks(newOrder);

            // Sync with backend
            try {
                const patchPayload = newOrder.map((book, index) => ({
                    id: book.id,
                    order: index,
                }));

                const res = await fetch("/api/books", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orders: patchPayload }),
                });

                if (res.ok) {
                    toast({ title: "Order Updated", description: "Books reordered successfully." });
                } else {
                    throw new Error("Failed to sync order");
                }
            } catch (error) {
                toast({ title: "Sync Failed", description: "Could not persist reordering.", variant: "destructive" });
                fetchBooks(); // Rollback
            }
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                authorName: item.authorName || "",
                category: item.category || "",
                coverImage: item.coverImage || "",
                isFeatured: item.isFeatured,
                buttonText: item.buttonText || "",
                buttonUrl: item.buttonUrl || "",
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "",
                authorName: "Dr. Israr Ahmed",
                category: "General",
                coverImage: "",
                isFeatured: true,
                buttonText: "",
                buttonUrl: "",
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setPreviewUrl(null);
    };

    // Removed handleFileUpload as we use ImageUploader now

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.coverImage) {
            toast({ title: "Cover Missing", description: "You must upload a cover image.", variant: "destructive" });
            setIsLoading(false); return;
        }

        try {
            const isEditing = !!editingItem;
            // Generate slug if it's a new book
            const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

            const res = await fetch(isEditing ? `/api/books/${editingItem.id}` : "/api/books", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isEditing ? formData : { ...formData, slug }),
            });

            if (!res.ok) throw new Error("API Route Blocked");
            toast({ title: "Success!", description: "Featured book saved." });
            closeModal();
            fetchBooks();
        } catch (err: any) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const [deletingBook, setDeletingBook] = useState<{id: string, title: string} | null>(null);

    const handleDelete = async (id: string, title: string) => {
        setDeletingBook(null);
        try {
            const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete book");

            toast({ title: "Deleted", description: "Book record removed." });
            fetchBooks();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to remove book record.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Featured Books</h2>
                    <p className="text-sm text-foreground-muted mt-1">Manage Books Displayed in the Homepage Featured Section</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-primary-dark shadow-sm hover:shadow-md active:scale-95">
                    <Plus className="w-4 h-4" /> Add New Book
                </button>
            </div>

            <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-foreground-muted border-b border-border">
                            <tr>
                                <th className="py-3 w-10"></th>
                                <th className="py-3">Cover</th>
                                <th className="py-3">Details</th>
                                <th className="py-3">Homepage Feature</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <SortableContext
                            items={books.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <tbody className="divide-y divide-border">
                                {books.map(b => (
                                    <SortableBookRow key={b.id} book={b} onEdit={handleOpenModal} onDelete={handleDelete} />
                                ))}
                                {books.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-foreground-muted">
                                            No featured books found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </SortableContext>
                    </table>
                </DndContext>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-bold text-xl text-foreground">{editingItem ? "Edit Book Details" : "Add New Book"}</h3>
                            <button type="button" onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground-muted hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form id="book-form" onSubmit={handleSave} className="p-6 space-y-6 bg-card">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    Book Cover <span className="text-xs font-normal text-foreground-muted">(240x332 Size recommended)</span>
                                </label>
                                <ImageUploader
                                    value={formData.coverImage}
                                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                                    aspectRatio={240 / 332}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Book Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Enter book title" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Author Name</label>
                                    <input type="text" value={formData.authorName} onChange={e => setFormData({ ...formData, authorName: e.target.value })} className="w-full py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="e.g. Dr. Israr Ahmed" />
                                </div>
                                <div className="w-32 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Is Featured?</label>
                                    <select value={formData.isFeatured ? "true" : "false"} onChange={e => setFormData({ ...formData, isFeatured: e.target.value === "true" })} className="w-full py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                                        <option value="true">Featured</option>
                                        <option value="false">Hidden</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Button Text (Optional)</label>
                                    <input type="text" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="w-full py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="e.g. Read Book" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Button URL (Optional)</label>
                                    <input type="text" value={formData.buttonUrl} onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })} className="w-full py-2.5 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="e.g. /books/example" />
                                </div>
                            </div>

                             <div className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all active:scale-95">Cancel</button>
                                <ConfirmDialog
                                    title={editingItem ? "Update Book" : "Create Book"}
                                    description={`Are you sure you want to ${editingItem ? "update" : "create"} this featured book?`}
                                    onConfirm={() => document.getElementById("book-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                                >
                                    <button type="button" disabled={isLoading || isUploading} className="px-8 py-2.5 bg-[#0d5844] text-[#fefefc] rounded-xl font-semibold hover:bg-[#0a4636] transition-all shadow-md active:scale-95 disabled:opacity-50">Save Changes</button>
                                </ConfirmDialog>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDialog
                open={!!deletingBook}
                onOpenChange={(open) => !open && setDeletingBook(null)}
                title="Delete Book"
                description={`Are you sure you want to permanently delete the book "${deletingBook?.title}"?`}
                onConfirm={() => deletingBook && handleDelete(deletingBook.id, deletingBook.title)}
            />
        </div>
    );
}
