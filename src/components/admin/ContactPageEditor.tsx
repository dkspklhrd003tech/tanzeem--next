"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, XCircle, Edit2, Loader2, Save, ArrowLeft, RefreshCw, MapPin, Phone, Mail, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormsInbox } from "./FormsInbox";
import { FormsHistory } from "./FormsHistory";
import { FormsEmailConfigs } from "./FormsEmailConfigs";
import { FormsEmailLogs } from "./FormsEmailLogs";
import { FormsEmailTemplate } from "./FormsEmailTemplate";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type AddressDetail = {
  id: string;
  title: string;
  titleValue?: string;
  titleValueUrl?: string;
  titleValueUrlNewTab?: boolean;
  leaderTitle?: 'Ameer' | 'Naib Ameer';
  naibAmeer?: string;
  address: string;
  addressUrl?: string;
  addressUrlNewTab?: boolean;
  phone: string;
  phoneUrl?: string;
  phoneUrlNewTab?: boolean;
  mobile?: string;
  mobileUrl?: string;
  mobileUrlNewTab?: boolean;
  email: string;
  emailUrl?: string;
  emailUrlNewTab?: boolean;
  mapUrl: string;
  mapUrlNewTab?: boolean;
};

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  details: AddressDetail[] | null;
  isActive: boolean;
};

