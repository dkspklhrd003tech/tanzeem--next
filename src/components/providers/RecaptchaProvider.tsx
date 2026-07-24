"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const FORM_ROUTES = ["/contact", "/join", "/sitemanager/login", "/admin"];

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const pathname = usePathname();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Automatically load on pages that contain forms
    if (FORM_ROUTES.some((route) => pathname.startsWith(route))) {
      setShouldLoad(true);
      return;
    }

    // On other pages (like Homepage), delay loading reCAPTCHA until user interacts (scroll/click/keydown)
    const handleInteraction = () => {
      setShouldLoad(true);
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });

    return cleanupListeners;
  }, [pathname]);

  if (!siteKey || !shouldLoad) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
      container={{
        parameters: {
          badge: "bottomright",
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
