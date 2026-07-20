"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageBanner } from "./PageBanner";
import { ShareSidebar } from "@/components/shared/ShareSidebar";
import { useSettings } from "@/hooks/use-settings";
import { BackToTop } from "@/components/ui/back-to-top";
import { resolveMediaUrl } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isSiteManager = pathname?.startsWith("/sitemanager");
  const isHome = pathname === "/";
  const isOrgOrIdeology =
    (pathname?.startsWith("/organization/") && pathname !== "/organization") ||
    pathname === "/the-founder" ||
    pathname === "/the-ameer" ||
    pathname === "/background" ||
    pathname === "/mission-statement" ||
    pathname === "/our-ideology";

  // Shared settings — SWR-deduped across Header / Footer / MainLayout / PageBanner.
  const { settings, isLoading } = useSettings();

  if (!isLoading && settings?.maintenance_mode === "true" && !isSiteManager) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center relative overflow-hidden">
        {/* Decorative background elements matching the admin layout */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none bg-[#0d5844]/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none bg-slate-300/40" />

        <div className="max-w-md space-y-6 relative z-10 bg-card p-10 rounded-3xl shadow-xl border border-border">
          {settings.login_logo ? (
            <img
              src={resolveMediaUrl(settings.login_logo)}
              alt="Logo"
              className="w-24 h-24 mx-auto mb-6 object-contain"
            />
          ) : (
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-4xl text-primary font-bold">ت</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-nastaleeq text-[#0d5844]">Under Maintenance</h1>
          <p className="text-muted-foreground text-base">We are currently performing scheduled maintenance on the website. Please check back shortly. Jazakallah Khair for your patience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* BackToTop is handled globally in MainLayout */}
      {!isSiteManager && <BackToTop />}
      {!isSiteManager && <Header />}

      {!isSiteManager && !isHome && !isOrgOrIdeology && (
        <PageBanner settings={settings} />
      )}

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      {!isSiteManager && <Footer />}
      {!isSiteManager && <ShareSidebar />}
    </div>
  );
}
