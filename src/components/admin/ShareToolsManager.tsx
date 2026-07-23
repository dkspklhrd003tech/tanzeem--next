"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Share2, Facebook, Twitter, Linkedin, Mail, Send, Pin, RefreshCw, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { mutate } from "swr";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ALL_PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "#3b5998" },
  { id: "twitter", label: "X (Twitter)", icon: Twitter, color: "#000000" },
  { id: "whatsapp", label: "WhatsApp", icon: Share2, color: "#25D366" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#007bb5" },
  { id: "pinterest", label: "Pinterest", icon: Pin, color: "#cb2027" },
  { id: "telegram", label: "Telegram", icon: Send, color: "#0088cc" },
  { id: "email", label: "Email", icon: Mail, color: "#6b7280" },
];

function SortablePlatformItem({ platform, isActive, togglePlatform }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: platform.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = platform.icon;

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${isActive ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted/50"}`}>
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground">
        <GripVertical className="w-4 h-4" />
      </div>
      <Checkbox checked={isActive} onCheckedChange={() => togglePlatform(platform.id)} />
      <div className={`p-1.5 rounded-md ${isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-medium text-sm flex-1">{platform.label}</span>
    </div>
  );
}

function Section({ title, defaultOpen = false, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="mb-4 bg-card border-border shadow-sm">
      <CardHeader className="cursor-pointer select-none py-4 px-6 flex flex-row items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="text-lg">{title}</CardTitle>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </CardHeader>
      {isOpen && <CardContent className="px-6 pb-6 pt-0 space-y-6">{children}</CardContent>}
    </Card>
  );
}

export function ShareToolsManager() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orderedPlatforms, setOrderedPlatforms] = useState(ALL_PLATFORMS.map(p => p.id));
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/settings?group=share_tools");
      if (res.ok) {
        const data = await res.json();
        const st = data.settings.share_tools || {};

        let savedPlatforms = st.share_platforms ? JSON.parse(st.share_platforms) : ["facebook", "whatsapp", "twitter", "email", "linkedin"];
        // Ensure all platforms exist in the order list, putting selected ones first
        const unselected = ALL_PLATFORMS.map(p => p.id).filter(id => !savedPlatforms.includes(id));
        setOrderedPlatforms([...savedPlatforms, ...unselected]);

        setSettings({
          share_enabled: st.share_enabled || "false",
          share_position: st.share_position || "left",
          icon_style: st.icon_style || "rounded-square",
          icon_size: st.icon_size ? parseInt(st.icon_size) : 40,
          color_scheme: st.color_scheme || "brand",
          custom_bg_color: st.custom_bg_color || "#333333",
          custom_fill_color: st.custom_fill_color || "#ffffff",
          sidebar_gap: st.sidebar_gap ? parseInt(st.sidebar_gap) : 20,
          sidebar_vertical: st.sidebar_vertical || "center",
          show_labels: st.show_labels === "true",
          open_behavior: st.open_behavior || "new_tab",
          hide_on_scroll: st.hide_on_scroll === "true",
          delay_ms: st.delay_ms ? parseInt(st.delay_ms) : 0,
          exclude_pages: st.exclude_pages || "",
          url_to_share: st.url_to_share || "current",
          custom_url: st.custom_url || "",
          utm_enabled: st.utm_enabled === "true",
          utm_source: st.utm_source || "",
          utm_medium: st.utm_medium || "social_share",
          utm_campaign: st.utm_campaign || "",
          track_clicks: st.track_clicks === "true",
          ga_event_name: st.ga_event_name || "share_click",
          share_platforms: savedPlatforms,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Re-sort the saved platforms based on the ordered list
      const activePlatforms = orderedPlatforms.filter(id => settings.share_platforms.includes(id));

      const payload = {
        ...settings,
        share_enabled: settings.share_enabled,
        show_labels: settings.show_labels ? "true" : "false",
        hide_on_scroll: settings.hide_on_scroll ? "true" : "false",
        utm_enabled: settings.utm_enabled ? "true" : "false",
        track_clicks: settings.track_clicks ? "true" : "false",
        share_platforms: JSON.stringify(activePlatforms),
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload, group: "share_tools" }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Configuration saved! Changes will reflect across the site." });
        mutate("/api/settings");
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save configuration." });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSettings((prev: any) => {
      const current = prev.share_platforms || [];
      const updated = current.includes(platformId)
        ? current.filter((id: string) => id !== platformId)
        : [...current, platformId];
      return { ...prev, share_platforms: updated };
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedPlatforms((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  const updateSetting = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }));

  const activePlatformsList = orderedPlatforms.filter(id => settings.share_platforms.includes(id));

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1400px]">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="border border-primary/20 bg-primary text-white rounded-lg">
              <Share2 className="w-6 h-6 text-primary" /> Share Tools Configuration
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Configure the global floating share sidebar for your website.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-white hover:bg-primary/95 hover:text-white">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : "Save Configuration"}
          </Button>
        </div>

        <Section title="Display Settings" defaultOpen={true}>
          <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Enable Share Sidebar</Label>
              <p className="text-sm text-muted-foreground">Turn the floating share tools on or off globally.</p>
            </div>
            <Switch
              checked={settings.share_enabled === "true"}
              onCheckedChange={(c) => updateSetting("share_enabled", c ? "true" : "false")}
            />
          </div>
        </Section>

        <Section title="Appearance & Style" defaultOpen={true}>
          <div className="grid gap-6">
            <div className="space-y-3">
              <Label>Icon Style</Label>
              <RadioGroup value={settings.icon_style} onValueChange={(v) => updateSetting("icon_style", v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="rounded-square" id="r-sq" /><Label htmlFor="r-sq">Rounded Square</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="circle" id="r-ci" /><Label htmlFor="r-ci">Circle</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="flat" id="r-fl" /><Label htmlFor="r-fl">Flat</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="minimal" id="r-mi" /><Label htmlFor="r-mi">Minimal</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between"><Label>Icon Size</Label><span className="text-sm text-muted-foreground">{settings.icon_size}px</span></div>
              <Slider value={[settings.icon_size]} min={28} max={56} step={1} onValueChange={(v) => updateSetting("icon_size", v[0])} />
            </div>

            <div className="space-y-3">
              <Label>Color Scheme</Label>
              <RadioGroup value={settings.color_scheme} onValueChange={(v) => updateSetting("color_scheme", v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="brand" id="c-br" /><Label htmlFor="c-br">Brand Colors</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="monochrome" id="c-mo" /><Label htmlFor="c-mo">Monochrome</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id="c-cu" /><Label htmlFor="c-cu">Custom</Label></div>
              </RadioGroup>

              {settings.color_scheme === "custom" && (
                <div className="flex gap-4 mt-3 p-4 border rounded-lg bg-muted/10">
                  <div className="space-y-1.5"><Label>Background Color</Label><Input type="color" value={settings.custom_bg_color} onChange={(e) => updateSetting("custom_bg_color", e.target.value)} className="h-10 w-24 p-1" /></div>
                  <div className="space-y-1.5"><Label>Icon Fill Color</Label><Input type="color" value={settings.custom_fill_color} onChange={(e) => updateSetting("custom_fill_color", e.target.value)} className="h-10 w-24 p-1" /></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Gap from Edge (px)</Label>
                <Input type="number" value={settings.sidebar_gap} onChange={(e) => updateSetting("sidebar_gap", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-3">
                <Label>Vertical Position</Label>
                <Select value={settings.sidebar_vertical} onValueChange={(v) => updateSetting("sidebar_vertical", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Sidebar Edge</Label>
                <Select value={settings.share_position} onValueChange={(v) => updateSetting("share_position", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Behavior Settings">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><Label className="text-base">Show Labels</Label><p className="text-sm text-muted-foreground">Display platform name text.</p></div>
              <Switch checked={settings.show_labels} onCheckedChange={(c) => updateSetting("show_labels", c)} />
            </div>

            <div className="flex items-center justify-between">
              <div><Label className="text-base">Hide on Scroll Down</Label><p className="text-sm text-muted-foreground">Auto-hide when scrolling down.</p></div>
              <Switch checked={settings.hide_on_scroll} onCheckedChange={(c) => updateSetting("hide_on_scroll", c)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Open Behavior</Label>
                <Select value={settings.open_behavior} onValueChange={(v) => updateSetting("open_behavior", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_tab">New Tab / Popup</SelectItem>
                    <SelectItem value="same_tab">Same Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Delay Before Showing (ms)</Label>
                <Input type="number" min={0} max={3000} value={settings.delay_ms} onChange={(e) => updateSetting("delay_ms", parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Exclude Pages</Label>
              <Textarea
                placeholder="/cart, /checkout, /private"
                value={settings.exclude_pages}
                onChange={(e) => updateSetting("exclude_pages", e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Enter paths separated by commas where the sidebar should not appear.</p>
            </div>
          </div>
        </Section>

        <Section title="Share URL Settings">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>URL to Share</Label>
              <RadioGroup value={settings.url_to_share} onValueChange={(v) => updateSetting("url_to_share", v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="current" id="url-c" /><Label htmlFor="url-c">Current Page URL</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id="url-cust" /><Label htmlFor="url-cust">Custom URL</Label></div>
              </RadioGroup>
              {settings.url_to_share === "custom" && (
                <Input className="mt-2" placeholder="https://example.com" value={settings.custom_url} onChange={(e) => updateSetting("custom_url", e.target.value)} />
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div><Label className="text-base">UTM Parameters</Label><p className="text-sm text-muted-foreground">Append UTM tags to shared links.</p></div>
                <Switch checked={settings.utm_enabled} onCheckedChange={(c) => updateSetting("utm_enabled", c)} />
              </div>

              {settings.utm_enabled && (
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/10">
                  <div className="space-y-1.5"><Label>utm_source</Label><Input placeholder="e.g. website" value={settings.utm_source} onChange={(e) => updateSetting("utm_source", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>utm_medium</Label><Input placeholder="social_share" value={settings.utm_medium} onChange={(e) => updateSetting("utm_medium", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>utm_campaign</Label><Input placeholder="e.g. spring_sale" value={settings.utm_campaign} onChange={(e) => updateSetting("utm_campaign", e.target.value)} /></div>
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section title="Analytics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label className="text-base">Track Share Clicks</Label><p className="text-sm text-muted-foreground">Send events to Google Analytics.</p></div>
              <Switch checked={settings.track_clicks} onCheckedChange={(c) => updateSetting("track_clicks", c)} />
            </div>
            {settings.track_clicks && (
              <div className="space-y-3">
                <Label>GA Event Name</Label>
                <Input value={settings.ga_event_name} onChange={(e) => updateSetting("ga_event_name", e.target.value)} />
              </div>
            )}
          </div>
        </Section>

        <Section title="Active Platforms">
          <p className="text-sm text-muted-foreground mb-4">Drag to reorder. Toggle checkbox to enable/disable.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedPlatforms} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {orderedPlatforms.map(id => {
                  const p = ALL_PLATFORMS.find(x => x.id === id);
                  if (!p) return null;
                  return (
                    <SortablePlatformItem
                      key={id}
                      platform={p}
                      isActive={settings.share_platforms.includes(id)}
                      togglePlatform={togglePlatform}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </Section>
      </div>

      {/* LIVE PREVIEW PANEL */}
      <div className="w-full xl:w-[400px] shrink-0">
        <div className="sticky top-6">
          <Card className="overflow-hidden border-border bg-[#0d1b2a]">
            <div className="bg-[#1a2b3c] px-4 py-2 flex items-center gap-2 border-b border-[#2a3b4c]">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-xs font-mono text-muted-foreground">Live Preview</div>
            </div>
            <CardContent className="p-0 h-[600px] relative">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

              {/* Fake Content */}
              <div className="p-8 space-y-4">
                <div className="h-8 w-3/4 bg-muted/20 rounded"></div>
                <div className="h-4 w-full bg-muted/10 rounded"></div>
                <div className="h-4 w-5/6 bg-muted/10 rounded"></div>
                <div className="h-4 w-4/6 bg-muted/10 rounded"></div>
                <div className="mt-8 h-32 w-full bg-muted/10 rounded"></div>
              </div>

              {/* Sidebar Preview */}
              {settings.share_enabled === "true" && (
                <div
                  className="absolute flex flex-col items-center shadow-2xl transition-all"
                  style={{
                    [settings.share_position]: `${settings.sidebar_gap}px`,
                    top: settings.sidebar_vertical === "top" ? "10%" : settings.sidebar_vertical === "center" ? "50%" : "auto",
                    bottom: settings.sidebar_vertical === "bottom" ? "10%" : "auto",
                    transform: settings.sidebar_vertical === "center" ? "translateY(-50%)" : "none",
                  }}
                >
                  <div
                    className="border border-primary/20 bg-primary text-white rounded-lg"
                    style={{
                      borderRadius: settings.icon_style === "circle" ? "20px 20px 0 0" : (settings.share_position === "left" ? "8px 8px 0 0" : "8px 8px 0 0"),
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col w-full overflow-hidden" style={{ borderRadius: settings.icon_style === "circle" ? "0 0 20px 20px" : "0 0 8px 8px" }}>
                    {activePlatformsList.map((id) => {
                      const platform = ALL_PLATFORMS.find(p => p.id === id);
                      if (!platform) return null;
                      const Icon = platform.icon;

                      let bg = platform.color;
                      let fill = "#ffffff";

                      if (settings.color_scheme === "monochrome") {
                        bg = "#333333";
                        fill = "#ffffff";
                      } else if (settings.color_scheme === "custom") {
                        bg = settings.custom_bg_color;
                        fill = settings.custom_fill_color;
                      }

                      if (settings.icon_style === "minimal") {
                        bg = "transparent";
                        fill = settings.color_scheme === "brand" ? platform.color : (settings.color_scheme === "monochrome" ? "#ffffff" : settings.custom_fill_color);
                      }

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-center relative border-b border-white/10 last:border-0"
                          style={{
                            width: `${settings.icon_size}px`,
                            height: `${settings.icon_size}px`,
                            backgroundColor: bg,
                            color: fill,
                            borderRadius: settings.icon_style === "circle" ? "50%" : "0"
                          }}
                        >
                          <Icon style={{ width: settings.icon_size * 0.5, height: settings.icon_size * 0.5 }} />
                          {settings.show_labels && (
                            <span
                              className="absolute bg-black/80 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap"
                              style={{ [settings.share_position === "left" ? "left" : "right"]: "100%", margin: "0 8px" }}
                            >
                              {platform.label}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
