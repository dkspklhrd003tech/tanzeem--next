"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  options?: string[]; // for 'select'
  isNew?: boolean; // tracking UI state
};

interface SortableFieldRowProps {
  field: CustomFieldDef;
  onUpdate: (id: string, updates: Partial<CustomFieldDef>) => void;
  onRemove: (id: string) => void;
}

function SortableFieldRow({ field, onUpdate, onRemove }: SortableFieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-4 p-4 mb-3 border rounded-xl bg-card ${
        isDragging ? "shadow-lg border-primary/50 opacity-90" : "shadow-sm border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-muted p-1.5 rounded text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            <div>
              <Label className="text-xs mb-1 block">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate(field.id, { 
                    label: val, 
                    // Auto-slugify if it's a new field and the user hasn't explicitly customized the key
                    ...(field.isNew ? { fieldKey: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {})
                  });
                }}
                placeholder="e.g. Speaker Bio"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Field Key</Label>
              <Input
                value={field.fieldKey}
                onChange={(e) => onUpdate(field.id, { fieldKey: e.target.value, isNew: false })}
                placeholder="speaker-bio"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Field Type</Label>
              <Select
                value={field.fieldType}
                onValueChange={(val) => onUpdate(field.id, { fieldType: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (Short)</SelectItem>
                  <SelectItem value="textarea">Textarea (Long)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="url">URL / Link</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="toggle">Toggle (Yes/No)</SelectItem>
                  <SelectItem value="file">File/Image Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 -mt-4 shrink-0"
          onClick={() => {
            if (window.confirm("Remove this field? Any saved data for this field will be lost.")) {
              onRemove(field.id);
            }
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
            <Label className="text-xs mb-1 block text-muted-foreground">Placeholder (Optional)</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
              className="h-8 text-sm"
            />
         </div>
         <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id={`req-${field.id}`}
              checked={field.isRequired}
              onCheckedChange={(c) => onUpdate(field.id, { isRequired: !!c })}
            />
            <Label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer">
              Required Field
            </Label>
         </div>
      </div>
    </div>
  );
}

interface CustomFieldBuilderProps {
  entityType: string;
}

export function CustomFieldBuilder({ entityType }: CustomFieldBuilderProps) {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFields();
  }, [entityType]);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/custom-fields?entityType=${entityType}`);
      const data = await res.json();
      if (data.fields) {
        setFields(data.fields);
      }
    } catch (err) {
      toast.error("Failed to load custom fields");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Validation
      if (fields.some(f => !f.label.trim() || !f.fieldKey.trim())) {
        toast.error("All fields must have a label and key.");
        setIsSaving(false);
        return;
      }
      
      const keys = fields.map(f => f.fieldKey);
      if (new Set(keys).size !== keys.length) {
        toast.error("Field keys must be unique.");
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, fields }),
      });
      if (res.ok) {
        toast.success("Custom fields saved successfully.");
        // clear isNew flags
        setFields(fields.map(f => ({ ...f, isNew: false })));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save fields");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    const newField: CustomFieldDef = {
      id: uuidv4(),
      label: "",
      fieldKey: "",
      fieldType: "text",
      isRequired: false,
      isNew: true,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomFieldDef>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 pt-4 border-t mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">Define additional fields for this entry type.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary text-primary-foreground">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Schema
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field) => (
              <SortableFieldRow
                key={field.id}
                field={field}
                onUpdate={updateField}
                onRemove={removeField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-foreground"
        onClick={addField}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Field
      </Button>
    </div>
  );
}
