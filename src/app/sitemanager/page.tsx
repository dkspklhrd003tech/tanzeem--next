"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { AdminPages } from "@/components/admin";

function SiteManagerRootContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const section = searchParams.get("section");

  useEffect(() => {
    // If no section parameter is specified, default to the dashboard sub-route
    if (!section || section === "dashboard") {
      router.replace("/sitemanager/dashboard");
    }
  }, [section, router]);

  if (!section || section === "dashboard") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <AdminPages section={section} />;
}

export default function SiteManagerRoot() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <SiteManagerRootContent />
    </Suspense>
  );
}
