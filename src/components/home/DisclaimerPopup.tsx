"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface DisclaimerPopupProps {
  enabled: boolean;
  imageUrl: string;
}

export function DisclaimerPopup({ enabled, imageUrl }: DisclaimerPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !imageUrl) return;

    const isClosed = sessionStorage.getItem("disclaimerClosed");
    if (!isClosed) {
      setIsVisible(true);
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      // Increment counter in DB
      fetch("/api/settings/disclaimer-view", { method: "POST" }).catch(console.error);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [enabled, imageUrl]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("disclaimerClosed", "true");
    document.body.style.overflow = "";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-[95dvw] h-full max-h-[95dvh] flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          aria-label="Close disclaimer"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Image Container */}
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Disclaimer"
            fill
            className="object-contain"
            sizes="95vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
