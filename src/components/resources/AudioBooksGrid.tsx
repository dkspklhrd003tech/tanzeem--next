"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Download,
  Share2,
  X,
  ChevronRight,
  Check,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface AudioBook {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  audioUrl?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  orderIndex?: number | null;
}

interface AudioBooksGridProps {
  initialItems: AudioBook[];
}

export function AudioBooksGrid({ initialItems }: AudioBooksGridProps) {
  const [items] = useState<AudioBook[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<AudioBook | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Disable body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
          item.content.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const orderA = a.orderIndex ?? 0;
      const orderB = b.orderIndex ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, sortBy]);

  // Handle Share Link
  const handleShare = (item: AudioBook) => {
    const shareUrl = `${window.location.origin}/audio-books?id=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({
      title: "Link copied!",
      description: "Audio book link copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Download Audio
  const handleDownload = (item: AudioBook) => {
    if (!item.audioUrl) return;
    const link = document.createElement("a");
    link.href = item.audioUrl;
    link.download = `${item.slug || "audio-book"}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloading...",
      description: "Your audio download has started.",
    });
  };

  return (
    <div className="w-full">
      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-[#0d5844]/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-5xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#0d5844]" />
            <Input
              placeholder="Search Audio Books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-background border-border/80 focus-visible:ring-primary/20 rounded-xl"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-12 bg-background border border-border rounded-xl px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30 min-w-[120px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Audio Books Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => {
            const hasAudio = !!item.audioUrl;
            const dateStr = item.publishedAt || item.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "Recent";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-card border bg-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Visual Top Bar / Image */}
                {item.featuredImage ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "h-2 w-full",
                      hasAudio
                        ? "bg-primary"
                        : "bg-gradient-to-r from-secondary to-primary"
                    )}
                  />
                )}

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Meta Section */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground text-md leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    {item.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-4 mt-5 border-t border-border/50">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      {hasAudio ? "Listen" : "View"}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Audio Book Modal Popup */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-card border border-border shadow-2xl rounded-2xl w-[92vw] max-w-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Custom Red Close Button on Top Right */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-7 h-7 flex items-center justify-center transition-colors shadow-lg hover:shadow-red-500/20 active:scale-95 z-50"
                title="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>

              {/* Modal Top Bar */}
              <div className="items-center justify-between p-5 md:px-7 border-b border-border/80 bg-muted/40 gap-4">
                <div className="max-w-[85%]">
                  <h2 className="text-xl font-bold text-foreground line-clamp-2 pr-4">
                    {selectedItem.title}
                  </h2>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center justify-start gap-2 pt-4">
                  {selectedItem.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedItem)}
                      className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-[#0d5844] hover:bg-[#0d5844] hover:text-white shadow-md shadow-[#0d5844]/40 hover:shadow-lg hover:shadow-[#0d5844]/60"
                      title="Download Audio"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedItem)}
                    className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-[#108ece] hover:bg-[#108ece] hover:text-white shadow-md shadow-[#108ece]/40 hover:shadow-lg hover:shadow-[#108ece]/60"
                    title="Copy share link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="bg-zinc-50 dark:bg-zinc-900 p-6 md:p-8 flex flex-col justify-center items-center">
                
                {/* Audio Player */}
                {selectedItem.audioUrl ? (
                  <div className="w-full bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-md border border-border">
                    <h3 className="font-semibold text-lg text-center mb-6 text-emerald-800 dark:text-emerald-500">
                      Now Playing
                    </h3>
                    <audio
                      controls
                      autoPlay
                      controlsList="nodownload"
                      className="w-full h-12"
                      src={selectedItem.audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Audio file not available.</p>
                  </div>
                )}

                {/* Content description if any */}
                {selectedItem.content && selectedItem.content !== "<p></p>" && (
                  <div className="w-full mt-6 bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-md border border-border">
                    <h4 className="font-semibold mb-3">Description</h4>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: selectedItem.content }} 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
