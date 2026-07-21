"use client";

import React, { useState, useRef } from "react";
import { Upload, Loader2, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

interface AudioUploaderProps {
  value?: string;
  onChange: (url: string, size?: number) => void;
  label?: string;
  className?: string;
}

export function AudioUploader({
  value,
  onChange,
  label,
  className,
}: AudioUploaderProps): React.ReactNode {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFile } = useChunkedUpload();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid audio file (MP3, WAV, OGG, etc.).",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadFile(file, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      onChange(result.url, file.size);
      toast({
        title: "Audio Uploaded",
        description: "Your audio file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Audio upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload audio. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelect(e.target.files[0]);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const getFilename = (url: string) => {
    const parts = url.split("/");
    const raw = parts[parts.length - 1];
    // Strip UUID prefix (uploadId-originalname.mp3 → originalname.mp3)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
    return raw.replace(uuidPattern, "");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl overflow-hidden group transition-all duration-200",
          // No file yet
          !value && !isUploading && "cursor-pointer hover:border-primary/60 bg-muted/30",
          !value && !isUploading && dragActive && "border-primary bg-primary/5 scale-[1.005]",
          !value && !isUploading && !dragActive && "border-border",
          // Has file
          value && "bg-primary-light/50 border-primary",
          // Uploading state
          isUploading && "pointer-events-none opacity-80"
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={!value ? handleDrop : undefined}
        onClick={() => !value && !isUploading && fileInputRef.current?.click()}
      >
        {/* ── Has file state ── */}
        {value && !isUploading && (
          <div className="p-5 flex flex-col gap-3">
            {/* File info row */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Music className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground break-all leading-snug">
                  {getFilename(value)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                  {value}
                </p>
              </div>
              {/* Open in new tab */}
              <a
                href={resolveMediaUrl(value)}
                target="_blank"
                rel="noreferrer"
                title="Open audio file"
                className="shrink-0 text-foreground hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Native audio preview */}
            <audio
              controls
              src={resolveMediaUrl(value)}
              className="w-full h-10"
              preload="metadata"
            />

            {/* Action buttons row */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 font-semibold border-1 border-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Change File
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex-1 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* ── Uploading state ── */}
        {isUploading && (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-9 w-9 text-primary animate-spin" />
            <p className="text-sm font-bold text-foreground">Uploading Audio…</p>
            <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{uploadProgress}% Completed</p>
          </div>
        )}

        {/* ── Empty / drop zone state ── */}
        {!value && !isUploading && (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
                dragActive ? "bg-primary/20 scale-110" : "bg-primary/10"
              )}
            >
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                {dragActive ? "Drop audio file here" : "Click or drag & drop to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP3, WAV, OGG, AAC — large files supported
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
