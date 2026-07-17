"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save, Loader2, Plus, XCircle, ArrowLeft, ArrowRight,
  ArrowUp, ArrowDown, Edit, LayoutTemplate, ExternalLink,
  Info, Globe, Mail, Phone, MapPin, RefreshCw, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  parentId: string | null;
  order: number;
  isOpenInNew: boolean;
  isVisible: boolean;
  menuType: string;
  children?: MenuItem[];
}

interface FooterSettings {
  footer_copyright: string;
  footer_address: string;
  footer_landline: string;
  whatsapp_number: string;
  contact_email: string;
  [key: string]: string;
}

const DEFAULTS: FooterSettings = {
  footer_copyright: "© 2024 Tanzeem-e-Islami. All rights reserved.",
  footer_address: "",
  footer_address_url: "",
  footer_address_new_tab: "true",
  footer_landline: "",
  footer_landline_url: "",
  footer_landline_new_tab: "true",
  whatsapp_number: "",
  whatsapp_number_url: "",
  whatsapp_number_new_tab: "true",
  contact_email: "",
  contact_email_url: "",
  contact_email_new_tab: "true",
};

export function FooterManager() {
  const { toast } = useToast();

  // Settings state
  const [settings, setSettings] = useState<FooterSettings>(DEFAULTS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Columns & Links state
  const [columns, setColumns] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // CRUD states
  const [editingLink, setEditingLink] = useState<Partial<MenuItem> | null>(null);
  const [savingLink, setSavingLink] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isSavingColumn, setIsSavingColumn] = useState(false);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings/footer");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Fetch Menu
  const fetchFooterMenu = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const res = await fetch("/api/menus?hierarchy=true&menuType=footer");
      if (res.ok) {
        const data = await res.json();
        // Sort roots by order
        const sorted = (data.menus ?? []).sort((a: MenuItem, b: MenuItem) => a.order - b.order);
        // Sort children inside each column by order
        sorted.forEach((col: MenuItem) => {
          if (col.children) {
            col.children.sort((a, b) => a.order - b.order);
          }
        });
        setColumns(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch footer menu", err);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchFooterMenu();
  }, [fetchSettings, fetchFooterMenu]);

  // Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Footer settings saved.",
        description: "General details have been updated successfully.",
      });
      fetchSettings();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save settings.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Reorder Columns
  const handleMoveColumn = async (columnIndex: number, direction: "left" | "right") => {
    const swapIndex = direction === "left" ? columnIndex - 1 : columnIndex + 1;
    if (swapIndex < 0 || swapIndex >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[columnIndex];
    newCols[columnIndex] = newCols[swapIndex];
    newCols[swapIndex] = temp;

    // Optimistic UI update
    setColumns(newCols);

    const promises = newCols.map((col, index) => {
      return fetch(`/api/menus/${col.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      });
    });

    try {
      await Promise.all(promises);
      toast({ title: "Column order updated." });
      fetchFooterMenu();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to reorder columns" });
      fetchFooterMenu();
    }
  };

  // Reorder Links inside Column
  const handleMoveLink = async (columnId: string, linkIndex: number, direction: "up" | "down") => {
    const column = columns.find((c) => c.id === columnId);
    if (!column || !column.children) return;
    const links = [...column.children];
    const swapIndex = direction === "up" ? linkIndex - 1 : linkIndex + 1;
    if (swapIndex < 0 || swapIndex >= links.length) return;

    const temp = links[linkIndex];
    links[linkIndex] = links[swapIndex];
    links[swapIndex] = temp;

    // Update order properties
    const promises = links.map((link, index) => {
      return fetch(`/api/menus/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      });
    });

    try {
      await Promise.all(promises);
      toast({ title: "Link order updated." });
      fetchFooterMenu();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to reorder links" });
      fetchFooterMenu();
    }
  };

  // Save Column Title
  const handleSaveColumnTitle = async (columnId: string) => {
    if (!columnTitleInput.trim()) return;
    try {
      const res = await fetch(`/api/menus/${columnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: columnTitleInput }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Column title updated." });
      setEditingColumnId(null);
      fetchFooterMenu();
    } catch {
      toast({ variant: "destructive", title: "Failed to update column title" });
    }
  };

  // Add Column
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    setIsSavingColumn(true);
    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newColumnTitle,
          url: null,
          parentId: null,
          menuType: "footer",
          order: columns.length,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Column Added Successfully." });
      setNewColumnTitle("");
      setAddingColumn(false);
      fetchFooterMenu();
    } catch {
      toast({ variant: "destructive", title: "Failed to add column" });
    } finally {
      setIsSavingColumn(false);
    }
  };

  // Delete Column & children
  const handleDeleteColumn = async (column: MenuItem) => {
    try {
      const childDeletePromises = (column.children || []).map((child) =>
        fetch(`/api/menus/${child.id}`, { method: "DELETE" })
      );
      await Promise.all(childDeletePromises);

      const res = await fetch(`/api/menus/${column.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Column and links deleted successfully." });
      fetchFooterMenu();
    } catch {
      toast({ variant: "destructive", title: "Failed to delete column" });
    }
  };

  // Save Link Item
  const handleSaveLink = async (data: Partial<MenuItem>) => {
    if (!data.label?.trim()) return;
    setSavingLink(true);
    try {
      const isNew = !data.id;
      const url = isNew ? "/api/menus" : `/api/menus/${data.id}`;
      const payload = {
        ...data,
        menuType: "footer",
        order: data.order ?? 0,
      };

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast({ title: `Link ${isNew ? "added" : "updated"} successfully.` });
      setEditingLink(null);
      fetchFooterMenu();
    } catch {
      toast({ variant: "destructive", title: "Failed to save link" });
    } finally {
      setSavingLink(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Link deleted successfully." });
      fetchFooterMenu();
    } catch {
      toast({ variant: "destructive", title: "Failed to delete link" });
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Footer</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Manage site contact information, copyright, and columns of footer navigation links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { fetchSettings(); fetchFooterMenu(); }}
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left side: Contact & Copyright Settings ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Info className="h-5 w-5 text-primary" />
                Footer Contact &amp; General
              </CardTitle>
              <CardDescription>
                These details populate the left-most or Contact Us column on the public footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSettings ? (
                <div className="space-y-3 py-4">
                  <div className="h-9 bg-muted animate-pulse rounded-lg" />
                  <div className="h-9 bg-muted animate-pulse rounded-lg" />
                  <div className="h-9 bg-muted animate-pulse rounded-lg" />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Copyright Text</Label>
                    <Input
                      value={settings.footer_copyright}
                      onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                      placeholder="e.g. © 2024 Tanzeem-e-Islami"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-b border-border/50 pb-4">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Address
                      </Label>
                      <Input
                        value={settings.footer_address}
                        onChange={(e) => setSettings({ ...settings, footer_address: e.target.value })}
                        placeholder="e.g. 252-GII Johar Town, Lahore"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Address URL</Label>
                      <Input
                        className="h-9 mb-1"
                        placeholder="https://maps.google.com/..."
                        value={settings.footer_address_url || ""}
                        onChange={(e) => setSettings({ ...settings, footer_address_url: e.target.value })}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="footer_address_new_tab"
                          checked={settings.footer_address_new_tab !== 'false'}
                          onCheckedChange={(checked) => setSettings({ ...settings, footer_address_new_tab: checked ? 'true' : 'false' })}
                        />
                        <Label htmlFor="footer_address_new_tab" className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-b border-border/50 pb-4">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Landline Phone
                      </Label>
                      <Input
                        value={settings.footer_landline}
                        onChange={(e) => setSettings({ ...settings, footer_landline: e.target.value })}
                        placeholder="e.g. +92-42-35473331"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone URL</Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground h-9 flex items-center shrink-0">tel:</span>
                        <Input
                          className="h-9 rounded-l-none"
                          placeholder="+924235473331"
                          value={settings.footer_landline_url || ""}
                          onChange={(e) => setSettings({ ...settings, footer_landline_url: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="footer_landline_new_tab"
                          checked={settings.footer_landline_new_tab !== 'false'}
                          onCheckedChange={(checked) => setSettings({ ...settings, footer_landline_new_tab: checked ? 'true' : 'false' })}
                        />
                        <Label htmlFor="footer_landline_new_tab" className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-b border-border/50 pb-4">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        WhatsApp Number
                      </Label>
                      <Input
                        value={settings.whatsapp_number}
                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        placeholder="e.g. +923001234567"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">WhatsApp URL</Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground h-9 flex items-center shrink-0">wa.me/</span>
                        <Input
                          className="h-9 rounded-l-none"
                          placeholder="923001234567"
                          value={settings.whatsapp_number_url || ""}
                          onChange={(e) => setSettings({ ...settings, whatsapp_number_url: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="whatsapp_number_new_tab"
                          checked={settings.whatsapp_number_new_tab !== 'false'}
                          onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_number_new_tab: checked ? 'true' : 'false' })}
                        />
                        <Label htmlFor="whatsapp_number_new_tab" className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pb-2">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Contact Email
                      </Label>
                      <Input
                        value={settings.contact_email}
                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        placeholder="e.g. info@tanzeem.org"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email URL</Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground h-9 flex items-center shrink-0">mailto:</span>
                        <Input
                          className="h-9 rounded-l-none"
                          placeholder="info@tanzeem.org"
                          value={settings.contact_email_url || ""}
                          onChange={(e) => setSettings({ ...settings, contact_email_url: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="contact_email_new_tab"
                          checked={settings.contact_email_new_tab !== 'false'}
                          onCheckedChange={(checked) => setSettings({ ...settings, contact_email_new_tab: checked ? 'true' : 'false' })}
                        />
                        <Label htmlFor="contact_email_new_tab" className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <ConfirmDialog
                      title="Save settings?"
                      description="This will update the contact details immediately on the footer."
                      onConfirm={handleSaveSettings}
                    >
                      <Button
                        disabled={savingSettings}
                        className="bg-primary text-white rounded-xl w-full"
                      >
                        {savingSettings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Contact Details
                          </>
                        )}
                      </Button>
                    </ConfirmDialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right side: Dynamic Columns Builder (2 Cols Wide) ── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <LayoutTemplate className="h-5 w-5 text-primary" />
                  Navigation Columns
                </CardTitle>
                <CardDescription>
                  Configure columns of links. Recommended: Up to 4 columns to maintain layout grid.
                </CardDescription>
              </div>

              {!addingColumn && columns.length < 5 && (
                <Button
                  size="sm"
                  onClick={() => {
                    setAddingColumn(true);
                    setNewColumnTitle("");
                  }}
                  className="bg-primary text-white rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Column
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Column Inline Card */}
              {addingColumn && (
                <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold">Add New Column</h3>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Column Title (e.g. Media Links)"
                        autoFocus
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim() || isSavingColumn}
                      className="bg-primary text-white"
                    >
                      {isSavingColumn ? "Creating…" : "Create"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddingColumn(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {loadingMenu ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : columns.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <LayoutTemplate className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground-muted">No footer columns set up.</p>
                  <Button
                    variant="link"
                    onClick={() => setAddingColumn(true)}
                    className="text-primary mt-1 text-xs"
                  >
                    Add a column to get started →
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {columns.map((column, colIndex) => {
                    const isEditingTitle = editingColumnId === column.id;
                    const hasLinks = (column.children?.length ?? 0) > 0;

                    return (
                      <Card key={column.id} className="border border-border/80 bg-card/40 flex flex-col justify-between">
                        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                          <div className="flex items-center justify-between gap-2">
                            {/* Column title editor */}
                            {isEditingTitle ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <Input
                                  value={columnTitleInput}
                                  onChange={(e) => setColumnTitleInput(e.target.value)}
                                  className="h-8 py-1 px-2 text-sm font-semibold"
                                  autoFocus
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSaveColumnTitle(column.id)}
                                  className="h-8 w-8 text-primary hover:bg-primary/10 shrink-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingColumnId(null)}
                                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 shrink-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground text-sm truncate flex items-center gap-1.5 group">
                                  {column.label}
                                  <button
                                    onClick={() => {
                                      setEditingColumnId(column.id);
                                      setColumnTitleInput(column.label);
                                    }}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground transition-all"
                                    title="Rename column"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </h3>
                              </div>
                            )}

                            {/* Column Reordering & Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={colIndex === 0}
                                onClick={() => handleMoveColumn(colIndex, "left")}
                                className="h-6 w-6 text-muted-foreground hover:bg-muted"
                                title="Move Column Left"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={colIndex === columns.length - 1}
                                onClick={() => handleMoveColumn(colIndex, "right")}
                                className="h-6 w-6 text-muted-foreground hover:bg-muted"
                                title="Move Column Right"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>

                              <ConfirmDialog
                                title="Delete Column?"
                                description={`Are you sure you want to delete "${column.label}"? This will permanently delete the column and all its ${column.children?.length ?? 0} links.`}
                                onConfirm={() => handleDeleteColumn(column)}
                              >
                                <button
                                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/80 transition-colors"
                                  title="Delete column"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </ConfirmDialog>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                          {/* Links List */}
                          <div className="space-y-1.5 min-h-[60px]">
                            {!hasLinks ? (
                              <p className="text-xs text-muted-foreground text-center py-4 italic">
                                No links in this column.
                              </p>
                            ) : (
                              (column.children ?? []).map((link, idx) => {
                                const isLinkUrlValid = validateUrl(link.url ?? "");
                                return (
                                  <div
                                    key={link.id}
                                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-muted/30 transition-all text-xs group"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-foreground truncate">{link.label}</p>
                                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                                        {link.url || "—"}
                                      </p>
                                    </div>

                                    {/* Link Actions */}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={idx === 0}
                                        onClick={() => handleMoveLink(column.id, idx, "up")}
                                        className="h-5 w-5 text-muted-foreground"
                                      >
                                        <ArrowUp className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={idx === (column.children?.length ?? 0) - 1}
                                        onClick={() => handleMoveLink(column.id, idx, "down")}
                                        className="h-5 w-5 text-muted-foreground"
                                      >
                                        <ArrowDown className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingLink(link)}
                                        className="h-5 w-5 text-foreground hover:text-white"
                                      >
                                        <Edit className="h-2.5 w-2.5" />
                                      </Button>

                                      <ConfirmDialog
                                        title="Delete Link?"
                                        description={`Are you sure you want to remove the link "${link.label}"?`}
                                        onConfirm={() => handleDeleteLink(link.id)}
                                      >
                                        <button className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/80">
                                          <XCircle className="h-3 w-3" />
                                        </button>
                                      </ConfirmDialog>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Link Editor Inline Drawer / Form */}
                          {editingLink && (editingLink.parentId === column.id || (!editingLink.id && editingLink.parentId === column.id)) && (
                            <LinkEditorForm
                              link={editingLink}
                              onSave={handleSaveLink}
                              onCancel={() => setEditingLink(null)}
                              isSaving={savingLink}
                              columns={columns}
                            />
                          )}

                          {/* Add Link Button */}
                          {!editingLink && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingLink({
                                  parentId: column.id,
                                  isVisible: true,
                                  isOpenInNew: false,
                                  menuType: "footer",
                                  order: column.children?.length ?? 0,
                                })
                              }
                              className="w-full border border-dashed border-primary hover:text-white hover:border-white/50 text-[11px] h-8 rounded-lg"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Link
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Link Editor Form subcomponent ───────────────────────────────────────────────
function LinkEditorForm({
  link,
  columns,
  onSave,
  onCancel,
  isSaving,
}: {
  link: Partial<MenuItem>;
  columns: MenuItem[];
  onSave: (data: Partial<MenuItem>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<MenuItem>>(link);
  const [pages, setPages] = useState<{ id: string, title: string, slug: string }[]>([]);

  useEffect(() => {
    fetch("/api/pages").then(r => r.json()).then(d => {
      if (d.pages) setPages(d.pages);
    }).catch(() => { });
  }, []);

  const set = (k: keyof MenuItem, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const validateUrl = (url: string) => {
    if (!url) return true;
    return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
  };

  const urlValid = validateUrl(form.url ?? "");

  return (
    <div className="bg-muted/50 border border-border p-3 rounded-xl space-y-3 text-xs">
      <h4 className="font-bold text-foreground">
        {form.id ? "Edit Link" : "Add Link"}
      </h4>

      <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/20 space-y-1.5">
        <Label className="text-[10px] font-semibold text-primary flex items-center gap-1.5">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Quick Link to Existing Page
        </Label>
        <select
          className="w-full h-8 px-2 rounded-md border border-primary/30 text-[11px] bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          onChange={(e) => {
            const p = pages.find(x => x.id === e.target.value);
            if (p) {
              setForm(prev => ({
                ...prev,
                label: p.title,
                url: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
                isOpenInNew: false
              }));
            }
            e.target.value = "";
          }}
        >
          <option value="">— Select a Page to auto-fill —</option>
          {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <p className="text-[9px] text-muted-foreground mt-1 leading-tight">Auto-fills the Label &amp; URL. Automatically updates if the page URL changes later.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px]">Label *</Label>
          <Input
            value={form.label ?? ""}
            onChange={(e) => set("label", e.target.value)}
            className="h-8 text-xs"
            placeholder="e.g. Audios"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px]">URL</Label>
          <Input
            value={form.url ?? ""}
            onChange={(e) => {
              const newUrl = e.target.value;
              const isExt = newUrl.startsWith("http://") || newUrl.startsWith("https://");
              setForm(p => ({
                ...p,
                url: newUrl,
                isOpenInNew: isExt
              }));
            }}
            className={cn("h-8 text-xs", !urlValid && "border-destructive")}
            placeholder="/audios or https://..."
          />
          {!urlValid && (
            <p className="text-[9px] text-destructive">Must start with / or http(s)://</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px]">Target Column</Label>
          <select
            value={form.parentId ?? ""}
            onChange={(e) => set("parentId", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-3">
          <Label className="text-[10px] cursor-pointer" htmlFor="link-newtab">Open in new tab</Label>
          <Switch
            id="link-newtab"
            checked={!!form.isOpenInNew}
            onCheckedChange={(v) => set("isOpenInNew", v)}
          />
        </div>
      </div>

      <div className="flex gap-1.5 pt-1.5 justify-end">
        <Button
          size="sm"
          onClick={() => onSave(form)}
          disabled={!form.label?.trim() || !urlValid || isSaving}
          className="h-7 text-[10px] bg-primary text-white"
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
