import { Suspense } from "react";
import { RedirectsClient } from "./RedirectsClient";

export const dynamic = "force-dynamic";

export default async function RedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialTab = resolvedParams?.tab === "404" ? "404" : "redirects";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <RedirectsClient initialTab={initialTab} />
    </Suspense>
  );
}
