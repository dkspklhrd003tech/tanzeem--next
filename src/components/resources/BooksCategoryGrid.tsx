"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, Printer, Share2, FileText, X,
  ChevronRight, Check, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface Book {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  isPublished: boolean;
  orderIndex?: number | null;
}

interface BooksCategoryGridProps {
  categoryName: string;
  initialItems: Book[];
}

export function BooksCategoryGrid({ categoryName, initialItems }: BooksCategoryGridProps) {
  const [items] = useState<Book[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Book | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedItem) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q)));
    }
    return result;
  }, [items, searchQuery]);

  const handleShare = (item: Book) => {
    const shareUrl = `${window.location.href}?book=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied!", description: "Book link copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (item: Book) => {
    if (!item.fileUrl) return;
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = `${item.slug || "book"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloading...", description: "Your PDF download has started." });
  };

  const handlePrint = (item: Book) => {
    if (item.fileUrl && printIframeRef.current) {
      printIframeRef.current.src = item.fileUrl;
      setTimeout(() => {
        try {
          printIframeRef.current?.contentWindow?.focus();
          printIframeRef.current?.contentWindow?.print();
        } catch (e) {
          window.open(item.fileUrl!, "_blank");
        }
      }, 500);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-[#0d5844]/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-5xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#0d5844]" />
            <Input
              placeholder={`Search in ${categoryName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-background border-border/80 focus-visible:ring-primary/20 rounded-xl"
            />
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Books Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="group relative bg-card border bg-slate-50 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-300 shadow-sm flex flex-col"
            >
              <div className="w-full aspect-[10/16] bg-muted relative border-b border-border">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 bg-slate-200">
                    <FileText className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors duration-200 text-center mb-2 line-clamp-3">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <iframe ref={printIframeRef} className="hidden" title="PDF Printing Handler" />

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-card border border-border shadow-2xl rounded-2xl w-[92vw] max-w-5xl h-[88vh] flex flex-col overflow-hidden z-10"
            >
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-7 h-7 flex items-center justify-center transition-colors shadow-lg hover:shadow-red-500/20 active:scale-95 z-50"
                title="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>

              <div className="items-center justify-between p-5 md:px-7 border-b border-border/80 bg-muted/40 gap-4">
                <div className="max-w-[80%]">
                  <h2 className="text-xl font-bold text-md line-clamp-1 pr-4">{selectedItem.title}</h2>
                </div>
                <div className="flex items-center justify-start gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handlePrint(selectedItem)} className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-yellow-600 hover:bg-yellow-600 hover:text-white">
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  {selectedItem.fileUrl && (
                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedItem)} className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-[#0d5844] hover:bg-[#0d5844] hover:text-white">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleShare(selectedItem)} className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-[#108ece] hover:bg-[#108ece] hover:text-white">
                    {isCopied ? <><Check className="h-4 w-4 mr-2 text-green-600" /> Copied</> : <><Share2 className="h-4 w-4 mr-2" /> Share</>}
                  </Button>
                </div>
              </div>

              <div className="flex-1 bg-zinc-100  overflow-hidden flex justify-center items-stretch">
                {selectedItem.fileUrl ? (
                  <div className="relative w-full h-full bg-white">
                    {pdfLoading && (
                      <div className="absolute inset-0 bg-white  flex flex-col items-center justify-center z-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                        <p className="text-sm font-medium text-foreground-muted">Loading PDF Document...</p>
                      </div>
                    )}
                    <iframe src={`${selectedItem.fileUrl}#toolbar=1`} className="w-full h-full" onLoad={() => setPdfLoading(false)} title="PDF Viewer" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    <p>No PDF document available for this book.</p>
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
