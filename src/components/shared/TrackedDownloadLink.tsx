"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaTracking } from "@/hooks/useMediaTracking";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  entityType: string;
  entityId: string | number;
  fileSize?: number | null;
  downloadCount?: number;
}

export function TrackedDownloadLink({
  entityType,
  entityId,
  fileSize,
  downloadCount,
  className,
  children,
  href,
  ...props
}: Props) {
  const { trackDownload } = useMediaTracking(entityType, String(entityId));

  const handleDownload = async () => {
    await trackDownload();
  };

  return (
    <div className="inline-flex items-center gap-2">
      <a
        href={href}
        download
        onClick={handleDownload}
        className={cn(
          "inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/80 border-primary border h-12 font-medium shadow-sm rounded-md px-6 py-2 text-sm transition-colors",
          className
        )}
        {...props}
      >
        {children || (
          <>
            <Download className="h-4 w-4" />
            Download {fileSize ? `(${(fileSize / 1024 / 1024).toFixed(2)} MB)` : ""}
          </>
        )}
      </a>

    </div>
  );
}
