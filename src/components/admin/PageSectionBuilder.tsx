"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  XCircle,
  GripVertical,
  Settings2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Section {
  id: string;
  type: string;
  order: number;
  config: any;
  isActive: boolean;
}

interface PageSectionBuilderProps {
  pageId: string;
  onSave: (sections: Section[]) => void;
}

const SECTION_TYPES = [
  // ── Existing ──────────────────────────────────────────────────────────
  { value: "hero", label: "Hero Slider" },
  { value: "intro", label: "Intro (Text + Image)" },
  { value: "stats", label: "Stats Grid" },
  { value: "accordion", label: "Accordion / FAQ" },
  { value: "team", label: "Team Grid" },
  { value: "media_grid", label: "Media Grid" },
  { value: "publications", label: "Publications Grid" },
  { value: "cta_banner", label: "CTA Banner" },
  { value: "embed", label: "Embed / Media" },
  // ── New ───────────────────────────────────────────────────────────────
  { value: "text_block", label: "Text Block (Rich Text)" },
  { value: "image_text", label: "Image + Text (Side by Side)" },
  { value: "quote_banner", label: "Quote Banner (Full Width)" },
  { value: "leader_bio", label: "Leader Bio Card" },
  { value: "ideology_cards", label: "Ideology / Feature Cards" },
  { value: "join_cta", label: "Join Us CTA" },
  { value: "nested_category_grid", label: "Nested Categories Grid (Audio/Video)" },
];

