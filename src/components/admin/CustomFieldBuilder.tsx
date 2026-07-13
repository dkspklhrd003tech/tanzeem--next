"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

export type CustomFieldDef = {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];        // for 'select', 'radio', 'checkbox-group', 'tags'
  min?: number;              // for 'number', 'rating', 'slider'
  max?: number;              // for 'number', 'rating', 'slider'
  step?: number;             // for 'slider'
  accept?: string;           // for 'file' — e.g. "image/*,audio/*"
  rows?: number;             // for 'textarea'
  isNew?: boolean;
};

// ── Field type catalogue ──────────────────────────────────────────────────────
export const FIELD_TYPE_GROUPS: { label: string; types: { value: string; label: string }[] }[] = [
  {
    label: "Text & Content",
    types: [
      { value: "text", label: "Text (Short)" },
      { value: "textarea", label: "Textarea (Long)" },
      { value: "richtext", label: "Rich Text (HTML)" },
      { value: "markdown", label: "Markdown" },
      { value: "code", label: "Code Snippet" },
    ],
  },
  {
    label: "Numbers & Ranges",
    types: [
      { value: "number", label: "Number" },
      { value: "slider", label: "Slider (Range)" },
      { value: "rating", label: "Star Rating (1–5)" },
      { value: "currency", label: "Currency / Price" },
    ],
  },
  {
    label: "Date & Time",
    types: [
      { value: "date", label: "Date" },
      { value: "datetime", label: "Date & Time" },
      { value: "time", label: "Time" },
    ],
  },
  {
    label: "Links & Media",
    types: [
      { value: "url", label: "URL / Link" },
      { value: "email", label: "Email Address" },
      { value: "phone", label: "Phone Number" },
      { value: "file", label: "File / Image Upload" },
      { value: "color", label: "Color Picker" },
    ],
  },
  {
    label: "Choice & Selection",
    types: [
      { value: "toggle", label: "Toggle (Yes / No)" },
      { value: "select", label: "Dropdown Select" },
      { value: "radio", label: "Radio Buttons" },
      { value: "checkbox-group", label: "Checkbox Group (Multi)" },
      { value: "tags", label: "Tags (Multi-value)" },
    ],
  },
  {
    label: "Location & Social",
    types: [
      { value: "location", label: "Location / Address" },
      { value: "json", label: "JSON / Key-Value Map" },
    ],
  },
];

const OPTION_FIELD_TYPES = new Set(["select", "radio", "checkbox-group", "tags"]);
const MIN_MAX_TYPES = new Set(["number", "slider", "rating"]);

// ── SortableFieldRow ──────────────────────────────────────────────────────────
interface SortableFieldRowProps {
  field: CustomFieldDef;
  onUpdate: (id: string, updates: Partial<CustomFieldDef>) => void;
  onRemove: (id: string) => void;
}

