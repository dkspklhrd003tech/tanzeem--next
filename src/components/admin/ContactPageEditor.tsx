"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, ArrowLeft, RefreshCw, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  isActive: boolean;
};

export default function ContactPageEditor({ pageId, title }: { pageId: string; title: string }) {
  const { toast } = useToast();
  
  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Locations
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Location Dialog
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<LocationRow> | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/sitemanager/locations").then((res) => res.json()),
    ])
      .then(([settingsData, locationsData]) => {
        if (settingsData?.settings?.contact) {
          setSettings(settingsData.settings.contact);
        } else {
          // Fallbacks from ContactSection.tsx if not set
          setSettings({
            footer_address: "23 KM Multan Road, Near Chung, Lahore, Punjab, Pakistan",
            contact_phone: "+92 (42) 35473375-78",
            contact_email: "markaz@tanzeem.org",
            contact_email_office: "info@tanzeem.org",
          });
        }
        if (locationsData?.locations) {
          setLocations(locationsData.locations);
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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, group: "contact" }),
      });
      if (res.ok) {
        toast({ title: "Contact Settings saved!" });
      } else {
        toast({ variant: "destructive", title: "Failed to save settings." });
      }
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    }
    setIsSavingSettings(false);
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
        toast({ title: "Location saved successfully" });
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
    if (!confirm("Are you sure you want to delete this branch?")) return;
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
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sitemanager/pages"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title} Editor</h1>
            <p className="text-sm text-muted-foreground">Manage global contact settings and branch locations.</p>
          </div>
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
              <div>
                <Label>Main Address</Label>
                <Input value={settings.footer_address || ""} onChange={(e) => handleSettingChange("footer_address", e.target.value)} />
              </div>
              <div>
                <Label>Primary Phone</Label>
                <Input value={settings.contact_phone || ""} onChange={(e) => handleSettingChange("contact_phone", e.target.value)} />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input value={settings.whatsapp_number || ""} onChange={(e) => handleSettingChange("whatsapp_number", e.target.value)} />
              </div>
              <div>
                <Label>General Email</Label>
                <Input value={settings.contact_email || ""} onChange={(e) => handleSettingChange("contact_email", e.target.value)} />
              </div>
              <div>
                <Label>Office Email</Label>
                <Input value={settings.contact_email_office || ""} onChange={(e) => handleSettingChange("contact_email_office", e.target.value)} />
              </div>
              <Button className="w-full mt-4" onClick={saveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Details
              </Button>
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
                <div className="space-y-3">
                  {locations.map((loc) => (
                    <div key={loc.id} className="flex items-start justify-between p-4 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-foreground">{loc.name}</h4>
                          {!loc.isActive && <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full font-bold">Hidden</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {loc.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {loc.city}</span>}
                          {loc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {loc.phone}</span>}
                          {loc.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {loc.email}</span>}
                        </div>
                        {loc.address && <p className="text-xs text-muted-foreground mt-2">{loc.address}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => openLocationDialog(loc)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLocation(loc.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingLocation?.id ? "Edit Branch" : "Add Branch"}</DialogTitle>
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
              <div className="col-span-2">
                <Label>Full Address</Label>
                <Input value={editingLocation?.address || ""} onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Phone / Mobile</Label>
                <Input value={editingLocation?.phone || ""} onChange={(e) => setEditingLocation({ ...editingLocation, phone: e.target.value })} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Email</Label>
                <Input value={editingLocation?.email || ""} onChange={(e) => setEditingLocation({ ...editingLocation, email: e.target.value })} />
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
            <Button onClick={saveLocation} disabled={isSavingLocation}>
              {isSavingLocation ? "Saving..." : "Save Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
