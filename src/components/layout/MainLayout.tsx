"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isSiteManager = pathname?.startsWith("/sitemanager");

  return (
    <div className="min-h-screen flex flex-col">
      {!isSiteManager && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isSiteManager && <Footer />}
    </div>
  );
}
