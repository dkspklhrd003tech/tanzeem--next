"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, RefreshCw, UploadCloud, CheckSquare, Square,
  Video, Headphones, PlayCircle, ExternalLink, Sparkles, Type,
  ArrowUp, ArrowDown, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

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
  mediaType?: "audio" | "video";
}

export function BulkPlaylistModal({ isOpen, onClose, onImport, targetName, mediaType = "video" }: BulkPlaylistModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [defaultTitlePrefix, setDefaultTitlePrefix] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedVideos, setFetchedVideos] = useState<ParsedVideoItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Audio Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useChunkedUpload();
  const [dragActive, setDragActive] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [totalAudioFiles, setTotalAudioFiles] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const handleClose = () => {
    setPlaylistUrl("");
    setDefaultTitlePrefix("");
    setFetchedVideos([]);
    setIsFetching(false);
    setIsImporting(false);
    setIsUploadingAudio(false);
    setUploadProgress(0);
    setCurrentFileName("");
    setTotalAudioFiles(0);
    setCurrentAudioIndex(0);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setPlaylistUrl("");
      setDefaultTitlePrefix("");
      setFetchedVideos([]);
      setIsFetching(false);
      setIsImporting(false);
      setIsUploadingAudio(false);
      setUploadProgress(0);
      setCurrentFileName("");
      setTotalAudioFiles(0);
      setCurrentAudioIndex(0);
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

  const handleAudioFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files)
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|m4a)$/i.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

    if (audioFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select valid audio files (.mp3, .wav, .ogg, .aac, .m4a).",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAudio(true);
    setTotalAudioFiles(audioFiles.length);
    setCurrentAudioIndex(1);
    const newItems: ParsedVideoItem[] = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setCurrentAudioIndex(i + 1);
      setCurrentFileName(file.name);
      setUploadProgress(0);

      try {
        const res = await uploadFile(file, {
          onProgress: (pct) => setUploadProgress(pct),
        });

        // Clean filename extension for default title
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .trim();

        newItems.push({
          title: cleanTitle || file.name,
          videoUrl: res.url,
          embedUrl: res.url,
          thumbnailUrl: "",
          selected: true,
        });
      } catch (err: any) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${err.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    }

    setIsUploadingAudio(false);
    setUploadProgress(0);
    setCurrentFileName("");

    if (newItems.length > 0) {
      setFetchedVideos((prev) => [...prev, ...newItems]);
      toast({
        title: "Audio Files Uploaded!",
        description: `Successfully uploaded ${newItems.length} audio file(s). Ready for import.`,
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleAudioFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleAudioFiles(e.target.files);
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

  const handleMoveVideo = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fetchedVideos.length - 1) return;
    const newItems = [...fetchedVideos];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setFetchedVideos(newItems);
  };

  const handleRemoveVideo = (index: number) => {
    setFetchedVideos(fetchedVideos.filter((_, i) => i !== index));
  };

  const handleExecuteImport = async () => {
    const selected = fetchedVideos.filter((v) => v.selected !== false);
    if (selected.length === 0) {
      toast({
        title: mediaType === "audio" ? "No Audios Selected" : "No Videos Selected",
        description: `Please select at least one ${mediaType === "audio" ? "audio" : "video"} to import.`,
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      await onImport(selected);
      toast({
        title: "Import Successful!",
        description: `Successfully imported ${selected.length} ${mediaType === "audio" ? "audio(s)" : "video(s)"}.`,
      });
      setFetchedVideos([]);
      setPlaylistUrl("");
      setDefaultTitlePrefix("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Import Failed",
        description: err.message || `Failed to import ${mediaType === "audio" ? "audios" : "videos"}.`,
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
              {mediaType === "audio" ? "Bulk Audio Importer" : "Playlist (Bulk) Video Importer"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {mediaType === "audio"
                ? `Upload multiple audio files at once into ${targetName || "this section"}.`
                : `Import multiple videos at once into ${targetName || "this section"} from YouTube, Rumble, OK.ru, or custom link lists.`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="bg-red-600 text-white rounded-full hover:bg-red-700 hover:text-white" onClick={handleClose}>
            <X className="w-7 h-7" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {mediaType === "audio" ? (
            /* Audio Drag & Drop Upload Section (Cinematic 3D Circular Uploader) */
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden group shadow-lg hover:shadow-2xl hover:shadow-primary/10",
                  dragActive
                    ? "border-primary bg-primary/10 scale-[1.01] shadow-primary/20"
                    : "border-primary/40 bg-gradient-to-b from-card via-muted/20 to-muted/50 hover:border-primary hover:bg-primary/5"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* 3D Circular Ring Stage */}
                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  {/* Outer Rotating Dashed Ring */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full border-2 border-dashed border-primary/30 transition-all duration-700",
                      isUploadingAudio ? "animate-[spin_15s_linear_infinite] border-primary" : "group-hover:rotate-45 group-hover:border-primary/60"
                    )}
                  />

                  {/* Radial Backdrop Glow */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-xl group-hover:scale-110 transition-transform duration-500" />

                  {/* SVG Circular Progress Meter (Visible during upload) */}
                  {isUploadingAudio ? (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        className="text-muted/30 stroke-current"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        className="text-primary stroke-current transition-all duration-300 ease-out"
                        strokeWidth="6"
                        strokeDasharray={427.25}
                        strokeDashoffset={427.25 - (427.25 * (uploadProgress || 0)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                  ) : null}

                  {/* Inner 3D Orb Button */}
                  <div className="relative z-10 w-28 h-28 rounded-full bg-card/90 backdrop-blur-md border border-primary/30 shadow-xl flex flex-col items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:border-primary">
                    {isUploadingAudio ? (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <RefreshCw className="w-7 h-7 text-primary animate-spin" />
                        <span className="text-xs font-extrabold text-primary">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Details & Live Counter */}
                <div className="space-y-2 mt-2 max-w-md z-10">
                  {isUploadingAudio ? (
                    <div className="space-y-1.5 animate-pulse">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <span>Uploading File {currentAudioIndex} of {totalAudioFiles}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-xs mx-auto">
                        {currentFileName}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                        Drop your audio files here to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, OGG, AAC, M4A — large files supported
                      </p>
                    </>
                  )}
                </div>

                {/* Decorative Bottom Divider */}
                <div className="flex items-center gap-3 w-full max-w-xs mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">or select files</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>
            </div>
          ) : (
            /* Video Playlist Link Section */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">
                  Playlist URL or Multiple Video Links
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">
                    YouTube Playlist
                  </Badge>
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
          )}

          {/* Preview Section */}
          {fetchedVideos.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/40 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-sm">
                    {mediaType === "audio" ? `Uploaded Audios (${fetchedVideos.length})` : `Extracted Videos (${fetchedVideos.length})`}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedCount} of {fetchedVideos.length} selected for import
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setFetchedVideos(prev => [...prev].reverse())} title="Invert / Reverse file order">
                    <ArrowDown className="w-3.5 h-3.5 mr-1" /> Reverse Order
                  </Button>
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
                      "p-3 rounded-xl border flex items-start gap-3 transition-all relative group",
                      video.selected !== false
                        ? "bg-card border-primary/40 shadow-sm"
                        : "bg-muted/30 border-border opacity-50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-5 bg-primary/10 text-primary border border-primary/20">
                        #{idx + 1}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={video.selected !== false}
                        onChange={() => toggleSelectVideo(idx)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>

                    <div className="w-20 aspect-video rounded-lg overflow-hidden bg-muted relative shrink-0 border border-border flex items-center justify-center">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt={video.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {mediaType === "audio" ? <Headphones className="w-6 h-6 opacity-40 text-primary" /> : <PlayCircle className="w-6 h-6 opacity-30" />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        value={video.title}
                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                        className="text-xs font-semibold h-8"
                        placeholder={mediaType === "audio" ? "Audio Title" : "Video Title"}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{video.videoUrl}</span>
                        </a>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === 0}
                            onClick={() => handleMoveVideo(idx, "up")}
                            className="h-6 w-6 text-muted-foreground hover:text-primary disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={idx === fetchedVideos.length - 1}
                            onClick={() => handleMoveVideo(idx, "down")}
                            className="h-6 w-6 text-muted-foreground hover:text-primary disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveVideo(idx)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
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
          <Button className="px-3 py-2 border border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white" variant="ghost" onClick={handleClose} disabled={isImporting || isUploadingAudio}>
            Cancel
          </Button>
          <Button
            onClick={handleExecuteImport}
            disabled={isImporting || isUploadingAudio || selectedCount === 0}
            className="px-6"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {mediaType === "audio" ? "Importing Audios..." : "Importing Videos..."}
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" /> Import {selectedCount} Selected {mediaType === "audio" ? "Audio(s)" : "Video(s)"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
