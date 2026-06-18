"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MenuItem } from "./menu-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<MenuItem>) => void;
  initial?: Partial<MenuItem> | null;
  allItems: MenuItem[];   // flat list for parent selector
}

const EMPTY: Partial<MenuItem> = {
  label: "", url: "", parentId: null, isOpenInNew: false, isVisible: true,
};

export function MenuItemModal({ open, onClose, onSave, initial, allItems }: Props) {
  const [form, setForm] = useState<Partial<MenuItem>>(EMPTY);
  const isExternal = !!form.url && (form.url.startsWith("http://") || form.url.startsWith("https://"));

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [initial, open]);

  const set = (k: keyof MenuItem, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.label?.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Label */}
          <div>
            <Label htmlFor="mi-label" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input id="mi-label" placeholder="e.g. About Us" value={form.label ?? ""} onChange={e => set("label", e.target.value)} autoFocus />
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="mi-url" className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              URL
            </Label>
            <div className="relative">
              {isExternal
                ? <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500 pointer-events-none" />
                : <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              }
              <Input id="mi-url" placeholder="/ or https://…" className="pl-9"
                value={form.url ?? ""} onChange={e => set("url", e.target.value)} />
            </div>
            {isExternal && (
              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> External link detected
              </p>
            )}
          </div>

          {/* Open in new tab */}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Open in new tab</p>
              <p className="text-xs text-muted-foreground">Adds target="_blank" rel="noopener"</p>
            </div>
            <Switch checked={!!form.isOpenInNew} onCheckedChange={v => set("isOpenInNew", v)} />
          </div>

          {/* Visible */}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Visible</p>
              <p className="text-xs text-muted-foreground">Show this item in the navigation</p>
            </div>
            <Switch checked={form.isVisible !== false} onCheckedChange={v => set("isVisible", v)} />
          </div>

          {/* Parent */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Parent Item</Label>
            <Select
              value={form.parentId ?? "none"}
              onValueChange={v => set("parentId", v === "none" ? null : v)}
            >
              <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top level)</SelectItem>
                {allItems
                  .filter(i => i.id !== form.id && !i.parentId) // only top-level as parents
                  .map(i => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.label?.trim()}>
            {initial?.id ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
