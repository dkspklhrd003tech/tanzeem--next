"use client";

import { useEffect, useState } from "react";
import { PageForm } from "@/components/sitemanager/PageForm";

export default function NewPagePage() {
  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/sitemanager/pages?limit=100&sort=az")
      .then(r => r.ok ? r.json() : null)
      .then(d => setParentPages((d?.pages ?? []).map((p: any) => ({ id: p.id, title: p.title }))))
      .catch(() => {});
  }, []);

  return <PageForm mode="create" parentPages={parentPages} />;
}
