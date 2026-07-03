"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFieldDef } from "./CustomFieldBuilder";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CustomFieldRendererProps {
  entityType: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function CustomFieldRenderer({ entityType, values, onChange }: CustomFieldRendererProps) {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/custom-fields?entityType=${entityType}`);
        const data = await res.json();
        if (data.fields) {
          setFields(data.fields.filter((f: any) => f.isActive));
        }
      } catch (err) {
        console.error("Failed to load custom fields", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFields();
  }, [entityType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
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
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setIsUploading(null);
    }
  };

  if (isLoading) {
    return <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border/50 mt-4">
      {fields.map((field) => {
        const value = values?.[field.fieldKey] ?? "";

        return (
          <div key={field.id} className="grid gap-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            
            {field.fieldType === "text" && (
              <Input
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                placeholder={field.placeholder || ""}
                required={field.isRequired}
              />
            )}

            {field.fieldType === "textarea" && (
              <Textarea
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                placeholder={field.placeholder || ""}
                required={field.isRequired}
              />
            )}

            {field.fieldType === "number" && (
              <Input
                type="number"
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                placeholder={field.placeholder || ""}
                required={field.isRequired}
              />
            )}

            {field.fieldType === "url" && (
              <Input
                type="url"
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                placeholder={field.placeholder || "https://..."}
                required={field.isRequired}
                dir="ltr"
              />
            )}

            {field.fieldType === "date" && (
              <Input
                type="date"
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                required={field.isRequired}
              />
            )}

            {field.fieldType === "toggle" && (
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={!!value}
                  onCheckedChange={(checked) => onChange(field.fieldKey, checked)}
                />
                <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
              </div>
            )}

            {field.fieldType === "select" && field.options && (
              <Select value={value} onValueChange={(val) => onChange(field.fieldKey, val)}>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.fieldType === "file" && (
              <div className="flex gap-2 items-center">
                <Input
                  value={value}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  placeholder={field.placeholder || "URL or upload..."}
                  className="flex-1"
                />
                <Button type="button" variant="outline" className="relative shrink-0">
                  {isUploading === field.fieldKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileUpload(e, field.fieldKey)}
                  />
                </Button>
              </div>
            )}

            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
