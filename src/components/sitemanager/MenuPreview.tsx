"use client";

import { useState } from "react";
import { Monitor, Smartphone, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "./menu-types";

interface Props { items: MenuItem[] }

function DesktopItem({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <div className="relative group">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
          "hover:text-primary rounded-md hover:bg-primary/5",
          depth > 0 && "w-full text-left px-4 py-2 text-sm"
        )}
      >
        {item.label}
        {hasChildren && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
        {item.isOpenInNew && !hasChildren && <ExternalLink className="h-3 w-3 opacity-40" />}
      </button>

      {hasChildren && open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={cn(
            "absolute z-50 bg-white border border-border shadow-lg rounded-xl min-w-[200px] py-1.5",
            depth === 0 ? "top-full left-0 mt-1" : "top-0 left-full ml-1"
          )}
        >
          {item.children!.map(child => (
            <DesktopItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileItem({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-sm border-b border-border",
          "hover:bg-muted/50 transition-colors",
          depth > 0 && "pl-8 bg-muted/20 text-muted-foreground"
        )}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        )}
        {item.isOpenInNew && !hasChildren && <ExternalLink className="h-3.5 w-3.5 opacity-50" />}
      </button>
      {hasChildren && open && (
        <div>
          {item.children!.map(child => (
            <MobileItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuPreview({ items }: Props) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const topLevel = items.filter(i => !i.parentId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <Button variant={mode === "desktop" ? "default" : "outline"} size="sm" onClick={() => setMode("desktop")}>
          <Monitor className="h-3.5 w-3.5 mr-1.5" />Desktop
        </Button>
        <Button variant={mode === "mobile" ? "default" : "outline"} size="sm" onClick={() => setMode("mobile")}>
          <Smartphone className="h-3.5 w-3.5 mr-1.5" />Mobile
        </Button>
      </div>

      {/* Preview frame */}
      {mode === "desktop" ? (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          {/* Mock browser chrome */}
          <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              {["bg-red-400","bg-yellow-400","bg-green-400"].map(c => (
                <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
              ))}
            </div>
            <div className="flex-1 bg-white border border-border rounded-md px-3 py-1 text-xs text-muted-foreground mx-4">
              tanzeem.org
            </div>
          </div>
          {/* Nav bar */}
          <div className="bg-primary px-6 py-3">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-white/20 rounded-lg mr-4 shrink-0" />
              <div className="flex items-center gap-1 flex-wrap">
                {topLevel.map(item => (
                  <DesktopItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          {/* Page body placeholder */}
          <div className="h-32 bg-gradient-to-b from-muted/20 to-transparent p-6">
            <div className="h-3 bg-muted/40 rounded w-48 mb-2" />
            <div className="h-2 bg-muted/30 rounded w-64" />
          </div>
        </div>
      ) : (
        <div className="max-w-[375px] mx-auto rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          {/* Mobile header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="w-6 h-6 bg-white/20 rounded" />
            <div className="flex flex-col gap-1">
              {[14,10,14].map((w,i) => (
                <div key={i} className="h-0.5 bg-white/70 rounded" style={{ width: w }} />
              ))}
            </div>
          </div>
          {/* Mobile menu items */}
          <div className="divide-y divide-border">
            {topLevel.map(item => (
              <MobileItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Hover items to see dropdowns (desktop) · Tap to expand (mobile)
      </p>
    </div>
  );
}