function SortableFieldRow({ field, onUpdate, onRemove }: SortableFieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [expanded, setExpanded] = useState(false);
  const [optionInput, setOptionInput] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    onUpdate(field.id, { options: [...(field.options ?? []), trimmed] });
    setOptionInput("");
  };

  const removeOption = (opt: string) => {
    onUpdate(field.id, { options: (field.options ?? []).filter(o => o !== opt) });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-0 mb-3 border rounded-xl bg-card overflow-hidden transition-shadow ${isDragging ? "shadow-xl border-primary/60 opacity-95" : "shadow-sm border-border"
        }`}
    >
      {/* ── Top row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-muted p-1.5 rounded text-muted-foreground shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          {/* Label */}
          <div>
            <Label className="text-xs mb-1 block">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate(field.id, {
                  label: val,
                  ...(field.isNew ? { fieldKey: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") } : {}),
                });
              }}
              placeholder="e.g. Speaker Bio"
            />
          </div>

          {/* Field Key */}
          <div>
            <Label className="text-xs mb-1 block">Field Key</Label>
            <Input
              value={field.fieldKey}
              onChange={(e) => onUpdate(field.id, { fieldKey: e.target.value, isNew: false })}
              placeholder="speaker-bio"
              className="font-mono text-sm"
            />
          </div>

          {/* Field Type */}
          <div>
            <Label className="text-xs mb-1 block">Field Type</Label>
            <Select value={field.fieldType} onValueChange={(val) => onUpdate(field.id, { fieldType: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {FIELD_TYPE_GROUPS.map(group => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </SelectLabel>
                    {group.types.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setExpanded(v => !v)}
            title="Advanced options"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              if (window.confirm("Remove this field? Any saved data for this field will be lost.")) {
                onRemove(field.id);
              }
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Expanded section ────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">Placeholder</Label>
              <Input
                value={field.placeholder ?? ""}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">Help Text</Label>
              <Input
                value={field.helpText ?? ""}
                onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id={`req-${field.id}`}
                checked={field.isRequired}
                onCheckedChange={(c) => onUpdate(field.id, { isRequired: !!c })}
              />
              <Label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer">Required Field</Label>
            </div>
          </div>

          {/* Min / Max / Step */}
          {MIN_MAX_TYPES.has(field.fieldType) && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1 block text-muted-foreground">Min</Label>
                <Input type="number" value={field.min ?? ""} onChange={(e) => onUpdate(field.id, { min: Number(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1 block text-muted-foreground">Max</Label>
                <Input type="number" value={field.max ?? ""} onChange={(e) => onUpdate(field.id, { max: Number(e.target.value) })} className="h-8 text-sm" />
              </div>
              {field.fieldType === "slider" && (
                <div>
                  <Label className="text-xs mb-1 block text-muted-foreground">Step</Label>
                  <Input type="number" value={field.step ?? 1} onChange={(e) => onUpdate(field.id, { step: Number(e.target.value) })} className="h-8 text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Textarea rows */}
          {(field.fieldType === "textarea" || field.fieldType === "richtext" || field.fieldType === "markdown" || field.fieldType === "code") && (
            <div className="w-32">
              <Label className="text-xs mb-1 block text-muted-foreground">Rows</Label>
              <Input type="number" min={2} max={30} value={field.rows ?? 4} onChange={(e) => onUpdate(field.id, { rows: Number(e.target.value) })} className="h-8 text-sm" />
            </div>
          )}

          {/* File accept */}
          {field.fieldType === "file" && (
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">Accept (MIME / extension, comma-separated)</Label>
              <Input value={field.accept ?? ""} placeholder="image/*,audio/mpeg,.pdf" onChange={(e) => onUpdate(field.id, { accept: e.target.value })} className="h-8 text-sm font-mono" />
            </div>
          )}

          {/* Options for select / radio / checkbox-group / tags */}
          {OPTION_FIELD_TYPES.has(field.fieldType) && (
            <div className="space-y-2">
              <Label className="text-xs block text-muted-foreground">Options</Label>
              <div className="flex flex-wrap gap-1 min-h-8">
                {(field.options ?? []).map(opt => (
                  <Badge key={opt} variant="secondary" className="gap-1 pr-1">
                    {opt}
                    <button type="button" onClick={() => removeOption(opt)} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                  placeholder="Type option and press Enter"
                  className="h-8 text-sm"
                />
                <Button type="button" size="sm" variant="outline" onClick={addOption}>Add</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CustomFieldBuilder ────────────────────────────────────────────────────────
interface CustomFieldBuilderProps {
  entityType: string;
}

export function CustomFieldBuilder({ entityType }: CustomFieldBuilderProps) {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchFields(); }, [entityType]);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/custom-fields?entityType=${entityType}`);
      const data = await res.json();
      if (data.fields) setFields(data.fields);
    } catch {
      toast.error("Failed to load custom fields");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (fields.some(f => !f.label.trim() || !f.fieldKey.trim())) {
      toast.error("All fields must have a label and key.");
      return;
    }
    const keys = fields.map(f => f.fieldKey);
    if (new Set(keys).size !== keys.length) {
      toast.error("Field keys must be unique.");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, fields }),
      });
      if (res.ok) {
        toast.success("Custom field schema saved.");
        setFields(fields.map(f => ({ ...f, isNew: false })));
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch {
      toast.error("Error saving fields.");
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    setFields(prev => [...prev, {
      id: uuidv4(),
      label: "",
      fieldKey: "",
      fieldType: "text",
      isRequired: false,
      isNew: true,
    }]);
  };

  const updateField = (id: string, updates: Partial<CustomFieldDef>) =>
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

  const removeField = (id: string) =>
    setFields(prev => prev.filter(f => f.id !== id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">
            Define additional fields for this entry type. {fields.length > 0 && <span className="text-primary font-medium">{fields.length} field{fields.length > 1 ? "s" : ""} defined.</span>}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary text-primary-foreground">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Schema
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
          💡 Click the <strong>↓ expand icon</strong> on any field to configure advanced options (placeholder, help text, min/max, options, etc.)
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map(field => (
              <SortableFieldRow key={field.id} field={field} onUpdate={updateField} onRemove={removeField} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed border-2 py-8 text-muted-foreground hover:border-primary/40 transition-colors"
        onClick={addField}
      >
        <Plus className="w-5 h-5 mr-2" /> Add New Field
      </Button>
    </div>
  );
}
