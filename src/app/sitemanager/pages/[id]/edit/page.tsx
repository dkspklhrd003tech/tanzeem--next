"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import { PageForm, type PageRecord } from "@/components/sitemanager/PageForm";
import OrganizationPageEditor from "../../organization/page";

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<PageRecord | null>(null);
  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id === "organization" || id === "0f14e867-3679-4e52-9ba3-0441e7f22609") return;
    
    Promise.all([
      fetch(`/api/sitemanager/pages/${id}`),
      fetch("/api/sitemanager/pages?limit=100&sort=az"),
    ]).then(async ([pageRes, listRes]) => {
      if (!pageRes.ok) { setNotFound(true); return; }
      const { page } = await pageRes.json();
      setPage(page);
      if (listRes.ok) {
        const { pages } = await listRes.json();
        setParentPages((pages ?? []).map((p: any) => ({ id: p.id, title: p.title })));
      }
    }).catch(() => setNotFound(true));
  }, [id]);

  if (id === "organization" || id === "0f14e867-3679-4e52-9ba3-0441e7f22609") {
    return <OrganizationPageEditor />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground mt-1">This page may have been deleted.</p>
        <a href="/sitemanager/pages" className="mt-4 text-sm text-primary hover:underline">← Back to pages</a>
      </div>
    );
  }

  if (!page) return <PageSpinner />;

  return <PageForm mode="edit" initialData={page} parentPages={parentPages} />;
}
