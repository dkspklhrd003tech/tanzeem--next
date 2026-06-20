"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageBanner } from "./PageBanner";
import { PersistentAudioPlayer } from "@/components/audio/PersistentAudioPlayer";
import { useSettings } from "@/hooks/use-settings";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isSiteManager = pathname?.startsWith("/sitemanager");
  const isHome = pathname === "/";
  const isOrgOrIdeology =
    pathname?.startsWith("/organization") ||
    pathname?.startsWith("/our-ideology") ||
    pathname === "/background" ||
    pathname === "/mission-statement";

  // Shared settings — SWR-deduped across Header / Footer / MainLayout / PageBanner.
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col">
      {!isSiteManager && <Header />}

      {!isSiteManager && !isHome && !isOrgOrIdeology && (
        <PageBanner settings={settings} />
      )}

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      {!isSiteManager && <Footer />}
      {!isSiteManager && <PersistentAudioPlayer />}
    </div>
  );
}
