"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Edit, Video, Headphones, Image as ImageIcon, X, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUploader } from "./ImageUploader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  embedUrl?: string;
  description?: string;
  code?: string;
  slug?: string;
  tags?: string;
}

interface SubCategory {
  id: string;
  title: string;
  image?: string;
  code?: string;
  order?: number;
  mediaItems: MediaItem[];
}

interface MainCategory {
  id: string;
  title: string;
  code?: string;
  image?: string;
  order?: number;
  subCategories: SubCategory[];
}

interface MediaCategoryManagerProps {
  data: string; // Ignored, legacy
  onChange: (val: string) => void; // Ignored, legacy
  mediaType: "audio" | "video";
}

export function MediaCategoryManager({ mediaType }: MediaCategoryManagerProps) {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<{ title: string, desc: string, action: () => Promise<void> | void } | null>(null);

  React.useEffect(() => {
    fetchData();
  }, [mediaType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${mediaType}-categories`);
      const data = await res.json();

      const mapped = data.map((mainCat: any) => ({
        id: mainCat.id,
        title: mainCat.name,
        code: mainCat.code || "",
        image: mainCat.imageUrl || "",
        order: mainCat.order || 0,
        subCategories: (mainCat.subCategories?.map((subCat: any) => ({
          id: subCat.id,
          title: subCat.name,
          image: subCat.imageUrl || "",
          code: subCat.code || "",
          order: subCat.order || 0,
          mediaItems: (mediaType === "audio" ? subCat.audioFiles : subCat.videos)?.map((item: any) => ({
            id: item.id,
            title: item.title,
            mediaUrl: mediaType === "audio" ? item.audioUrl : item.videoUrl,
            embedUrl: item.embedUrl || "",
            description: item.description || "",
            code: item.code || item.episodeNumber || "",
            slug: item.slug || "",
            tags: item.tags || ""
          })) || []
        })) || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setCategories(mapped);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  // Main Category (Tab) states
  const [editingMainCat, setEditingMainCat] = useState<MainCategory | null>(null);
  const [isAddingMainCat, setIsAddingMainCat] = useState(false);
  const [newMainCatImage, setNewMainCatImage] = useState("");

  // Sub Category (Card) states
  const [editingSubCat, setEditingSubCat] = useState<{ cat: SubCategory, mainId: string } | null>(null);

  // Media Item states inside Sub Category
  const [editingMedia, setEditingMedia] = useState<{ item: MediaItem, subId: string } | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // --- Main Category Handlers ---
  const addMainCategory = async (title: string, code: string, imageUrl: string) => {
    try {
      const res = await fetch(`/api/${mediaType}-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title, code, imageUrl, parentId: null })
      });
      const data = await res.json();

      const newCat: MainCategory = {
        id: data.id,
        title,
        code,
        image: imageUrl,
        order: 0,
        subCategories: [],
      };
      setCategories([...categories, newCat]);
      setActiveTab(data.id);
      setIsAddingMainCat(false);
      setNewMainCatImage(""); // Reset image
      toast.success("Main category added");
    } catch (err) {
      toast.error("Failed to create main category");
    }
  };

  const removeMainCategory = async (id: string) => {
    try {
      await fetch(`/api/${mediaType}-categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter(c => c.id !== id));
      if (activeTab === id) setActiveTab(categories[0]?.id || "");
      toast.success("Main category deleted");
    } catch (err) {
      toast.error("Failed to delete main category");
    }
  };

  const saveMainCategory = async (updatedCat: MainCategory) => {
    try {
      await fetch(`/api/${mediaType}-categories/${updatedCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedCat.title,
          code: updatedCat.code,
          imageUrl: updatedCat.image,
          order: updatedCat.order || 0
        })
      });
      setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c).sort((a, b) => (a.order || 0) - (b.order || 0)));
      toast.success("Main tab saved");
    } catch (err) {
      toast.error("Failed to save main tab");
    }
  };

  // --- Sub Category (Card) Handlers ---
  const addSubCategory = async (mainId: string) => {
    try {
      const res = await fetch(`/api/${mediaType}-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `New Sub Category`, parentId: mainId })
      });
      const data = await res.json();

      const newSub: SubCategory = {
        id: data.id,
        title: `New Sub Category`,
        image: "",
        code: "",
        order: 0,
        mediaItems: [],
      };

      setCategories(categories.map(c =>
        c.id === mainId ? { ...c, subCategories: [...c.subCategories, newSub] } : c
      ));

      setEditingSubCat({ cat: newSub, mainId });
      setEditingMedia({
        item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "" },
        subId: newSub.id
      });
    } catch (err) {
      toast.error("Failed to create sub category");
    }
  };

  const saveSubCategory = async (mainId: string, updatedSub: SubCategory) => {
    try {
      await fetch(`/api/${mediaType}-categories/${updatedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedSub.title,
          imageUrl: updatedSub.image,
          code: updatedSub.code,
          order: updatedSub.order || 0
        })
      });

      setCategories(categories.map(c =>
        c.id === mainId ? {
          ...c,
          subCategories: c.subCategories.map(s => s.id === updatedSub.id ? updatedSub : s).sort((a, b) => (a.order || 0) - (b.order || 0))
        } : c
      ));
      toast.success("Sub category saved");
    } catch (err) {
      toast.error("Failed to save sub category");
    }
  };

  const removeSubCategory = async (mainId: string, subId: string) => {
    try {
      await fetch(`/api/${mediaType}-categories/${subId}`, { method: "DELETE" });
      setCategories(categories.map(c =>
        c.id === mainId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) } : c
      ));
      toast.success("Sub category deleted");
    } catch (err) {
      toast.error("Failed to delete sub category");
    }
  };

  // --- Media Items Handlers ---
  const addMediaItem = (subId: string) => {
    const newItem: MediaItem = {
      id: "new",
      title: "",
      slug: "",
      mediaUrl: "",
      embedUrl: "",
      description: "",
    };
    setEditingMedia({ item: newItem, subId });
  };

  const formatEmbedUrl = (url: string) => {
    if (!url) return "";

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    // Dailymotion
    const dmMatch = url.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;

    // OK.ru
    const okMatch = url.match(/(?:ok\.ru\/(?:video|videoembed)\/)([0-9]+)/i);
    if (okMatch && okMatch[1]) return `https://ok.ru/videoembed/${okMatch[1]}`;

    return url;
  };

  const saveMediaItem = async (subId: string, item: MediaItem) => {
    if (!item.title.trim()) {
      toast.error("Please enter a Title for this media file.");
      return;
    }
    
    setIsSavingItem(true);
    try {
      const isNew = item.id === "new";
      const payload = {
        title: item.title,
        description: item.description,
        categoryId: subId.replace("_direct", ""),
        isPublished: true,
        slug: item.slug || (item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()),
        ...(mediaType === "audio"
          ? { audioUrl: item.mediaUrl || "", code: item.code }
          : { videoUrl: item.mediaUrl || "", embedUrl: formatEmbedUrl(item.embedUrl || ""), episodeNumber: item.code })
      };

      let finalId = item.id;
      if (isNew) {
        const res = await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create media item");
        }
        const data = await res.json();
        finalId = mediaType === 'audio' ? data.audio?.id || data.id : data.video?.id || data.id;
      } else {
        const res = await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update media item");
        }
      }

      const finalItem = { ...item, id: finalId };

      setCategories(categories.map(main => ({
        ...main,
        subCategories: main.subCategories.map(sub => {
          if (sub.id === subId) {
            return {
              ...sub,
              mediaItems: isNew
                ? [...sub.mediaItems, finalItem]
                : sub.mediaItems.map(m => m.id === item.id ? finalItem : m)
            };
          }
          return sub;
        })
      })));

      // If we are currently editing the subCat, update its local state too
      if (editingSubCat && editingSubCat.cat.id === subId) {
        setEditingSubCat(prev => prev ? {
          ...prev,
          cat: {
            ...prev.cat,
            mediaItems: isNew
              ? [...prev.cat.mediaItems, finalItem]
              : prev.cat.mediaItems.map(m => m.id === item.id ? finalItem : m)
          }
        } : null);
      }

      setEditingMedia(null);
      toast.success("Saved media item");
    } catch (err: any) {
      console.error("Save media error:", err);
      toast.error(err.message || "Failed to save media item");
    } finally {
      setIsSavingItem(false);
    }
  };

  const removeMediaItem = async (subId: string, itemId: string) => {
    try {
      await fetch(`/api/${mediaType === 'audio' ? 'audio' : 'videos'}/${itemId}`, { method: "DELETE" });
      setCategories(categories.map(main => ({
        ...main,
        subCategories: main.subCategories.map(sub => {
          if (sub.id === subId) {
            return { ...sub, mediaItems: sub.mediaItems.filter(m => m.id !== itemId) };
          }
          return sub;
        })
      })));

      if (editingSubCat && editingSubCat.cat.id === subId) {
        setEditingSubCat(prev => prev ? {
          ...prev,
          cat: { ...prev.cat, mediaItems: prev.cat.mediaItems.filter(m => m.id !== itemId) }
        } : null);
      }

      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 p-4 border rounded-xl">
        <div>
          <h4 className="font-bold text-foreground">Manage {mediaType === "audio" ? "Audios" : "Videos"}</h4>
          <p className="text-xs text-muted-foreground mt-1">Organize content in Tabs (Main Categories), Cards (Sub-categories), and Items.</p>
        </div>
        <Button type="button" onClick={() => setIsAddingMainCat(true)} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Main Category
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading data...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
          No categories found. Click "Add Main Tab" to get started.
        </div>
      ) : !activeTab ? (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div
                key={cat.id || `cat-${i}`}
                className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setActiveTab(cat.id)}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={cat.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-10 h-10 opacity-20" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">View Sub-categories</span>
                  </div>
                </div>
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-foreground text-lg">{cat.code ? `${cat.code} | ` : ""}{cat.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{cat.subCategories?.length || 0} Sub-categories</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMainCat(cat);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingAction({
                          title: "Delete Main Category",
                          desc: "Are you sure you want to delete this main category and all its contents?",
                          action: async () => await removeMainCategory(cat.id)
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeCategory ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("")}>
              ← Back to Categories
            </Button>
            <div>
              <h4 className="text-xl font-bold text-foreground">{activeCategory.title}</h4>
              <p className="text-sm text-muted-foreground">Manage sub-categories (Cards) inside this category.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-lg">{activeCategory.title} Content</h5>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => {
                  let genSub = activeCategory.subCategories.find(s => s.id === activeCategory.id + "_direct");
                  if (!genSub) {
                    genSub = {
                      id: activeCategory.id + "_direct",
                      title: "(General)",
                      image: "",
                      code: "",
                      mediaItems: []
                    };
                    setCategories(categories.map(c => c.id === activeCategory.id ? { ...c, subCategories: [genSub!, ...c.subCategories] } : c));
                  }
                  setEditingSubCat({ cat: genSub, mainId: activeCategory.id });
                  setEditingMedia({
                    item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "" },
                    subId: genSub.id
                  });
                }}>
                  <Video className="w-4 h-4 mr-1" /> Add Direct Video
                </Button>
                <Button size="sm" variant="default" onClick={() => {
                  setPendingAction({
                    title: "Add Sub-category",
                    desc: "Create a new sub-category (card) inside this tab?",
                    action: () => addSubCategory(activeCategory.id)
                  });
                }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Sub-Category
                </Button>
              </div>
            </div>

            {activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).length === 0 && (!activeCategory.subCategories.find(s => s.id.endsWith('_direct'))?.mediaItems.length) ? (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                No sub-categories or videos here yet. Add a card or direct video to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCategory.subCategories.filter(s => !s.id.endsWith('_direct')).map((sub, i) => (
                  <div
                    key={sub.id || `sub-${i}`}
                    className="relative group border border-border/80 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-all shadow-sm cursor-pointer hover:shadow-md flex flex-col"
                    onClick={() => {
                      setEditingSubCat({ cat: sub, mainId: activeCategory.id });
                      setEditingMedia({
                        item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "" },
                        subId: sub.id
                      });
                    }}
                  >
                    {mediaType === "video" && (
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {sub.image ? (
                          <img src={sub.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={sub.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-xs">Manage Content</span>
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex items-start justify-between flex-1">
                      <div>
                        <h5 className="w-70 font-bold text-foreground truncate pr-2">{sub.code ? `${sub.code} | ` : ""}{sub.title}</h5>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubCat({ cat: sub, mainId: activeCategory.id });
                            setEditingMedia({
                              item: { id: "new", title: "", slug: "", mediaUrl: "", embedUrl: "", description: "" },
                              subId: sub.id
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive shrink-0 bg-destructive/10 hover:bg-destructive hover:text-white z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingAction({
                              title: "Delete Sub-category",
                              desc: "Are you sure you want to delete this sub-category?",
                              action: async () => await removeSubCategory(activeCategory.id, sub.id)
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Render Direct Videos as Cards */}
                {activeCategory.subCategories.find(s => s.id.endsWith('_direct'))?.mediaItems.map((item, i) => {
                  const directSub = activeCategory.subCategories.find(s => s.id.endsWith('_direct'))!;
                  const isYt = item.embedUrl?.includes("youtube") || item.mediaUrl?.includes("youtube");
                  let thumb = "";
                  if (isYt) {
                    const ytMatch = (item.embedUrl || item.mediaUrl).match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                    if (ytMatch && ytMatch[1]) thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                  }

                  return (
                    <div
                      key={`direct-${item.id || i}`}
                      className="relative group border border-border/80 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-all shadow-sm cursor-pointer hover:shadow-md flex flex-col"
                      onClick={() => {
                        setEditingSubCat({ cat: directSub, mainId: activeCategory.id });
                        setEditingMedia({ item: item, subId: directSub.id });
                      }}
                    >
                      {mediaType === "video" && (
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {thumb ? (
                            <img src={thumb} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Video className="w-8 h-8 opacity-20" /></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-xs">Edit Video</span>
                          </div>
                        </div>
                      )}
                      <div className="p-4 flex items-start justify-between flex-1">
                        <div>
                          <h5 className="w-70 font-bold text-foreground truncate pr-2">{item.code ? `${item.code} | ` : ""}{item.title}</h5>
                          <p className="text-xs text-primary mt-1 font-medium">Direct Video</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSubCat({ cat: directSub, mainId: activeCategory.id });
                              setEditingMedia({ item: item, subId: directSub.id });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive shrink-0 bg-destructive/10 hover:bg-destructive hover:text-white z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingAction({
                                title: "Delete Video",
                                desc: "Are you sure you want to delete this video?",
                                action: async () => await removeMediaItem(directSub.id, item.id)
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Main Category Modal */}
      <Dialog open={isAddingMainCat} onOpenChange={setIsAddingMainCat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Main Tab</DialogTitle>
            <DialogDescription className="sr-only">Create a new main category tab.</DialogDescription>
          </DialogHeader>
          <form id="addMainCatForm" onSubmit={(e) => e.preventDefault()} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tab Name <span className="text-destructive">*</span></Label>
              <Input name="title" required placeholder="e.g. Dars-e-Quran" />
            </div>
            <div className="space-y-2">
              <Label>Featured Image (16:9 Ratio)</Label>
              <ImageUploader
                value={newMainCatImage}
                onChange={setNewMainCatImage}
                aspectRatio={16 / 9}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingMainCat(false)}>Cancel</Button>
              <Button type="button" onClick={() => {
                const form = document.getElementById('addMainCatForm') as HTMLFormElement;
                if (!form.checkValidity()) { form.reportValidity(); return; }
                const formData = new FormData(form);
                setPendingAction({
                  title: "Create Main Category",
                  desc: "Are you sure you want to create this new main category?",
                  action: () => addMainCategory(formData.get("title") as string, formData.get("code") as string, newMainCatImage)
                });
              }}>Create Tab</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Main Category Modal */}
      <Dialog open={!!editingMainCat} onOpenChange={(v) => !v && setEditingMainCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Main Tab: {editingMainCat?.title}</DialogTitle>
            <DialogDescription className="sr-only">Edit the name and image for this main category tab.</DialogDescription>
          </DialogHeader>
          {editingMainCat && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tab Name <span className="text-destructive">*</span></Label>
                <Input
                  value={editingMainCat.title}
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingMainCat.order || 0}
                  onChange={(e) => setEditingMainCat({ ...editingMainCat, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Featured Image (16:9 Ratio)</Label>
                <ImageUploader
                  value={editingMainCat.image || ""}
                  onChange={(url) => setEditingMainCat({ ...editingMainCat, image: url })}
                  aspectRatio={16 / 9}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingMainCat(null)}>Cancel</Button>
                <Button type="button" onClick={() => {
                  if (!editingMainCat.title) {
                    toast.error("Tab name is required");
                    return;
                  }
                  setPendingAction({
                    title: "Save Main Tab",
                    desc: "Are you sure you want to save changes to this main tab?",
                    action: async () => {
                      await saveMainCategory(editingMainCat);
                      setEditingMainCat(null);
                    }
                  });
                }}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-Category (Card) Manager Modal */}
      <Dialog open={!!editingSubCat} onOpenChange={(v) => !v && setEditingSubCat(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubCat?.cat.id.endsWith("_direct") ? "Manage Direct Videos" : `Manage Sub-category: ${editingSubCat?.cat.title}`}
            </DialogTitle>
            <DialogDescription className="sr-only">Manage media files within this sub-category.</DialogDescription>
          </DialogHeader>
          {editingSubCat && (
            <div className="space-y-6 py-4">
              {/* Card Meta details (hide for direct general category) */}
              {!editingSubCat.cat.id.endsWith("_direct") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Card Title</Label>
                    <Input
                      value={editingSubCat.cat.title}
                      onChange={(e) => setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, title: e.target.value } })}
                      onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={editingSubCat.cat.order || 0}
                      onChange={(e) => setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, order: parseInt(e.target.value) || 0 } })}
                      onBlur={() => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border">
                  <div>
                    <h4 className="font-semibold">Media Files ({editingSubCat.cat.mediaItems.length})</h4>
                    <p className="text-xs text-muted-foreground">Click a file to edit it, or use the form below to add a new one.</p>
                  </div>
                  {editingMedia?.item.id !== "new" && (
                    <Button type="button" size="sm" onClick={() => addMediaItem(editingSubCat.cat.id)}>
                      <Plus className="w-4 h-4 mr-1" /> Add New File
                    </Button>
                  )}
                </div>

                {editingSubCat.cat.mediaItems.length > 0 && (
                  <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {editingSubCat.cat.mediaItems.map((item, i) => (
                      <div key={item.id || `item-${i}`} className={cn("flex items-center justify-between p-3 border rounded-lg bg-card hover:border-primary/50 cursor-pointer", editingMedia?.item.id === item.id ? "ring-2 ring-primary border-primary" : "")} onClick={() => setEditingMedia({ item, subId: editingSubCat.cat.id })}>
                        <div className="flex items-center gap-3 w-full overflow-hidden">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {mediaType === "video" ? <Video className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{item.code ? `${item.code} | ` : ""}{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.mediaUrl || item.embedUrl || "No media URL"}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 text-destructive shrink-0" onClick={(e) => {
                          e.stopPropagation();
                          setPendingAction({
                            title: "Delete Media Item",
                            desc: "Are you sure you want to remove this media file?",
                            action: async () => await removeMediaItem(editingSubCat.cat.id, item.id)
                          });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* INLINE MEDIA ITEM FORM */}
                {editingMedia && (
                  <div className="mt-6 border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-muted/40 p-3 border-b">
                      <h4 className="font-semibold text-foreground flex items-center">
                        {editingMedia.item.id === "new" ? <><Plus className="w-4 h-4 mr-2" /> Add New Media File</> : <><Edit className="w-4 h-4 mr-2" /> Edit Media File: {editingMedia.item.title}</>}
                      </h4>
                    </div>
                    <div className="p-4 space-y-4 bg-card">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title <span className="text-destructive">*</span></Label>
                          <Input
                            value={editingMedia.item.title}
                            onChange={(e) => setEditingMedia({
                              ...editingMedia,
                              item: {
                                ...editingMedia.item,
                                title: e.target.value,
                                slug: editingMedia.item.id === "new" ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") : editingMedia.item.slug
                              }
                            })}
                            placeholder="e.g. Episode 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Slug <span className="text-destructive">*</span></Label>
                          <Input
                            value={editingMedia.item.slug || ""}
                            onChange={(e) => setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, slug: e.target.value } })}
                            placeholder="e.g. episode-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{mediaType === "audio" ? "Audio File URL (.mp3)" : "Video File URL (.mp4, .webm)"}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editingMedia.item.mediaUrl}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, mediaUrl: newUrl } });

                              // Auto-fetch thumbnail if empty
                              if (editingSubCat && !editingSubCat.cat.image) {
                                const ytMatch = newUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                                if (ytMatch && ytMatch[1]) {
                                  const thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
                                  setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, image: thumbUrl } });
                                  toast.success("Thumbnail auto-fetched!");
                                }
                              }
                            }}
                            placeholder="https://..."
                            className="flex-1"
                          />
                          <Button type="button" variant="outline" className="w-24 overflow-hidden relative">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload
                            <input
                              type="file"
                              accept={mediaType === "audio" ? "audio/*" : "video/*"}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                if (!e.target.files?.length) return;
                                const file = e.target.files[0];

                                // 40MB limit for files
                                const MAX_FILE_SIZE = 40 * 1024 * 1024;
                                if (file.size > MAX_FILE_SIZE) {
                                  toast.error("File is too large. Please select a file under 40MB.");
                                  e.target.value = '';
                                  return;
                                }

                                const fd = new FormData();
                                fd.append("file", file);
                                try {
                                  toast.loading("Uploading...");
                                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                                  const data = await res.json();
                                  toast.dismiss();
                                  if (data.url) {
                                    setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, mediaUrl: data.url } });
                                    toast.success("File URL applied");
                                  }
                                } catch (err) {
                                  toast.dismiss();
                                  toast.error("Upload failed");
                                }
                              }}
                            />
                          </Button>
                        </div>
                      </div>

                      {mediaType === "video" && (
                        <div className="space-y-2">
                          <Label>Or Embed URL (YouTube, Vimeo, Dailymotion, OK.ru)</Label>
                          <Input
                            value={editingMedia.item.embedUrl || ""}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              setEditingMedia({ ...editingMedia, item: { ...editingMedia.item, embedUrl: newUrl } });

                              // Auto-fetch thumbnail if empty
                              if (editingSubCat && !editingSubCat.cat.image) {
                                const ytMatch = newUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                                if (ytMatch && ytMatch[1]) {
                                  const thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                                  setEditingSubCat({ ...editingSubCat, cat: { ...editingSubCat.cat, image: thumbUrl } });
                                  toast.success("Thumbnail auto-fetched!");
                                }
                              }
                            }}
                            placeholder="https://www.youtube.com/embed/..."
                          />
                          <p className="text-[10px] text-muted-foreground">If an embedded URL is provided, it will be used by the player instead of the Video File URL.</p>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <div className="pt-2 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setEditingSubCat(null)}>Close</Button>
              {editingSubCat && !editingSubCat.cat.id.endsWith('_direct') && (
                <Button onClick={() => {
                  setPendingAction({
                    title: "Save Sub-category",
                    desc: "Are you sure you want to save changes to this sub-category?",
                    action: () => saveSubCategory(editingSubCat.mainId, editingSubCat.cat)
                  });
                }}>Save Card Changes</Button>
              )}
              {editingMedia && (
                <Button type="button" disabled={isSavingItem} onClick={() => saveMediaItem(editingMedia.subId, editingMedia.item)}>
                  {isSavingItem ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    editingMedia.item.id === "new" ? "Save New Item" : "Update Item"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <ConfirmDialog
        title={pendingAction?.title || "Confirm Action"}
        description={pendingAction?.desc || "Are you sure you want to proceed?"}
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onConfirm={async () => {
          if (!pendingAction) return;
          await pendingAction.action();
          setPendingAction(null);
        }}
      />
    </div>
  );
}
