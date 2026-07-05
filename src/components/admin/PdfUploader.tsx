"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface PdfUploaderProps {
    /** Current PDF URL (controlled) */
    value?: string;
    /** Called with the uploaded URL, or "" when removed */
    onChange: (url: string) => void;
    className?: string;
}

export function PdfUploader({ value = "", onChange, className }: PdfUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast({ title: "Invalid file", description: "Please select a PDF file.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "uploads");

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            onChange(data.url);
            toast({ title: "PDF uploaded", description: "File attached successfully." });
        } catch (err) {
            console.error("PDF upload error:", err);
            toast({ title: "Upload failed", description: "Could not upload PDF. Please try again.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be re-selected after removal
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {value ? (
                /* ── Attached state ─────────────────────────────────────── */
                <div className="flex items-center justify-between p-3 border border-emerald-500/30 bg-emerald-50/50 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">Attached PDF</p>
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline truncate block"
                            >
                                {value.split("/").pop()}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Replace button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg h-7 px-2"
                        >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Replace"}
                        </Button>
                        {/* Remove button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onChange("")}
                            disabled={isUploading}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-7 w-7"
                            aria-label="Remove PDF"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />
                </div>
            ) : (
                /* ── Empty / upload state ───────────────────────────────── */
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload PDF"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isUploading && "pointer-events-none opacity-60"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                            <p className="text-xs font-medium">Uploading PDF…</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-7 w-7 text-primary mb-2" />
                            <p className="text-xs font-medium text-center">Click to upload PDF</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">PDF format only</p>
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}
