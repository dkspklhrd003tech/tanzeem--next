"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageBanner } from "./PageBanner";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isSiteManager = pathname?.startsWith("/sitemanager");
  const isHome = pathname === "/";
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const flatSettings: Record<string, string> = {};
          // Flatten settings from all groups, prioritizing 'global_banner'
          if (data.settings.global_banner) {
            Object.assign(flatSettings, data.settings.global_banner);
          }
          setSettings(flatSettings);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    if (!isSiteManager && !isHome) {
      fetchSettings();
    }
  }, [pathname, isSiteManager, isHome]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isSiteManager && <Header />}
      
      {!isSiteManager && !isHome && (
        <PageBanner settings={settings} />
      )}

      <main className="flex-1">
        {children}
      </main>
      
      {!isSiteManager && <Footer />}
    </div>
  );
}
