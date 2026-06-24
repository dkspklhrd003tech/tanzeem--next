"use client";

import { useState, useEffect } from "react";
import { ExternalLink, X, Printer, Download, Share2, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface MagazineLink {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

export function MagazineClientView({ links }: { links: MagazineLink[] }) {
  const [selectedLink, setSelectedLink] = useState<MagazineLink | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedLink) {
      document.body.style.overflow = "hidden";
      setPdfLoading(true);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedLink]);

  const handleShare = () => {
    if (!selectedLink) return;
    const shareUrl = selectedLink.url;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({
      title: "Link copied!",
      description: "Magazine link copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedLink) return;
    const link = document.createElement("a");
    link.href = selectedLink.url;
    link.download = `${selectedLink.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloading...",
      description: "Your PDF download has started.",
    });
  };

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {links.map((link, index) => (
          <button
            key={link.id}
            onClick={() => setSelectedLink(link)}
            className="group relative flex flex-col items-start justify-between p-8 overflow-hidden rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 text-left hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            {/* Cinematic background gradient that appears on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 w-full">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                <ExternalLink className="h-5 w-5" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {link.title}
              </h3>

              <div className="flex items-center gap-2 mt-6 uppercase tracking-wider">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">Read Now</span>
                <span className="opacity-0 -translate-x-4 text-primary group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLink(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-card border border-border shadow-2xl rounded-2xl w-[92vw] max-w-5xl h-[88vh] flex flex-col overflow-hidden z-10"
            >
              {/* Custom Red Close Button on Top Right */}
              <button
                type="button"
                onClick={() => setSelectedLink(null)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-7 h-7 flex items-center justify-center transition-colors shadow-lg hover:shadow-red-500/20 active:scale-95 z-50"
                title="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>

              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-5 md:px-7 border-b border-border/80 bg-muted/40 gap-4 pr-16">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {selectedLink.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 overflow-hidden">
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate font-mono">
                      {selectedLink.url}
                    </span>
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center justify-center gap-2">
                  {selectedLink.url.endsWith(".pdf") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="h-8 rounded-xl px-3.5 text-xs font-semibold !border-[#0d5844] hover:bg-[#0d5844] hover:text-white shadow-md shadow-[#0d5844]/40 hover:shadow-lg hover:shadow-[#0d5844]/60"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
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
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-4 md:p-6 flex justify-center items-stretch relative">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-white">
                  {pdfLoading && (
                    <div className="absolute inset-0 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center z-20">
                      <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Loading Document...</p>
                    </div>
                  )}
                  <iframe
                    src={selectedLink.url}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    loading="lazy"
                    onLoad={() => setPdfLoading(false)}
                    title={selectedLink.title}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
