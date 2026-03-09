"use client";

import { useState } from "react";
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

// Mock media data
const mockMedia = [
  { id: "1", filename: "lecture-thumbnail.jpg", originalName: "Lecture Thumbnail.jpg", mimeType: "image/jpeg", size: 245000, url: "/media/lecture.jpg", createdAt: "2024-01-15" },
  { id: "2", filename: "book-cover.png", originalName: "Book Cover.png", mimeType: "image/png", size: 512000, url: "/media/book.png", createdAt: "2024-01-14" },
  { id: "3", filename: "document.pdf", originalName: "Islamic Guide.pdf", mimeType: "application/pdf", size: 1200000, url: "/media/guide.pdf", createdAt: "2024-01-13" },
  { id: "4", filename: "audio-thumb.jpg", originalName: "Audio Thumbnail.jpg", mimeType: "image/jpeg", size: 180000, url: "/media/audio.jpg", createdAt: "2024-01-12" },
  { id: "5", filename: "event-banner.jpg", originalName: "Event Banner.jpg", mimeType: "image/jpeg", size: 890000, url: "/media/event.jpg", createdAt: "2024-01-11" },
  { id: "6", filename: "team-photo.jpg", originalName: "Team Photo.jpg", mimeType: "image/jpeg", size: 456000, url: "/media/team.jpg", createdAt: "2024-01-10" },
];

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredMedia = mockMedia.filter(
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
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
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
            <Button variant="outline" size="sm">
              Download
            </Button>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
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
              <div className="aspect-square bg-muted flex items-center justify-center">
                {item.mimeType.startsWith("image/") ? (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">🖼️</span>
                  </div>
                ) : item.mimeType === "application/pdf" ? (
                  <span className="text-4xl">📄</span>
                ) : (
                  <span className="text-4xl">📁</span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.originalName}
                </p>
                <p className="text-xs text-foreground-muted">
                  {formatFileSize(item.size)}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
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
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Size</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleSelect(item.id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        {item.mimeType.startsWith("image/") ? "🖼️" : "📄"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.originalName}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.filename}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground-muted text-sm">
                    {item.mimeType}
                  </td>
                  <td className="p-4 text-foreground-muted text-sm">
                    {formatFileSize(item.size)}
                  </td>
                  <td className="p-4 text-foreground-muted text-sm">
                    {item.createdAt}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
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
      )}
    </motion.div>
  );
}
