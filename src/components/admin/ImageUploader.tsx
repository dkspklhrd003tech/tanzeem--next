"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Check, Image as ImageIcon, Loader2, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string, alt?: string) => void;
  altValue?: string;
  onAltChange?: (alt: string) => void;
  aspectRatio?: number;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  altValue,
  onAltChange,
  aspectRatio = 16 / 9,
  label,
  className,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Use controlled altValue (via onAltChange) or local state
  const isControlled = typeof onAltChange === "function";
  const [localAltValue, setLocalAltValue] = useState(altValue ?? "");
  const [showAltInput, setShowAltInput] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Auto-fill alt text
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanedName = baseName.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      
      setLocalAltValue(cleanedName);
      setShowAltInput(true);
      if (isControlled) {
        onAltChange(cleanedName);
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const formData = new FormData();
      formData.append("file", croppedBlob, "upload.jpg");
      formData.append("type", "uploads");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onChange(data.url, isControlled ? (altValue ?? "") : localAltValue);
      setIsCropping(false);
      setImage(null);

      toast({
        title: "Success",
        description: "Image uploaded and cropped successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAltChange = (val: string) => {
    setLocalAltValue(val);
    if (onAltChange) onAltChange(val);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      <div
        className={cn(
          "relative border-2 border-dashed border-border rounded-xl overflow-hidden group transition-all",
          !value && "hover:border-primary/50 cursor-pointer p-8 flex flex-col items-center justify-center",
          value && "aspect-video"
        )}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt={isControlled ? (altValue ?? "") : localAltValue} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Change Image
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("", "");
                }}
              >
                Remove
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-foreground-muted mt-1">WebP, PNG & SVG (max. 50KB)</p>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="alt-text" className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Alternative Text</Label>
          </div>
          <Input
            id="alt-text"
            placeholder="Describe this image for accessibility..."
            value={isControlled ? (altValue ?? "") : localAltValue}
            onChange={(e) => handleAltChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      )}

      {/* Cropping Modal */}
      <Dialog open={isCropping} onOpenChange={(open) => !open && !isUploading && setIsCropping(false)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="h-5 w-5 text-primary" />
              Crop Image
            </DialogTitle>
            <DialogDescription className="sr-only">
              Adjust the image crop before uploading.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[400px] w-full bg-muted mt-4">
            {image && (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Zoom Level</Label>
                <span className="text-xs font-bold text-primary">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([val]) => setZoom(val)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setIsCropping(false)}
                disabled={isUploading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-[#0d5844] hover:bg-[#0a4636] text-white rounded-xl px-8"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save & Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
