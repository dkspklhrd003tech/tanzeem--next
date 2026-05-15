"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
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
import { v4 as uuidv4 } from "uuid";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";

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
  { value: "hero", label: "Hero Slider" },
  { value: "intro", label: "Intro (Text + Image)" },
  { value: "stats", label: "Stats Grid" },
  { value: "accordion", label: "Accordion (FAQ)" },
  { value: "team", label: "Team Grid" },
  { value: "media_grid", label: "Media Grid" },
  { value: "publications", label: "Publications Grid" },
  { value: "cta_banner", label: "CTA Banner" },
  { value: "embed", label: "Embed / Media" },
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

  const removeSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    onSave(updated);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSections(updated);
    onSave(updated);
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case "intro":
        return { heading: "", subheading: "", body: "", image: "", alignment: "left" };
      case "cta_banner":
        return { heading: "", subheading: "", buttonLabel: "", buttonUrl: "" };
      case "stats":
        return { stats: [{ number: "0", label: "Stat" }] };
      case "accordion":
        return { heading: "Frequently Asked Questions", items: [{ question: "", answer: "" }] };
      case "embed":
        return { source: "", aspectRatio: "video" };
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
                onRemove={() => removeSection(section.id)}
                onUpdate={(updates) => updateSection(section.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <p className="text-foreground-muted">No sections added yet. Click "Add Section" to start building your page.</p>
        </div>
      )}
    </div>
  );
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
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
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

function SectionConfigForm({ type, config, onUpdate }: any) {
  const handleChange = (key: string, value: any) => {
    onUpdate({ ...config, [key]: value });
  };

  switch (type) {
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
              <Select value={config.alignment} onValueChange={(val) => handleChange("alignment", val)}>
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
            <Label>Button Label</Label>
            <Input value={config.buttonLabel} onChange={(e) => handleChange("buttonLabel", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button URL</Label>
            <Input value={config.buttonUrl} onChange={(e) => handleChange("buttonUrl", e.target.value)} />
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
            <Select value={config.aspectRatio} onValueChange={(val) => handleChange("aspectRatio", val)}>
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
    default:
      return <div className="text-sm text-foreground-muted italic">Configuration fields for this section are coming soon.</div>;
  }
}
