"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import { PageForm, type PageRecord } from "@/components/sitemanager/PageForm";
import OrganizationPageEditor from "../../organization/page";
import FaqPageEditor from "@/components/admin/FaqPageEditor";
import PressReleasesPageEditor from "@/components/admin/PressReleasesPageEditor";
import SocialMediaPageEditor from "@/components/admin/SocialMediaPageEditor";

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<PageRecord | null>(null);
  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id === "organization") return;

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

  if (id === "organization") {
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

  if (page.slug === "faqs" || page.slug === "faq" || page.id === "9f332f17-55ce-4c3a-a25d-8156d26da541") {
    return <FaqPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "press-releases" || page.id === "36fcba66-d2fd-47e6-b36f-ec559c43f02d") {
    return <PressReleasesPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "social-media" || page.id === "6eded7db-bc24-46aa-981f-6d37528dd98f") {
    return <SocialMediaPageEditor pageId={page.id} initialPageData={page} />;
  }

  return <PageForm mode="edit" initialData={page} parentPages={parentPages} />;
}
