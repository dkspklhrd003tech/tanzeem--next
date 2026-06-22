"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Download,
  Printer,
  Share2,
  FileText,
  X,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface PressRelease {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  pdfUrl?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  orderIndex?: number | null;
}

interface PressReleasesGridProps {
  initialItems: PressRelease[];
}

export function PressReleasesGrid({ initialItems }: PressReleasesGridProps) {
  const [items] = useState<PressRelease[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PressRelease | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isCopied, setIsCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
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
  const handleShare = (item: PressRelease) => {
    const shareUrl = `${window.location.origin}/press-releases?id=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({
      title: "Link copied!",
      description: "Press release link copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Download PDF
  const handleDownload = (item: PressRelease) => {
    if (!item.pdfUrl) return;
    const link = document.createElement("a");
    link.href = item.pdfUrl;
    link.download = `${item.slug || "press-release"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloading...",
      description: "Your PDF download has started.",
    });
  };

  // Handle Print
  const handlePrint = (item: PressRelease) => {
    if (item.pdfUrl) {
      // Print PDF via iframe
      if (printIframeRef.current) {
        printIframeRef.current.src = item.pdfUrl;
        setTimeout(() => {
          try {
            printIframeRef.current?.contentWindow?.focus();
            printIframeRef.current?.contentWindow?.print();
          } catch (e) {
            console.error("Print failed", e);
            window.open(item.pdfUrl!, "_blank");
          }
        }, 500);
      }
    } else {
      // Print HTML content
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${item.title}</title>
              <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
                h1 { text-align: center; color: #111; margin-bottom: 5px; }
                .date { text-align: center; color: #666; margin-bottom: 30px; font-style: italic; }
                .content { text-align: justify; font-size: 18px; }
              </style>
            </head>
            <body>
              <h1>${item.title}</h1>
              <div class="date">${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ""}</div>
              <div class="content">${item.content}</div>
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="w-full">
      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-4xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Search press releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-background border-border/80 focus-visible:ring-primary/20 rounded-2xl"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-12 bg-background border border-border rounded-2xl px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30 min-w-[150px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Press Releases Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            const hasPdf = !!item.pdfUrl;
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
                className="group relative bg-card border bg-slate-100 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Visual Top Bar */}
                <div
                  className={cn(
                    "h-2 w-full",
                    hasPdf
                      ? "bg-primary"
                      : "bg-gradient-to-r from-secondary to-primary"
                  )}
                />

                <div className="p-6 flex flex-col h-full min-h-[220px] justify-between">
                  <div>
                    {/* Meta Section */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
                          hasPdf
                            ? "bg-red-50/50 dark:bg-primary/20 text-primary dark:text-primary border-primary/50 dark:border-primary/30"
                            : "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30"
                        )}
                      >
                        {hasPdf ? "PDF Document" : "Statement"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground text-lg leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
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
                      {hasPdf ? "Read PR" + formattedDate : "Read PR" + formattedDate}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Hidden iframe for PDF printing */}
      <iframe ref={printIframeRef} className="hidden" title="PDF Printing Handler" />

      {/* Premium PDF/Document Viewer Modal Popup */}
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
              className="relative bg-card border border-border shadow-2xl rounded-3xl w-[92vw] max-w-5xl h-[88vh] flex flex-col overflow-hidden z-10"
            >
              {/* Custom Red Close Button on Top Right (exactly as requested) */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 w-7 h-7 flex items-center justify-center transition-colors shadow-lg hover:shadow-red-500/20 active:scale-95 z-50"
                title="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>

              {/* Modal Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 md:px-7 border-b border-border/80 bg-muted/40 gap-4">
                <div className="max-w-[70%]">
                  <h2 className="text-xl font-bold text-foreground truncate pr-6">
                    {selectedItem.title}
                  </h2>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-2 pr-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(selectedItem)}
                    className="h-10 rounded-xl px-3.5 text-xs font-semibold bg-background hover:bg-yellow-600 border-border"
                    title="Print document"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>

                  {selectedItem.pdfUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedItem)}
                      className="h-10 rounded-xl px-3.5 text-xs font-semibold bg-background hover:bg-primary border-border"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedItem)}
                    className="h-10 rounded-xl px-3.5 text-xs font-semibold bg-background hover:bg-orange-600 border-border"
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
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-y-auto p-4 md:p-6 flex justify-center items-stretch">
                {selectedItem.pdfUrl ? (
                  // PDF Viewer using iframe/object
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-white">
                    {pdfLoading && (
                      <div className="absolute inset-0 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center z-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                        <p className="text-sm font-medium text-foreground-muted">Loading PDF Document...</p>
                      </div>
                    )}
                    <iframe
                      src={`${selectedItem.pdfUrl}#toolbar=1`}
                      className="w-full h-full"
                      onLoad={() => setPdfLoading(false)}
                      title="PDF Document Viewer"
                    />
                  </div>
                ) : (
                  // Text Statement styled as a professional official A4 sheet
                  <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 md:p-12 text-zinc-800 dark:text-zinc-200 overflow-y-auto mx-auto flex flex-col">
                    {/* Letterhead Emblem placeholder / Letterhead top */}
                    <div className="border-b-2 border-emerald-800 dark:border-emerald-600 pb-5 mb-8 text-center">
                      <h3 className="font-amiri text-2xl font-extrabold text-emerald-800 dark:text-emerald-500 tracking-wide">
                        TANZEEM-E-ISLAMI
                      </h3>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                        Official Press & Media Division
                      </p>
                    </div>

                    {/* Date & Document Info */}
                    <div className="flex justify-between text-xs text-muted-foreground font-medium mb-6">
                      <span>Ref: TI/PR/{selectedItem.slug?.toUpperCase() || selectedItem.id.slice(0, 8)}</span>
                      <span>
                        Date:{" "}
                        {selectedItem.publishedAt
                          ? new Date(selectedItem.publishedAt).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "Recent"}
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 leading-normal tracking-tight text-center md:text-left">
                      {selectedItem.title}
                    </h1>

                    {/* Content Body */}
                    <div
                      className="prose prose-emerald dark:prose-invert max-w-none text-base leading-relaxed text-justify space-y-4"
                      dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                    />

                    {/* Sign-off Footer */}
                    <div className="mt-16 pt-8 border-t border-border/50 text-center md:text-left">
                      <p className="font-bold text-sm text-foreground">Media Spokesperson</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tanzeem-e-Islami Headquarters, Lahore</p>
                    </div>
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
