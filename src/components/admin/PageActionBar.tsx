"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Save, Send, Eye, XCircle, Copy,
  Check, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface PageActionBarProps {
  mode?: "create" | "edit";
  title?: string;
  authorName?: string | null;
  updatedAt?: string | Date;
  lastSaved?: Date | null;
  previewUrl?: string | null;
  seoUrl?: string | null;
  isPublished?: boolean;
  saving?: boolean;
  onDuplicate?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export function PageActionBar({
  mode = "edit",
  title = "Edit Page",
  authorName,
  updatedAt,
  lastSaved,
  previewUrl,
  seoUrl,
  isPublished,
  saving,
  onDuplicate,
  onSaveDraft,
  onPublish,
  onDelete,
  children,
}: PageActionBarProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sitemanager/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {mode === "edit" && authorName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last edited by {authorName}
              {updatedAt && ` · ${new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {lastSaved && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {mode === "edit" && previewUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="h-3.5 w-3.5 mr-1.5" />View Page
            </a>
          </Button>
        )}
        {mode === "edit" && onDuplicate && (
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />Duplicate
          </Button>
        )}
        {mode === "edit" && seoUrl && (
          <Button variant="outline" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
            <Link href={seoUrl}>
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />Page SEO
            </Link>
          </Button>
        )}
        {onSaveDraft && (
          <Button variant="outline" size="sm" disabled={saving} onClick={onSaveDraft}>
            <Save className="h-3.5 w-3.5 mr-1.5" />{saving ? "Saving…" : "Save Draft"}
          </Button>
        )}
        {onPublish && (
          <Button size="sm" disabled={saving} onClick={onPublish} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-3.5 w-3.5 mr-1.5" />{isPublished ? "Update" : "Publish"}
          </Button>
        )}
        {mode === "edit" && onDelete && (
          <ConfirmDialog title="Delete page?" description={`"${title}" will be permanently deleted.`} onConfirm={onDelete} open={showDelete} onOpenChange={setShowDelete}>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/80" onClick={() => setShowDelete(true)}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </ConfirmDialog>
        )}
        {children}
      </div>
    </div>
  );
}