function SortableLocationCard({ loc, onEdit, onDelete }: { loc: LocationRow, onEdit: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: loc.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col p-4 border border-border rounded-xl bg-card hover:border-primary/30 transition-all",
        isDragging && "z-50 shadow-2xl scale-[1.02] border-primary ring-2 ring-primary/20 opacity-90"
      )}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded -ml-2 text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </button>
            <h4 className="font-bold text-foreground text-lg leading-none">{loc.name}</h4>
            {!loc.isActive && <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full font-bold">Hidden</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            {loc.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {loc.city}</span>}
            {(!loc.details || loc.details.length === 0) && loc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {loc.phone}</span>}
            {(!loc.details || loc.details.length === 0) && loc.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {loc.email}</span>}
          </div>
          {(!loc.details || loc.details.length === 0) && loc.address && <p className="text-xs text-muted-foreground mt-2">{loc.address}</p>}

          {loc.details && loc.details.length > 0 && (
            <div className="mt-4 space-y-2">
              {loc.details.map((detail) => (
                <div key={detail.id} className="bg-secondary/30 p-2 rounded text-xs border border-border/50">
                  <div className="font-semibold mb-1">{detail.title || "Office"}</div>
                  {detail.address && <div className="text-muted-foreground flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {detail.address}</div>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detail.phone && <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {detail.phone}</span>}
                    {detail.email && <span className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {detail.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0 ml-4 items-center">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/80">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ContactPageEditor({ pageId, title }: { pageId: string; title: string }) {
  const { toast } = useToast();

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const emailTemplateRef = useRef<{ save: () => Promise<void> }>(null);
  const emailConfigsRef = useRef<{ save: () => Promise<void> }>(null);

  // Locations
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inbox
  const [unreadCount, setUnreadCount] = useState(0);

  // Location Dialog
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<LocationRow> | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Confirmation state
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  // DnD Sensors config
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/sitemanager/locations").then((res) => res.json()),
      fetch("/api/contact?isRead=false&limit=1").then((res) => res.json()),
    ])
      .then(([settingsData, locationsData, inboxData]) => {
        let orderMap: Record<string, number> = {};
        if (settingsData?.settings?.contact) {
          setSettings(settingsData.settings.contact);
          try {
            const orderArr = JSON.parse(settingsData.settings.contact.locations_order || "[]");
            orderArr.forEach((id: string, idx: number) => {
              orderMap[id] = idx;
            });
          } catch (e) { }
        } else {
          // Fallbacks from ContactSection.tsx if not set
          setSettings({
            footer_address: "23 KM Multan Road, Near Chung, Lahore, Punjab, Pakistan",
            contact_phone: "+92 (42) 35473375-78",
            contact_email: "markaz@tanzeem.org",
            contact_email_office: "info@tanzeem.org",
            contact_heading: "Get in touch with",
            contact_subheading: "Muntazim Ala Halqa Majaz",
            contact_phone_url: "",
            contact_email_url: "",
            contact_address_url: "",
          });
        }
        if (locationsData?.locations) {
          const locs = locationsData.locations;
          locs.sort((a: any, b: any) => {
            const indexA = orderMap[a.id] !== undefined ? orderMap[a.id] : 9999;
            const indexB = orderMap[b.id] !== undefined ? orderMap[b.id] : 9999;
            return indexA - indexB;
          });
          setLocations(locs);
        }
        if (inboxData?.data?.total) {
          setUnreadCount(inboxData.data.total);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings, group: "contact" }),
        }).then(res => { if (!res.ok) throw new Error() }),
        emailTemplateRef.current?.save?.(),
        emailConfigsRef.current?.save?.()
      ]);
      toast({ title: "Success", description: "All form settings saved successfully!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save some settings" });
    }
    setIsSavingSettings(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newArray = arrayMove(items, oldIndex, newIndex);

        // Save the new order to settings
        const newOrder = newArray.map(loc => loc.id);
        const orderStr = JSON.stringify(newOrder);
        setSettings(prev => ({ ...prev, locations_order: orderStr }));

        // Background save
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: { ...settings, locations_order: orderStr }, group: "contact" }),
        }).catch(e => console.error("Failed to auto-save location order"));

        return newArray;
      });
    }
  };

  const openLocationDialog = (loc?: LocationRow) => {
    if (loc) {
      setEditingLocation(loc);
    } else {
      setEditingLocation({
        name: "",
        slug: "",
        city: "",
        address: "",
        phone: "",
        email: "",
        country: "Pakistan",
        details: [],
        isActive: true,
      });
    }
    setIsLocationDialogOpen(true);
  };

  const saveLocation = async () => {
    if (!editingLocation?.name) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }

    setIsSavingLocation(true);
    const isEditing = !!editingLocation.id;
    const url = isEditing ? `/api/sitemanager/locations/${editingLocation.id}` : "/api/sitemanager/locations";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLocation),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEditing) {
          setLocations(locations.map((l) => (l.id === saved.id ? saved : l)));
        } else {
          setLocations([...locations, saved]);
        }
        toast({ title: "Location Saved Successfully" });
        setIsLocationDialogOpen(false);
      } else {
        toast({ variant: "destructive", title: "Failed to save location" });
      }
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    }
    setIsSavingLocation(false);
  };

  const deleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/sitemanager/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocations(locations.filter((l) => l.id !== id));
        toast({ title: "Location deleted" });
      } else {
        toast({ variant: "destructive", title: "Failed to delete" });
      }
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    } finally {
      setDeletingLocationId(null);
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <Link href="/sitemanager/pages">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage global contact settings and branch locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Markaz Details
              </CardTitle>
              <CardDescription>Main contact details shown at the top of the contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-semibold mb-3">Main Header Section</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Top Small Heading</Label>
                    <Input value={settings.contact_heading || ""} onChange={(e) => handleSettingChange("contact_heading", e.target.value)} placeholder="e.g. Get in touch with" />
                  </div>
                  <div>
                    <Label>Main Large Heading</Label>
                    <Input value={settings.contact_subheading || ""} onChange={(e) => handleSettingChange("contact_subheading", e.target.value)} placeholder="e.g. Muntazim Ala Halqa Majaz" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-semibold mb-3">Contact Cards</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 ">
                    <div>
                      <Label>Primary Phone</Label>
                      <Input value={settings.contact_phone || ""} onChange={(e) => handleSettingChange("contact_phone", e.target.value)} />
                    </div>
                    <div>
                      <Label>Phone Link URL (Optional)</Label>
                      <Input value={settings.contact_phone_url || ""} onChange={(e) => handleSettingChange("contact_phone_url", e.target.value)} placeholder="e.g. tel:+923001234567" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label>General Email</Label>
                      <Input value={settings.contact_email || ""} onChange={(e) => handleSettingChange("contact_email", e.target.value)} />
                    </div>
                    <div>
                      <Label>Email Link URL (Optional)</Label>
                      <Input value={settings.contact_email_url || ""} onChange={(e) => handleSettingChange("contact_email_url", e.target.value)} placeholder="e.g. mailto:test@tanzeem.org" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label>Main Address</Label>
                      <Input value={settings.footer_address || ""} onChange={(e) => handleSettingChange("footer_address", e.target.value)} />
                    </div>
                    <div>
                      <Label>Address Link URL (Optional)</Label>
                      <Input value={settings.contact_address_url || ""} onChange={(e) => handleSettingChange("contact_address_url", e.target.value)} placeholder="e.g. https://maps.google.com/..." />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-semibold mb-3">Legacy Footer Details</h4>
                <div className="space-y-4">
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input value={settings.whatsapp_number || ""} onChange={(e) => handleSettingChange("whatsapp_number", e.target.value)} />
                  </div>
                  <div>
                    <Label>Office Email</Label>
                    <Input value={settings.contact_email_office || ""} onChange={(e) => handleSettingChange("contact_email_office", e.target.value)} />
                  </div>
                </div>
              </div>
              <ConfirmDialog
                title="Save Contact Details"
                description="Are you sure you want to save the updated contact information?"
                onConfirm={saveSettings}
              >
                <Button className="w-full mt-4" disabled={isSavingSettings}>
                  {isSavingSettings ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Details
                </Button>
              </ConfirmDialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Locations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Branch Locations
                </CardTitle>
                <CardDescription>Manage the interactive map tabs shown at the bottom.</CardDescription>
              </div>
              <Button onClick={() => openLocationDialog()} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Branch
              </Button>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">No branches found. Add one to get started.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={locations.map(l => l.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {locations.map((loc) => (
                        <SortableLocationCard
                          key={loc.id}
                          loc={loc}
                          onEdit={() => openLocationDialog(loc)}
                          onDelete={() => setDeletingLocationId(loc.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forms Management - Full Width */}
      <div className="mt-8 w-full">
        <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4 px-6 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-700">Forms Management</CardTitle>
            </div>
            <Button onClick={saveSettings} disabled={isSavingSettings} className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 font-semibold">
              {isSavingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Form
            </Button>
          </CardHeader>
          <CardContent className="p-6 bg-slate-50/30">
            <Tabs defaultValue="email-configs" variant="bubble" className="w-full">
              <TabsList>
                <TabsTrigger value="email-configs">Email Configs</TabsTrigger>
                <TabsTrigger value="email-template">Email Template</TabsTrigger>
                <TabsTrigger value="inbox" className="relative">
                  Inbox
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-sm animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">Sent History</TabsTrigger>
                <TabsTrigger value="email-logs">Email Logs</TabsTrigger>
              </TabsList>


              <TabsContent value="inbox">
                <FormsInbox />
              </TabsContent>

              <TabsContent value="history">
                <FormsHistory />
              </TabsContent>

              <TabsContent value="email-configs">
                <FormsEmailConfigs ref={emailConfigsRef} />
              </TabsContent>

              <TabsContent value="email-template">
                <FormsEmailTemplate ref={emailTemplateRef} />
              </TabsContent>

              <TabsContent value="email-logs">
                <FormsEmailLogs />
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingLocation?.id ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription className="sr-only">Fill in the branch details including name, city, addresses, and contact information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Branch Name / Tab Label <span className="text-destructive">*</span></Label>
                <Input value={editingLocation?.name || ""} onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })} placeholder="e.g. Lahore / لاہور" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>City</Label>
                <Input value={editingLocation?.city || ""} onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })} placeholder="e.g. Lahore" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Country</Label>
                <Input value={editingLocation?.country || ""} onChange={(e) => setEditingLocation({ ...editingLocation, country: e.target.value })} placeholder="e.g. Pakistan" />
              </div>

              <div className="col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-border">
                <Label className="text-base font-semibold">Address Details</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newDetails = [...(editingLocation?.details || []), {
                      id: crypto.randomUUID(),
                      title: "",
                      titleValue: "",
                      titleValueUrl: "",
                      naibAmeer: "",
                      address: "",
                      addressUrl: "",
                      phone: "",
                      phoneUrl: "",
                      mobile: "",
                      mobileUrl: "",
                      email: "",
                      emailUrl: "",
                      mapUrl: "",
                      leaderTitle: "Ameer" as "Ameer" | "Naib Ameer"
                    }];
                    setEditingLocation({ ...editingLocation, details: newDetails });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Address
                </Button>
              </div>

              <div className="col-span-2 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {(!editingLocation?.details || editingLocation.details.length === 0) && (
                  <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded bg-secondary/20">No addresses added. Click "Add Address" to add multiple offices or locations within this branch.</p>
                )}
                {editingLocation?.details?.map((detail, index) => (
                  <div key={detail.id} className="relative p-4 border border-border rounded-lg bg-secondary/10 space-y-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 text-destructive hover:bg-destructive/80"
                      onClick={() => {
                        const newDetails = editingLocation.details!.filter(d => d.id !== detail.id);
                        setEditingLocation({ ...editingLocation, details: newDetails });
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Title Label (e.g. Lahore Chung)</Label>
                        <Input className="h-8" value={detail.title} onChange={(e) => {
                          const newDetails = [...editingLocation.details!];
                          newDetails[index].title = e.target.value;
                          setEditingLocation({ ...editingLocation, details: newDetails });
                        }} />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Title Value</Label>
                          <Input className="h-8" value={detail.titleValue || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].titleValue = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Title Value URL</Label>
                          <Input className="h-8 mb-1" placeholder="https://" value={detail.titleValueUrl || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].titleValueUrl = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                          <div className="flex items-center gap-1.5 mt-2">
                            <Checkbox
                              id={`titleValueUrlNewTab-${detail.id}`}
                              checked={detail.titleValueUrlNewTab !== false}
                              onCheckedChange={(checked) => {
                                const newDetails = [...editingLocation.details!];
                                newDetails[index].titleValueUrlNewTab = checked === true;
                                setEditingLocation({ ...editingLocation, details: newDetails });
                              }}
                            />
                            <Label htmlFor={`titleValueUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            type="button"
                            variant={(!detail.leaderTitle || detail.leaderTitle === 'Ameer') ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 text-[10px] px-2 rounded-full"
                            onClick={() => {
                              const newDetails = [...editingLocation.details!];
                              newDetails[index].leaderTitle = 'Ameer';
                              setEditingLocation({ ...editingLocation, details: newDetails });
                            }}
                          >
                            Ameer
                          </Button>
                          <Button
                            type="button"
                            variant={detail.leaderTitle === 'Naib Ameer' ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 text-[10px] px-2 rounded-full"
                            onClick={() => {
                              const newDetails = [...editingLocation.details!];
                              newDetails[index].leaderTitle = 'Naib Ameer';
                              setEditingLocation({ ...editingLocation, details: newDetails });
                            }}
                          >
                            Naib Ameer
                          </Button>
                        </div>
                        <Input className="h-8" value={detail.naibAmeer || ""} onChange={(e) => {
                          const newDetails = [...editingLocation.details!];
                          newDetails[index].naibAmeer = e.target.value;
                          setEditingLocation({ ...editingLocation, details: newDetails });
                        }} placeholder="Enter name..." />
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Postal Address</Label>
                          <Input className="h-8" value={detail.address} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].address = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Postal Address URL</Label>
                          <Input className="h-8 mb-1" placeholder="https://" value={detail.addressUrl || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].addressUrl = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                          <div className="flex items-center gap-1.5 mt-2">
                            <Checkbox
                              id={`addressUrlNewTab-${detail.id}`}
                              checked={detail.addressUrlNewTab !== false}
                              onCheckedChange={(checked) => {
                                const newDetails = [...editingLocation.details!];
                                newDetails[index].addressUrlNewTab = checked === true;
                                setEditingLocation({ ...editingLocation, details: newDetails });
                              }}
                            />
                            <Label htmlFor={`addressUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Phone</Label>
                          <Input className="h-8" value={detail.phone} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].phone = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone URL</Label>
                          <Input className="h-8 mb-1" placeholder="tel:" value={detail.phoneUrl || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].phoneUrl = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                          <div className="flex items-center gap-1.5 mt-2">
                            <Checkbox
                              id={`phoneUrlNewTab-${detail.id}`}
                              checked={detail.phoneUrlNewTab !== false}
                              onCheckedChange={(checked) => {
                                const newDetails = [...editingLocation.details!];
                                newDetails[index].phoneUrlNewTab = checked === true;
                                setEditingLocation({ ...editingLocation, details: newDetails });
                              }}
                            />
                            <Label htmlFor={`phoneUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Mob (WhatsApp)</Label>
                          <Input className="h-8" value={detail.mobile || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].mobile = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Mob URL</Label>
                          <Input className="h-8 mb-1" placeholder="tel: or https://wa.me/" value={detail.mobileUrl || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].mobileUrl = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                          <div className="flex items-center gap-1.5 mt-2">
                            <Checkbox
                              id={`mobileUrlNewTab-${detail.id}`}
                              checked={detail.mobileUrlNewTab !== false}
                              onCheckedChange={(checked) => {
                                const newDetails = [...editingLocation.details!];
                                newDetails[index].mobileUrlNewTab = checked === true;
                                setEditingLocation({ ...editingLocation, details: newDetails });
                              }}
                            />
                            <Label htmlFor={`mobileUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Email</Label>
                          <Input className="h-8" value={detail.email} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].email = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Email URL</Label>
                          <Input className="h-8 mb-1" placeholder="mailto:" value={detail.emailUrl || ""} onChange={(e) => {
                            const newDetails = [...editingLocation.details!];
                            newDetails[index].emailUrl = e.target.value;
                            setEditingLocation({ ...editingLocation, details: newDetails });
                          }} />
                          <div className="flex items-center gap-1.5 mt-2">
                            <Checkbox
                              id={`emailUrlNewTab-${detail.id}`}
                              checked={detail.emailUrlNewTab !== false}
                              onCheckedChange={(checked) => {
                                const newDetails = [...editingLocation.details!];
                                newDetails[index].emailUrlNewTab = checked === true;
                                setEditingLocation({ ...editingLocation, details: newDetails });
                              }}
                            />
                            <Label htmlFor={`emailUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Pin Location (URL)</Label>
                        <Input className="h-8 mb-1" placeholder="https://maps..." value={detail.mapUrl} onChange={(e) => {
                          const newDetails = [...editingLocation.details!];
                          newDetails[index].mapUrl = e.target.value;
                          setEditingLocation({ ...editingLocation, details: newDetails });
                        }} />
                        <div className="flex items-center gap-1.5 mt-2">
                          <Checkbox
                            id={`mapUrlNewTab-${detail.id}`}
                            checked={detail.mapUrlNewTab !== false}
                            onCheckedChange={(checked) => {
                              const newDetails = [...editingLocation.details!];
                              newDetails[index].mapUrlNewTab = checked === true;
                              setEditingLocation({ ...editingLocation, details: newDetails });
                            }}
                          />
                          <Label htmlFor={`mapUrlNewTab-${detail.id}`} className="text-[10px] text-muted-foreground cursor-pointer">Open in new tab</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-2 flex items-center justify-between p-3 border border-border rounded-lg mt-2">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Show this branch on the frontend map tabs.</p>
                </div>
                <Switch checked={editingLocation?.isActive ?? true} onCheckedChange={(c) => setEditingLocation({ ...editingLocation, isActive: c })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>Cancel</Button>
            <ConfirmDialog
              title={editingLocation?.id ? "Update Branch" : "Add Branch"}
              description={`Are you sure you want to ${editingLocation?.id ? "update" : "add"} this branch location?`}
              onConfirm={saveLocation}
            >
              <Button disabled={isSavingLocation}>
                {isSavingLocation ? "Saving..." : "Save Branch"}
              </Button>
            </ConfirmDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Location Confirmation */}
      <ConfirmDialog
        open={!!deletingLocationId}
        onOpenChange={(open) => !open && setDeletingLocationId(null)}
        title="Delete Branch"
        description="Are you sure you want to permanently delete this branch location?"
        onConfirm={() => {
          if (deletingLocationId) {
            return deleteLocation(deletingLocationId);
          }
        }}
      />
    </div>
  );
}
