"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Search,
  Grid,
  List,
  MoreHorizontal,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not load media library.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { uploadFile: chunkedUpload } = useChunkedUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        // 1. Stream file directly to FTP using chunked uploader
        const uploadData = await chunkedUpload(file, {
          onProgress: (pct) => console.log(`[MediaLibrary] Uploading ${file.name}: ${pct}%`),
        });

        // 2. Create database record (already handled inside chunked route, but let's confirm the media ID)
        // Wait, the chunked route ALREADY inserts the media record into the database!
        // We just need to refresh the list.
        successCount++;
      } catch (err: any) {
        console.error(`Upload failed for ${file.name}:`, err);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} file(s).${failCount > 0 ? ` ${failCount} failed.` : ""}`,
      });
      fetchMedia();
    } else if (failCount > 0) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${failCount} file(s).`,
        variant: "destructive",
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [deletingMediaId, setDeletingMediaId] = useState<{id: string, name: string} | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    setDeletingMediaId(null);

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete file");
      }

      toast({
        title: "File Deleted",
        description: `"${name}" has been removed from the library.`,
      });

      setMedia(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(false);

    let successCount = 0;
    for (const id of selectedItems) {
      try {
        const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
        if (res.ok) successCount++;
      } catch (e) { }
    }

    toast({
      title: "Bulk Deletion",
      description: `Successfully deleted ${successCount} items.`,
    });

    fetchMedia();
    setSelectedItems([]);
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "URL Copied",
      description: "Direct link copied to clipboard.",
    });
  };

  const filteredMedia = media.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
          <p className="text-foreground-muted">Manage your uploaded files</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <Button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleting(true)}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <p className="text-foreground-muted">No media files found.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "group relative bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all cursor-pointer",
                selectedItems.includes(item.id) && "ring-2 ring-primary"
              )}
              onClick={() => toggleSelect(item.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.mimeType.startsWith("image/") ? (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                ) : item.mimeType === "application/pdf" ? (
                  <span className="text-4xl">📄</span>
                ) : (
                  <span className="text-4xl">📁</span>
                )}

                {/* Selection Checkbox Overlay */}
                {selectedItems.includes(item.id) && (
                  <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-0.5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.originalName}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] text-foreground-muted uppercase font-bold tracking-tight">
                    {formatFileSize(item.size)}
                  </p>
                  <p className="text-[10px] text-foreground-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Original
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={item.url} download={item.originalName}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem className="text-red-500" onClick={() => setDeletingMediaId({id: item.id, name: item.originalName})}>
                       <Trash2 className="h-4 w-4 mr-2" />
                       Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Size</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredMedia.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-muted/30 cursor-pointer transition-colors",
                      selectedItems.includes(item.id) && "bg-primary/5"
                    )}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.mimeType.startsWith("image/") ? (
                            <img src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">📄</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">
                            {item.originalName}
                          </p>
                          <p className="text-xs text-foreground-muted truncate">
                            {item.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground-muted">
                      {item.mimeType}
                    </td>
                    <td className="p-4 text-foreground-muted">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="p-4 text-foreground-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                           <DropdownMenuItem className="text-red-500" onClick={() => setDeletingMediaId({id: item.id, name: item.originalName})}>
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deletingMediaId}
        onOpenChange={(open) => !open && setDeletingMediaId(null)}
        title="Delete Media File"
        description={`Are you sure you want to permanently delete "${deletingMediaId?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deletingMediaId) {
            return handleDelete(deletingMediaId.id, deletingMediaId.name);
          }
        }}
      />

      <ConfirmDialog
        open={isBulkDeleting}
        onOpenChange={setIsBulkDeleting}
        title="Bulk Delete Media"
        description={`Are you sure you want to permanently delete ${selectedItems.length} items? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
      />
    </motion.div>
  );
}
