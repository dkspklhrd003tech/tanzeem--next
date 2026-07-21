"use client";

import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientShareButton } from "@/components/shared/ClientShareButton";

interface PdfViewerHeaderProps {
    title: string;
    dateText?: string;
    pdfUrl: string;
    downloadFilename?: string;
    downloadButtonText?: string;
}

export function PdfViewerHeader({
    title,
    dateText,
    pdfUrl,
    downloadFilename = "document",
    downloadButtonText = "Download PDF"
}: PdfViewerHeaderProps) {
    return (
        <div className="w-full mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2 max-w-[70%]">
                    {dateText && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold tracking-widest uppercase bg-[#E8F0EC] text-[#0A5C36] w-fit">
                            <Calendar className="w-3.5 h-3.5" />
                            {dateText}
                        </span>
                    )}
                    <div className="flex items-start gap-3">
                        <h1 className="text-lg md:text-xl font-semibold text-foreground line-clamp-2">
                            {title}
                        </h1>
                        <ClientShareButton variant="icon" className="-mt-1" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="h-8 bg-primary text-white hover:bg-primary/90">
                        <a href={pdfUrl} download={`${downloadFilename}.pdf`} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            {downloadButtonText}
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
