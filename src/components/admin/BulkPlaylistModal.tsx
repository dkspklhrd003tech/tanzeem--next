"use client";

import { useState, useEffect } from "react";
import {
  X, RefreshCw, UploadCloud, CheckSquare, Square,
  Video, PlayCircle, ExternalLink, Sparkles, Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface ParsedVideoItem {
  title: string;
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  selected?: boolean;
}

interface BulkPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (videos: ParsedVideoItem[]) => Promise<void>;
  targetName?: string;
}

export function BulkPlaylistModal({ isOpen, onClose, onImport, targetName }: BulkPlaylistModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [defaultTitlePrefix, setDefaultTitlePrefix] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedVideos, setFetchedVideos] = useState<ParsedVideoItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setPlaylistUrl("");
    setDefaultTitlePrefix("");
    setFetchedVideos([]);
    setIsFetching(false);
    setIsImporting(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setPlaylistUrl("");
      setDefaultTitlePrefix("");
      setFetchedVideos([]);
      setIsFetching(false);
      setIsImporting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchPlaylist = async () => {
    if (!playlistUrl.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a YouTube playlist URL, Rumble link, OK.ru link, or video URLs.",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    try {
      const res = await fetch("/api/parse-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        const mapped = data.videos.map((v: ParsedVideoItem, idx: number) => {
          let title = v.title;
          if (defaultTitlePrefix.trim()) {
            title = `${defaultTitlePrefix.trim()} - ${String(idx + 1).padStart(2, "0")}`;
          }
          return { ...v, title, selected: true };
        });
        setFetchedVideos(mapped);
        toast({
          title: "Playlist Fetched!",
          description: `Successfully extracted ${data.videos.length} video(s).`,
        });
      } else {
        toast({
          title: "No Videos Found",
          description: data.error || "Could not extract videos from the provided link. Ensure the playlist is public.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Fetch Failed",
        description: err.message || "An error occurred while fetching the playlist.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const applyDefaultTitleToAll = () => {
    if (!defaultTitlePrefix.trim()) {
      toast({
        title: "Default Title Required",
        description: "Please enter a default title prefix first.",
        variant: "destructive",
      });
      return;
    }
    setFetchedVideos(
      fetchedVideos.map((v, i) => ({
        ...v,
        title: `${defaultTitlePrefix.trim()} - ${String(i + 1).padStart(2, "0")}`,
      }))
    );
    toast({
      title: "Titles Updated",
      description: `Applied default title to ${fetchedVideos.length} video(s).`,
    });
  };

  const toggleSelectAll = (select: boolean) => {
    setFetchedVideos(fetchedVideos.map((v) => ({ ...v, selected: select })));
  };

  const toggleSelectVideo = (index: number) => {
    setFetchedVideos(
      fetchedVideos.map((v, i) => (i === index ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    setFetchedVideos(
      fetchedVideos.map((v, i) => (i === index ? { ...v, title: newTitle } : v))
    );
  };

  const handleExecuteImport = async () => {
    const selected = fetchedVideos.filter((v) => v.selected !== false);
    if (selected.length === 0) {
      toast({
        title: "No Videos Selected",
        description: "Please select at least one video to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      await onImport(selected);
      toast({
        title: "Import Successful!",
        description: `Successfully imported ${selected.length} video(s).`,
      });
      setFetchedVideos([]);
      setPlaylistUrl("");
      setDefaultTitlePrefix("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Import Failed",
        description: err.message || "Failed to import videos.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = fetchedVideos.filter((v) => v.selected !== false).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Playlist (Bulk) Video Importer
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Import multiple videos at once into {targetName || "this section"} from YouTube, Rumble, OK.ru, or custom link lists.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="bg-red-600 text-white rounded-full hover:bg-red-700 hover:text-white" onClick={handleClose}>
            <X className="w-7 h-7" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Playlist URL or Multiple Video Links</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">YouTube Playlist</Badge>
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">Rumble</Badge>
                <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50">OK.ru</Badge>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50">Multi-Links</Badge>
              </div>
            </div>
            <Textarea
              placeholder={`Paste YouTube playlist link e.g.: https://www.youtube.com/playlist?list=PL...\nOr paste multiple video URLs separated by new lines:\nhttps://www.youtube.com/watch?v=...\nhttps://rumble.com/v...\nhttps://ok.ru/video/...`}
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="font-mono text-xs min-h-[90px] resize-y"
            />

            {/* Default Title Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-muted/30 p-3 rounded-xl border border-border/60">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Type className="w-3.5 h-3.5 text-primary" /> Default Video Title / Series Prefix (Optional)
                </Label>
                <Input
                  placeholder="e.g. Zamana Gawah Hai 2023 (Leave blank to use original video titles)"
                  value={defaultTitlePrefix}
                  onChange={(e) => setDefaultTitlePrefix(e.target.value)}
                  className="text-xs h-9 bg-background"
                />
              </div>
              <div className="flex gap-2">
                {fetchedVideos.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyDefaultTitleToAll}
                    className="h-9 text-xs flex-1"
                  >
                    Apply Title to All
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleFetchPlaylist}
                  disabled={isFetching || !playlistUrl.trim()}
                  className="h-9 text-xs flex-1"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Fetching...
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 mr-1.5" /> Fetch Playlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {fetchedVideos.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/40 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-sm">
                    Extracted Videos ({fetchedVideos.length})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedCount} of {fetchedVideos.length} selected for import
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleSelectAll(true)}>
                    <CheckSquare className="w-3.5 h-3.5 mr-1" /> Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleSelectAll(false)}>
                    <Square className="w-3.5 h-3.5 mr-1" /> Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                {fetchedVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-xl border flex items-start gap-3 transition-all",
                      video.selected !== false
                        ? "bg-card border-primary/40 shadow-sm"
                        : "bg-muted/30 border-border opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={video.selected !== false}
                      onChange={() => toggleSelectVideo(idx)}
                      className="mt-1.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                    />

                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-muted relative shrink-0 border border-border">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt={video.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <PlayCircle className="w-6 h-6 opacity-30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        value={video.title}
                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                        className="text-xs font-semibold h-8"
                        placeholder="Video Title"
                      />
                      <div className="flex items-center gap-2">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{video.videoUrl}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <Button className="px-3 py-2 border border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white" variant="ghost" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExecuteImport}
            disabled={isImporting || selectedCount === 0}
            className="px-6"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Importing Videos...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" /> Import {selectedCount} Selected Video(s)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