export function PageSectionBuilder({ pageId, onSave }: PageSectionBuilderProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (pageId && pageId !== "new") {
      fetchSections();
    }
  }, [pageId]);

  const fetchSections = async () => {
    try {
      const res = await fetch(`/api/admin/page_sections?pageId=${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setSections(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch sections", err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);

        // Update order field
        const updated = newArray.map((item, index) => ({
          ...item,
          order: index,
        }));

        onSave(updated);
        return updated;
      });
    }
  };

  const addSection = (type: string) => {
    const newSection: Section = {
      id: uuidv4(),
      type,
      order: sections.length,
      config: getDefaultConfig(type),
      isActive: true,
    };
    const updated = [...sections, newSection];
    setSections(updated);
    setExpandedId(newSection.id);
    onSave(updated);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const removeSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    onSave(updated);
    setDeletingId(null);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSections(updated);
    onSave(updated);
  };
  const getDefaultConfig = (type: string) => {
    switch (type) {
      case "hero":
        return { title: "", subtitle: "", backgroundImage: "" };
      case "intro":
        return { heading: "", subheading: "", body: "", image: "", alignment: "left" };
      case "cta_banner":
        return { heading: "", subheading: "", buttonLabel: "", buttonUrl: "" };
      case "stats":
        return { stats: [{ number: "0", label: "Stat" }] };
      case "accordion":
        return { heading: "Frequently Asked Questions", items: [{ question: "", answer: "" }] };
      case "team":
        return { heading: "Our Leadership", members: [{ name: "", designation: "", avatar: "" }] };
      case "media_grid":
        return { heading: "Media Library", columns: 3, items: [{ title: "", image: "", type: "video", link: "" }] };
      case "publications":
        return { heading: "Publications", publications: [{ title: "", cover: "", author: "", link: "" }] };
      case "embed":
        return { source: "", aspectRatio: "video" };
      // ── New section types ────────────────────────────────────────────
      case "text_block":
        return { heading: "", body: "", align: "left" };
      case "image_text":
        return {
          heading: "",
          body: "",
          image: "",
          imageAlt: "",
          imagePosition: "right",  // "left" | "right"
          buttonLabel: "",
          buttonUrl: "",
        };
      case "quote_banner":
        return {
          quote: "",
          attribution: "",
          bgColor: "#0d5844",        // defaults to brand green
          textColor: "#ffffff",
        };
      case "leader_bio":
        return {
          name: "",
          designation: "",
          bio: "",
          avatar: "",
          readMoreUrl: "",
          readMoreLabel: "Read More",
        };
      case "ideology_cards":
        return {
          heading: "Our Ideology",
          cards: [
            { icon: "book", title: "Quran ul Kareem", urduTitle: "قرآن الکریم", description: "", linkLabel: "Learn More", linkUrl: "" },
            { icon: "star", title: "Prophethood", urduTitle: "نبوت", description: "", linkLabel: "Learn More", linkUrl: "" },
            { icon: "compass", title: "Din-ul-Qayyim", urduTitle: "دینِ قیّم", description: "", linkLabel: "Learn More", linkUrl: "" },
            { icon: "heart", title: "Our Belief", urduTitle: "ہمارا عقیدہ", description: "", linkLabel: "Learn More", linkUrl: "" },
          ],
        };
      case "join_cta":
        return {
          heading: "Join Tanzeem-e-Islami",
          subheading: "Become a part of the movement for the re-establishment of the Islamic system.",
          buttonLabel: "Join Now",
          buttonUrl: "/join-tanzeem",
          bgColor: "#0d5844",
          textColor: "#ffffff",
        };
      case "nested_category_grid":
        return {
          heading: "Categories",
          style: "capsule", // "capsule" or "image_card"
          categories: [
            {
              id: uuidv4(),
              title: "Category 1",
              image: "",
              subcategories: [
                { id: uuidv4(), title: "Sub Category 1", mediaUrl: "", description: "" }
              ]
            }
          ]
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Page Sections</h3>
        <Select onValueChange={addSection}>
          <SelectTrigger className="w-[200px] bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Add Section" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                isExpanded={expandedId === section.id}
                onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
                onRemove={(id: string) => setDeletingId(id)}
                onUpdate={(updates: any) => updateSection(section.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(isOpen) => !isOpen && setDeletingId(null)}
        title="Remove Section"
        description="Are you sure you want to remove this section? This will delete all its content and configuration."
        onConfirm={() => deletingId && removeSection(deletingId)}
      />

      {sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <p className="text-foreground-muted">No sections added yet. Click "Add Section" to start building your page.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Sanitize a config object coming from the DB — replace null/undefined with
 * safe defaults so controlled inputs never receive null.
 * - strings → ""
 * - numbers → 0
 * - booleans → false
 * - arrays  → []
 * - objects → {}
 * Deep-clones one level so nested arrays of objects are also sanitized.
 */
function sanitizeConfig(config: any): any {
  if (!config || typeof config !== "object") return {};
  const out: any = {};
  for (const [k, v] of Object.entries(config)) {
    if (v === null || v === undefined) {
      out[k] = "";
    } else if (Array.isArray(v)) {
      // Sanitize every item in the array
      out[k] = v.map((item) =>
        item && typeof item === "object" ? sanitizeConfig(item) : (item ?? "")
      );
    } else if (typeof v === "object") {
      out[k] = sanitizeConfig(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function SortableItem({ section, isExpanded, onToggleExpand, onRemove, onUpdate }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const label = SECTION_TYPES.find(t => t.value === section.type)?.label || section.type;

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="border-border hover:border-primary/30 transition-all shadow-sm">
        <div className="p-4 flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-foreground-muted hover:text-primary transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold uppercase text-xs">
              {section.type.substring(0, 2)}
            </div>
            <div>
              <p className="font-bold text-foreground">{label}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wider">Type: {section.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdate({ isActive: !section.isActive })}
              title={section.isActive ? "Hide" : "Show"}
            >
              {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-destructive" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onRemove(section.id)} className="text-destructive hover:bg-destructive/80">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <CardContent className="p-6 border-t border-border bg-muted/20">
            <SectionConfigForm
              type={section.type}
              config={section.config}
              onUpdate={(config) => onUpdate({ config })}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
function SectionConfigForm({ type, config: rawConfig, onUpdate }: { type: string, config: any, onUpdate: (config: any) => void }) {
  // Sanitize DB config before passing to controlled inputs — prevents null/undefined values
  const config = sanitizeConfig(rawConfig);

  const handleChange = (key: string, value: any) => {
    onUpdate({ ...config, [key]: value });
  };

  switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Main Title</Label>
              <Input value={config.title} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={config.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Background Image</Label>
            <ImageUploader
              value={config.backgroundImage}
              onChange={(url) => handleChange("backgroundImage", url)}
              aspectRatio={16 / 9}
            />
          </div>
        </div>
      );
    case "intro":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subheading</Label>
              <Input value={config.subheading} onChange={(e) => handleChange("subheading", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Body Content</Label>
            <RichTextEditor
              content={config.body}
              onChange={(val) => handleChange("body", val)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Section Image</Label>
              <ImageUploader
                value={config.image}
                onChange={(url) => handleChange("image", url)}
                aspectRatio={1.2}
              />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select value={config.alignment || "left"} onValueChange={(val) => handleChange("alignment", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left (Image on Right)</SelectItem>
                  <SelectItem value="right">Right (Image on Left)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    case "cta_banner":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subheading</Label>
            <Input value={config.subheading} onChange={(e) => handleChange("subheading", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button Label</Label>
            <Input value={config.buttonLabel} onChange={(e) => handleChange("buttonLabel", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button URL</Label>
            <Input value={config.buttonUrl} onChange={(e) => handleChange("buttonUrl", e.target.value)} />
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Stats Items</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("stats", [...(config.stats || []), { number: "", label: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Stat
            </Button>
          </div>
          <div className="space-y-3">
            {config.stats?.map((stat: any, i: number) => (
              <div key={i} className="flex gap-4 items-end bg-background p-3 rounded-lg border">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Number</Label>
                    <Input value={stat.number} onChange={(e) => {
                      const newStats = [...config.stats];
                      newStats[i].number = e.target.value;
                      handleChange("stats", newStats);
                    }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Label</Label>
                    <Input value={stat.label} onChange={(e) => {
                      const newStats = [...config.stats];
                      newStats[i].label = e.target.value;
                      handleChange("stats", newStats);
                    }} />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                  const newStats = config.stats.filter((_: any, idx: number) => idx !== i);
                  handleChange("stats", newStats);
                }}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
    case "accordion":
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Accordion Items (FAQ)</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("items", [...(config.items || []), { question: "", answer: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </div>
          <div className="space-y-4">
            {config.items?.map((item: any, i: number) => (
              <div key={i} className="space-y-2 bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-primary">Item #{i + 1}</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    const newItems = config.items.filter((_: any, idx: number) => idx !== i);
                    handleChange("items", newItems);
                  }}>
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">Question</Label>
                  <Input value={item.question} onChange={(e) => {
                    const newItems = [...config.items];
                    newItems[i].question = e.target.value;
                    handleChange("items", newItems);
                  }} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">Answer</Label>
                  <Textarea value={item.answer ?? ""} onChange={(e) => {
                    const newItems = [...config.items];
                    newItems[i].answer = e.target.value;
                    handleChange("items", newItems);
                  }} rows={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "team":
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Team Members</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("members", [...(config.members || []), { name: "", designation: "", avatar: "", buttonText: "", buttonUrl: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Member
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.members?.map((member: any, i: number) => (
              <div key={i} className="space-y-4 bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-primary">Member #{i + 1}</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    const newMembers = config.members.filter((_: any, idx: number) => idx !== i);
                    handleChange("members", newMembers);
                  }}>
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <ImageUploader value={member.avatar} onChange={(url) => {
                    const newMembers = [...config.members];
                    newMembers[i].avatar = url;
                    handleChange("members", newMembers);
                  }} aspectRatio={1} />
                  <Input placeholder="Name" value={member.name} onChange={(e) => {
                    const newMembers = [...config.members];
                    newMembers[i].name = e.target.value;
                    handleChange("members", newMembers);
                  }} />
                  <Input placeholder="Designation" value={member.designation} onChange={(e) => {
                    const newMembers = [...config.members];
                    newMembers[i].designation = e.target.value;
                    handleChange("members", newMembers);
                  }} />
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                    <Input placeholder="Button Text (e.g. View Profile)" value={member.buttonText || ""} onChange={(e) => {
                      const newMembers = [...config.members];
                      newMembers[i].buttonText = e.target.value;
                      handleChange("members", newMembers);
                    }} />
                    <Input placeholder="Button URL (https://...)" value={member.buttonUrl || ""} onChange={(e) => {
                      const newMembers = [...config.members];
                      newMembers[i].buttonUrl = e.target.value;
                      handleChange("members", newMembers);
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "media_grid":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select value={String(config.columns) || "3"} onValueChange={(val) => handleChange("columns", parseInt(val))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Media Items</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("items", [...(config.items || []), { title: "", image: "", type: "video", link: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Media
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.items?.map((item: any, i: number) => (
              <div key={i} className="space-y-4 bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-primary">Media #{i + 1}</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    const newItems = config.items.filter((_: any, idx: number) => idx !== i);
                    handleChange("items", newItems);
                  }}>
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <ImageUploader value={item.image} onChange={(url) => {
                    const newItems = [...config.items];
                    newItems[i].image = url;
                    handleChange("items", newItems);
                  }} aspectRatio={16 / 9} />
                  <Input placeholder="Title" value={item.title} onChange={(e) => {
                    const newItems = [...config.items];
                    newItems[i].title = e.target.value;
                    handleChange("items", newItems);
                  }} />
                  <div className="flex gap-2">
                    <Select value={item.type || "video"} onValueChange={(val) => {
                      const newItems = [...config.items];
                      newItems[i].type = val;
                      handleChange("items", newItems);
                    }}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Link / URL" className="flex-1" value={item.link} onChange={(e) => {
                      const newItems = [...config.items];
                      newItems[i].link = e.target.value;
                      handleChange("items", newItems);
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "publications":
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={config.heading} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Publications</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("publications", [...(config.publications || []), { title: "", cover: "", author: "", link: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Book
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.publications?.map((pub: any, i: number) => (
              <div key={i} className="space-y-4 bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-primary">Publication #{i + 1}</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    const newPubs = config.publications.filter((_: any, idx: number) => idx !== i);
                    handleChange("publications", newPubs);
                  }}>
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <ImageUploader value={pub.cover} onChange={(url) => {
                    const newPubs = [...config.publications];
                    newPubs[i].cover = url;
                    handleChange("publications", newPubs);
                  }} aspectRatio={3 / 4} />
                  <Input placeholder="Title" value={pub.title} onChange={(e) => {
                    const newPubs = [...config.publications];
                    newPubs[i].title = e.target.value;
                    handleChange("publications", newPubs);
                  }} />
                  <Input placeholder="Author" value={pub.author} onChange={(e) => {
                    const newPubs = [...config.publications];
                    newPubs[i].author = e.target.value;
                    handleChange("publications", newPubs);
                  }} />
                  <Input placeholder="Link / URL" value={pub.link} onChange={(e) => {
                    const newPubs = [...config.publications];
                    newPubs[i].link = e.target.value;
                    handleChange("publications", newPubs);
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "embed":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Source URL (YouTube/Iframe)</Label>
            <Input value={config.source} onChange={(e) => handleChange("source", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={config.aspectRatio || "video"} onValueChange={(val) => handleChange("aspectRatio", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">16:9 Video</SelectItem>
                <SelectItem value="square">1:1 Square</SelectItem>
                <SelectItem value="wide">21:9 UltraWide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    // ── NEW SECTION TYPES ────────────────────────────────────────────────

    case "text_block":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Heading (optional)</Label>
            <Input value={config.heading ?? ""} onChange={(e) => handleChange("heading", e.target.value)} placeholder="Section heading" />
          </div>
          <div className="space-y-2">
            <Label>Body Content</Label>
            <RichTextEditor content={config.body ?? ""} onChange={(val) => handleChange("body", val)} />
          </div>
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <Select value={config.align || "left"} onValueChange={(val) => handleChange("align", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "image_text":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={config.heading ?? ""} onChange={(e) => handleChange("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image Position</Label>
              <Select value={config.imagePosition || "right"} onValueChange={(val) => handleChange("imagePosition", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Body Content</Label>
            <RichTextEditor content={config.body ?? ""} onChange={(val) => handleChange("body", val)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader value={config.image ?? ""} onChange={(url) => handleChange("image", url)} aspectRatio={1.2} />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image Alt Text</Label>
                <Input value={config.imageAlt ?? ""} onChange={(e) => handleChange("imageAlt", e.target.value)} placeholder="Describe the image" />
              </div>
              <div className="space-y-2">
                <Label>Button Label (optional)</Label>
                <Input value={config.buttonLabel ?? ""} onChange={(e) => handleChange("buttonLabel", e.target.value)} placeholder="Read More" />
              </div>
              <div className="space-y-2">
                <Label>Button URL</Label>
                <Input value={config.buttonUrl ?? ""} onChange={(e) => handleChange("buttonUrl", e.target.value)} placeholder="/page-slug" />
              </div>
            </div>
          </div>
        </div>
      );

    case "quote_banner":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quote Text</Label>
            <Textarea value={config.quote ?? ""} onChange={(e) => handleChange("quote", e.target.value)} rows={3} placeholder="Enter the quote…" />
          </div>
          <div className="space-y-2">
            <Label>Attribution (optional)</Label>
            <Input value={config.attribution ?? ""} onChange={(e) => handleChange("attribution", e.target.value)} placeholder="— Dr. Israr Ahmed" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={config.bgColor ?? "#0d5844"} onChange={(e) => handleChange("bgColor", e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                <Input value={config.bgColor ?? "#0d5844"} onChange={(e) => handleChange("bgColor", e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={config.textColor ?? "#ffffff"} onChange={(e) => handleChange("textColor", e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                <Input value={config.textColor ?? "#ffffff"} onChange={(e) => handleChange("textColor", e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        </div>
      );

    case "leader_bio":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={config.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Dr. Israr Ahmed" />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={config.designation ?? ""} onChange={(e) => handleChange("designation", e.target.value)} placeholder="Founder" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Photo</Label>
            <ImageUploader value={config.avatar ?? ""} onChange={(url) => handleChange("avatar", url)} aspectRatio={1} />
          </div>
          <div className="space-y-2">
            <Label>Biography</Label>
            <RichTextEditor content={config.bio ?? ""} onChange={(val) => handleChange("bio", val)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Read More Link</Label>
              <Input value={config.readMoreUrl ?? ""} onChange={(e) => handleChange("readMoreUrl", e.target.value)} placeholder="/organization/the-founder" />
            </div>
            <div className="space-y-2">
              <Label>Read More Label</Label>
              <Input value={config.readMoreLabel ?? "Read More"} onChange={(e) => handleChange("readMoreLabel", e.target.value)} />
            </div>
          </div>
        </div>
      );

    case "ideology_cards":
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Section Heading</Label>
            <Input value={config.heading ?? "Our Ideology"} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Cards</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("cards", [
              ...(config.cards ?? []),
              { icon: "book", title: "", urduTitle: "", description: "", linkLabel: "Learn More", linkUrl: "" },
            ])}>
              <Plus className="w-3 h-3 mr-1" /> Add Card
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(config.cards ?? []).map((card: any, i: number) => (
              <div key={i} className="space-y-3 bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-primary">Card #{i + 1}</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    handleChange("cards", (config.cards ?? []).filter((_: any, idx: number) => idx !== i));
                  }}><XCircle className="w-3 h-3" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Icon</Label>
                    <Select value={card.icon || "book"} onValueChange={(val) => {
                      const c = [...(config.cards ?? [])]; c[i] = { ...c[i], icon: val }; handleChange("cards", c);
                    }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="star">Star</SelectItem>
                        <SelectItem value="compass">Compass</SelectItem>
                        <SelectItem value="heart">Heart</SelectItem>
                        <SelectItem value="shield">Shield</SelectItem>
                        <SelectItem value="globe">Globe</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="lightbulb">Lightbulb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Link Label</Label>
                    <Input className="h-8 text-xs" value={card.linkLabel ?? "Learn More"} onChange={(e) => {
                      const c = [...(config.cards ?? [])]; c[i] = { ...c[i], linkLabel: e.target.value }; handleChange("cards", c);
                    }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Title (English)</Label>
                  <Input className="h-8 text-xs" value={card.title ?? ""} onChange={(e) => {
                    const c = [...(config.cards ?? [])]; c[i] = { ...c[i], title: e.target.value }; handleChange("cards", c);
                  }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Title (Urdu / Arabic)</Label>
                  <Input className="h-8 text-xs font-nastaleeq" dir="rtl" lang="ur" value={card.urduTitle ?? ""} onChange={(e) => {
                    const c = [...(config.cards ?? [])]; c[i] = { ...c[i], urduTitle: e.target.value }; handleChange("cards", c);
                  }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Description</Label>
                  <Textarea className="text-xs" rows={2} value={card.description ?? ""} onChange={(e) => {
                    const c = [...(config.cards ?? [])]; c[i] = { ...c[i], description: e.target.value }; handleChange("cards", c);
                  }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Link URL</Label>
                  <Input className="h-8 text-xs font-mono" value={card.linkUrl ?? ""} onChange={(e) => {
                    const c = [...(config.cards ?? [])]; c[i] = { ...c[i], linkUrl: e.target.value }; handleChange("cards", c);
                  }} placeholder="/organization/our-ideology" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "nested_category_grid":
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={config.heading ?? ""} onChange={(e) => handleChange("heading", e.target.value)} placeholder="View Audios by Category" />
            </div>
            <div className="space-y-2">
              <Label>Grid Style</Label>
              <Select value={config.style || "capsule"} onValueChange={(val) => handleChange("style", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="capsule">Capsules (Outline Buttons)</SelectItem>
                  <SelectItem value="image_card">Image Cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Label>Categories</Label>
            <Button size="sm" variant="outline" onClick={() => handleChange("categories", [...(config.categories || []), { id: uuidv4(), title: "New Category", image: "", subcategories: [] }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Category
            </Button>
          </div>

          <div className="space-y-6">
            {config.categories?.map((cat: any, cIdx: number) => (
              <div key={cat.id || cIdx} className="space-y-4 bg-background p-4 rounded-xl border border-border/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold text-primary">Category: {cat.title || `Item #${cIdx + 1}`}</Label>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/80" onClick={() => {
                    const newCats = config.categories.filter((_: any, idx: number) => idx !== cIdx);
                    handleChange("categories", newCats);
                  }}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px]">Title</Label>
                    <Input value={cat.title ?? ""} onChange={(e) => {
                      const newCats = [...config.categories];
                      newCats[cIdx].title = e.target.value;
                      handleChange("categories", newCats);
                    }} placeholder="e.g. Ameer Say Mulaqat" />
                  </div>
                  {config.style === "image_card" && (
                    <div className="space-y-2">
                      <Label className="text-[10px]">Thumbnail Image</Label>
                      <ImageUploader value={cat.image ?? ""} onChange={(url) => {
                        const newCats = [...config.categories];
                        newCats[cIdx].image = url;
                        handleChange("categories", newCats);
                      }} aspectRatio={16 / 9} />
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground-muted">Sub-categories for {cat.title}</Label>
                    <Button size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => {
                      const newCats = [...config.categories];
                      newCats[cIdx].subcategories = [...(newCats[cIdx].subcategories || []), { id: uuidv4(), title: "New Sub-category", mediaUrl: "", description: "" }];
                      handleChange("categories", newCats);
                    }}>
                      <Plus className="w-3 h-3 mr-1" /> Add Sub-category
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {cat.subcategories?.map((sub: any, sIdx: number) => (
                      <div key={sub.id || sIdx} className="grid sm:grid-cols-12 gap-3 items-end bg-background p-3 rounded-lg border border-border/60">
                        <div className="sm:col-span-3 space-y-1">
                          <Label className="text-[9px]">Sub-category Title</Label>
                          <Input className="h-8 text-xs" value={sub.title ?? ""} onChange={(e) => {
                            const newCats = [...config.categories];
                            newCats[cIdx].subcategories[sIdx].title = e.target.value;
                            handleChange("categories", newCats);
                          }} placeholder="Episode 1" />
                        </div>
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[9px]">Media URL (Video/Audio)</Label>
                          <Input className="h-8 text-xs" value={sub.mediaUrl ?? ""} onChange={(e) => {
                            const newCats = [...config.categories];
                            newCats[cIdx].subcategories[sIdx].mediaUrl = e.target.value;
                            handleChange("categories", newCats);
                          }} placeholder="https://..." />
                        </div>
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[9px]">Description (optional)</Label>
                          <Input className="h-8 text-xs" value={sub.description ?? ""} onChange={(e) => {
                            const newCats = [...config.categories];
                            newCats[cIdx].subcategories[sIdx].description = e.target.value;
                            handleChange("categories", newCats);
                          }} placeholder="Short description..." />
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/80" onClick={() => {
                            const newCats = [...config.categories];
                            newCats[cIdx].subcategories = newCats[cIdx].subcategories.filter((_: any, idx: number) => idx !== sIdx);
                            handleChange("categories", newCats);
                          }}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!cat.subcategories || cat.subcategories.length === 0) && (
                      <p className="text-[11px] text-muted-foreground text-center py-2">No sub-categories yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "join_cta":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={config.heading ?? ""} onChange={(e) => handleChange("heading", e.target.value)} placeholder="Join Tanzeem-e-Islami" />
            </div>
            <div className="space-y-2">
              <Label>Button Label</Label>
              <Input value={config.buttonLabel ?? "Join Now"} onChange={(e) => handleChange("buttonLabel", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subheading</Label>
            <Textarea value={config.subheading ?? ""} onChange={(e) => handleChange("subheading", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Button URL</Label>
            <Input value={config.buttonUrl ?? "/join-tanzeem"} onChange={(e) => handleChange("buttonUrl", e.target.value)} placeholder="/join-tanzeem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={config.bgColor ?? "#0d5844"} onChange={(e) => handleChange("bgColor", e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                <Input value={config.bgColor ?? "#0d5844"} onChange={(e) => handleChange("bgColor", e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={config.textColor ?? "#ffffff"} onChange={(e) => handleChange("textColor", e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                <Input value={config.textColor ?? "#ffffff"} onChange={(e) => handleChange("textColor", e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <div className="text-sm text-foreground-muted italic">Configuration fields for this section are coming soon.</div>;
  }
}
