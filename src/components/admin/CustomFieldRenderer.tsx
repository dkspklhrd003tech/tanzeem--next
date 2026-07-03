"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, UploadCloud, Star, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFieldDef } from "./CustomFieldBuilder";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomFieldRendererProps {
  entityType: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function CustomFieldRenderer({ entityType, values, onChange }: CustomFieldRendererProps) {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/custom-fields?entityType=${entityType}`);
        const data = await res.json();
        if (data.fields) setFields(data.fields.filter((f: any) => f.isActive));
      } catch {
        console.error("Failed to load custom fields");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFields();
  }, [entityType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, accept?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(fieldKey);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        onChange(fieldKey, data.url);
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast.error("File upload failed");
    } finally {
      setIsUploading(null);
    }
  };

  const toggleCheckboxGroupOption = (fieldKey: string, opt: string, checked: boolean) => {
    const current: string[] = Array.isArray(values?.[fieldKey]) ? values[fieldKey] : [];
    const next = checked ? [...current, opt] : current.filter(o => o !== opt);
    onChange(fieldKey, next);
  };

  const addTag = (fieldKey: string, tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current: string[] = Array.isArray(values?.[fieldKey]) ? values[fieldKey] : [];
    if (!current.includes(trimmed)) onChange(fieldKey, [...current, trimmed]);
    setTagInputs(prev => ({ ...prev, [fieldKey]: "" }));
  };

  const removeTag = (fieldKey: string, tag: string) => {
    const current: string[] = Array.isArray(values?.[fieldKey]) ? values[fieldKey] : [];
    onChange(fieldKey, current.filter(t => t !== tag));
  };

  if (isLoading) {
    return <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (fields.length === 0) return null;

  return (
    <div className="space-y-5 pt-4 border-t border-border/50 mt-4">
      {fields.map((field) => {
        const value = values?.[field.fieldKey] ?? "";

        return (
          <div key={field.id} className="grid gap-1.5">
            <Label className="flex items-center gap-1 text-sm font-medium">
              {field.label}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>

            {/* ── Text (Short) ─────────────────────────────────────────── */}
            {field.fieldType === "text" && (
              <Input value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder} required={field.isRequired} />
            )}

            {/* ── Textarea (Long) ──────────────────────────────────────── */}
            {field.fieldType === "textarea" && (
              <Textarea value={value} rows={field.rows ?? 4} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder} required={field.isRequired} />
            )}

            {/* ── Rich Text (HTML) ─────────────────────────────────────── */}
            {field.fieldType === "richtext" && (
              <Textarea value={value} rows={field.rows ?? 6} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "Enter HTML content…"} required={field.isRequired} className="font-mono text-sm" />
            )}

            {/* ── Markdown ─────────────────────────────────────────────── */}
            {field.fieldType === "markdown" && (
              <Textarea value={value} rows={field.rows ?? 6} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "## Heading\n\nParagraph…"} required={field.isRequired} className="font-mono text-sm" />
            )}

            {/* ── Code Snippet ─────────────────────────────────────────── */}
            {field.fieldType === "code" && (
              <Textarea value={value} rows={field.rows ?? 8} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "// paste code here"} required={field.isRequired} className="font-mono text-xs bg-zinc-900 text-green-400 border-zinc-700" />
            )}

            {/* ── Number ───────────────────────────────────────────────── */}
            {field.fieldType === "number" && (
              <Input type="number" value={value} min={field.min} max={field.max} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder} required={field.isRequired} />
            )}

            {/* ── Currency / Price ─────────────────────────────────────── */}
            {field.fieldType === "currency" && (
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-border rounded-l-md bg-muted text-muted-foreground text-sm">$</span>
                <Input type="number" step="0.01" min={field.min} max={field.max} value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder="0.00" required={field.isRequired} className="rounded-l-none" />
              </div>
            )}

            {/* ── Slider ───────────────────────────────────────────────── */}
            {field.fieldType === "slider" && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  className="flex-1 accent-primary h-2 cursor-pointer"
                  min={field.min ?? 0}
                  max={field.max ?? 100}
                  step={field.step ?? 1}
                  value={value || (field.min ?? 0)}
                  onChange={e => onChange(field.fieldKey, Number(e.target.value))}
                />
                <span className="w-12 text-center text-sm font-mono border border-border rounded px-1 py-0.5 bg-muted">
                  {value || (field.min ?? 0)}
                </span>
              </div>
            )}

            {/* ── Star Rating ───────────────────────────────────────────── */}
            {field.fieldType === "rating" && (
              <div className="flex gap-1">
                {Array.from({ length: field.max ?? 5 }, (_, i) => i + 1).map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onChange(field.fieldKey, star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= (value || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
                {value > 0 && (
                  <button type="button" onClick={() => onChange(field.fieldKey, 0)} className="ml-2 text-xs text-muted-foreground hover:text-destructive">Clear</button>
                )}
              </div>
            )}

            {/* ── URL / Link ───────────────────────────────────────────── */}
            {field.fieldType === "url" && (
              <Input type="url" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "https://"} required={field.isRequired} dir="ltr" />
            )}

            {/* ── Email ────────────────────────────────────────────────── */}
            {field.fieldType === "email" && (
              <Input type="email" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "name@example.com"} required={field.isRequired} dir="ltr" />
            )}

            {/* ── Phone ────────────────────────────────────────────────── */}
            {field.fieldType === "phone" && (
              <Input type="tel" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "+92 300 0000000"} required={field.isRequired} dir="ltr" />
            )}

            {/* ── Date ─────────────────────────────────────────────────── */}
            {field.fieldType === "date" && (
              <Input type="date" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} required={field.isRequired} />
            )}

            {/* ── Date & Time ──────────────────────────────────────────── */}
            {field.fieldType === "datetime" && (
              <Input type="datetime-local" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} required={field.isRequired} />
            )}

            {/* ── Time ─────────────────────────────────────────────────── */}
            {field.fieldType === "time" && (
              <Input type="time" value={value} onChange={e => onChange(field.fieldKey, e.target.value)} required={field.isRequired} />
            )}

            {/* ── Color Picker ─────────────────────────────────────────── */}
            {field.fieldType === "color" && (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value || "#000000"}
                  onChange={e => onChange(field.fieldKey, e.target.value)}
                  className="w-10 h-10 rounded-md border border-border cursor-pointer p-0.5 bg-transparent"
                />
                <Input value={value || ""} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder="#000000" className="w-32 font-mono text-sm" maxLength={7} />
              </div>
            )}

            {/* ── Toggle (Yes/No) ──────────────────────────────────────── */}
            {field.fieldType === "toggle" && (
              <div className="flex items-center gap-2 h-10">
                <Switch checked={!!value} onCheckedChange={c => onChange(field.fieldKey, c)} />
                <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
              </div>
            )}

            {/* ── Dropdown Select ──────────────────────────────────────── */}
            {field.fieldType === "select" && field.options && (
              <Select value={value} onValueChange={val => onChange(field.fieldKey, val)}>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* ── Radio Buttons ────────────────────────────────────────── */}
            {field.fieldType === "radio" && field.options && (
              <div className="flex flex-wrap gap-3">
                {field.options.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name={field.fieldKey}
                      value={opt}
                      checked={value === opt}
                      onChange={() => onChange(field.fieldKey, opt)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* ── Checkbox Group (Multi) ───────────────────────────────── */}
            {field.fieldType === "checkbox-group" && field.options && (
              <div className="flex flex-wrap gap-3">
                {field.options.map(opt => {
                  const checked = Array.isArray(value) && value.includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={c => toggleCheckboxGroupOption(field.fieldKey, opt, !!c)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* ── Tags (Multi-value) ───────────────────────────────────── */}
            {field.fieldType === "tags" && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 min-h-9 p-2 border border-border rounded-md bg-background">
                  {(Array.isArray(value) ? value : []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(field.fieldKey, tag)} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInputs[field.fieldKey] ?? ""}
                    onChange={e => setTagInputs(prev => ({ ...prev, [field.fieldKey]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(field.fieldKey, tagInputs[field.fieldKey] ?? "");
                      }
                    }}
                    placeholder={field.placeholder || "Type and press Enter to add tag"}
                    className="h-8 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => addTag(field.fieldKey, tagInputs[field.fieldKey] ?? "")}>Add</Button>
                </div>
              </div>
            )}

            {/* ── Location / Address ───────────────────────────────────── */}
            {field.fieldType === "location" && (
              <div className="space-y-2">
                <Input value={typeof value === "object" ? value?.address ?? "" : value} onChange={e => onChange(field.fieldKey, { ...(typeof value === "object" ? value : {}), address: e.target.value })} placeholder="Street address" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={typeof value === "object" ? value?.city ?? "" : ""} onChange={e => onChange(field.fieldKey, { ...(typeof value === "object" ? value : {}), city: e.target.value })} placeholder="City" />
                  <Input value={typeof value === "object" ? value?.country ?? "" : ""} onChange={e => onChange(field.fieldKey, { ...(typeof value === "object" ? value : {}), country: e.target.value })} placeholder="Country" />
                </div>
              </div>
            )}

            {/* ── JSON / Key-Value Map ─────────────────────────────────── */}
            {field.fieldType === "json" && (
              <Textarea
                value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                rows={field.rows ?? 5}
                onChange={e => {
                  try {
                    onChange(field.fieldKey, JSON.parse(e.target.value));
                  } catch {
                    onChange(field.fieldKey, e.target.value);
                  }
                }}
                placeholder='{ "key": "value" }'
                className="font-mono text-xs"
                required={field.isRequired}
              />
            )}

            {/* ── File / Image Upload ──────────────────────────────────── */}
            {field.fieldType === "file" && (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Input value={value} onChange={e => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder || "URL or upload…"} className="flex-1" />
                  <Button type="button" variant="outline" className="relative shrink-0">
                    {isUploading === field.fieldKey ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><UploadCloud className="w-4 h-4 mr-2" />Upload</>
                    )}
                    <input
                      type="file"
                      accept={field.accept}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => handleFileUpload(e, field.fieldKey, field.accept)}
                    />
                  </Button>
                </div>
                {value && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value) && (
                  <img src={value} alt="preview" className="h-24 w-auto rounded-lg border border-border object-cover" />
                )}
              </div>
            )}

            {/* ── Help text ────────────────────────────────────────────── */}
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
