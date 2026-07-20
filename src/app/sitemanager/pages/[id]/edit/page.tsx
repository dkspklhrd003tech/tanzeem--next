"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import { PageForm, type PageRecord } from "@/components/sitemanager/PageForm";
import dynamic from "next/dynamic";

const OrganizationPageEditor = dynamic(() => import("../../organization/page"), { loading: () => <PageSpinner />, ssr: false });
const FaqPageEditor = dynamic(() => import("@/components/admin/FaqPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const PressReleasesPageEditor = dynamic(() => import("@/components/admin/PressReleasesPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const AudioBooksPageEditor = dynamic(() => import("@/components/admin/AudioBooksPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const SocialMediaPageEditor = dynamic(() => import("@/components/admin/SocialMediaPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const BooksByCategoryPageEditor = dynamic(() => import("@/components/admin/BooksByCategoryPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const ContactPageEditor = dynamic(() => import("@/components/admin/ContactPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const HomepageManager = dynamic(() => import("@/components/admin/HomepageManager").then(mod => mod.HomepageManager), { loading: () => <PageSpinner />, ssr: false });
const MagazineLinksEditor = dynamic(() => import("@/components/admin/MagazineLinksEditor"), { loading: () => <PageSpinner />, ssr: false });
const VideosPageEditor = dynamic(() => import("@/components/admin/VideosPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const MediaLibraryEditor = dynamic(() => import("@/components/admin/MediaLibraryEditor"), { loading: () => <PageSpinner />, ssr: false });
const AudiosPageEditor = dynamic(() => import("@/components/admin/AudiosPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const AudioSpeakersPageEditor = dynamic(() => import("@/components/admin/AudioSpeakersPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const VideoSpeakersPageEditor = dynamic(() => import("@/components/admin/VideoSpeakersPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const HistoryPageEditor = dynamic(() => import("@/components/admin/HistoryPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const CampaignsPageEditor = dynamic(() => import("@/components/admin/CampaignsPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const EventsPageEditor = dynamic(() => import("@/components/admin/EventsPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const ServicesPageEditor = dynamic(() => import("@/components/admin/ServicesPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const SermonsPageEditor = dynamic(() => import("@/components/admin/SermonsPageEditor"), { loading: () => <PageSpinner />, ssr: false });
const KhitabAudiosPageEditor = dynamic(() => import("@/components/admin/KhitabAudiosPageEditor"), { loading: () => <PageSpinner />, ssr: false });

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<PageRecord | null>(null);
  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id === "organization") return;

    // Fetch the page data immediately and render
    fetch(`/api/sitemanager/pages/${id}`)
      .then(async (pageRes) => {
        if (!pageRes.ok) {
          const hardcodedIds = ["services", "campaigns", "events", "sermons", "faqs", "contact", "history-of-tanzeem-e-islami"];
          if (hardcodedIds.includes(id)) {
            setPage({
              id,
              slug: id,
              title: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              content: "",
              excerpt: "",
              isPublished: true,
              metaTitle: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              metaDescription: "",
            } as any);
          } else {
            setNotFound(true);
          }
          return;
        }
        const { page } = await pageRes.json();
        setPage(page);
      })
      .catch(() => setNotFound(true));

    // Fetch parent pages in the background (used only by PageForm template settings)
    fetch("/api/sitemanager/pages?limit=100&sort=az")
      .then(async (listRes) => {
        if (listRes.ok) {
          const { pages } = await listRes.json();
          setParentPages((pages ?? []).map((p: any) => ({ id: p.id, title: p.title })));
        }
      })
      .catch(() => {});
  }, [id]);

  if (id === "organization") {
    return <OrganizationPageEditor />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
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

  if (page.slug === "home" || page.id === "e1f45ef2-66e6-47e7-999a-e4bc70397ed6") {
    return <HomepageManager />;
  }

  if (page.slug === "press-releases" || page.id === "36fcba66-d2fd-47e6-b36f-ec559c43f02d") {
    return <PressReleasesPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "audio-books" || page.id === "76715fe2-6301-4b17-8afb-aab3505242f7") {
    return <AudioBooksPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "social-media" || page.id === "6eded7db-bc24-46aa-981f-6d37528dd98f") {
    return <SocialMediaPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "books-by-category") {
    return <BooksByCategoryPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "contact" || page.id === "426e2660-c453-4763-a0f4-35395bf8a10f") {
    return <ContactPageEditor pageId={page.id} title={page.title} />;
  }

  if (page.id === "56f118be-bcad-42a0-a60a-37300adc8a39" || page.slug === "audios-by-category") {
    return <AudiosPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.id === "e34f44a9-bd26-4433-a962-250991321181" || page.slug === "videos-by-category") {
    return <MediaLibraryEditor pageId={page.id} initialPageData={page} mediaType="video" />;
  }

  if (page.slug === "videos") {
    return <VideosPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.id === "b2a4338c-df58-407a-9f94-a9b338767a27" || page.slug === "audios-by-speaker") {
    return <AudioSpeakersPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.id === "39140524-7122-407b-b32f-3570f6f52ee2" || page.slug === "videos-by-speakers") {
    return <VideoSpeakersPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.id === "07d5dfdd-1c18-4de6-80b5-54ea7f0570bd" || page.slug === "history-of-tanzeem-e-islami") {
    return <HistoryPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "campaigns") {
    return <CampaignsPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "events") {
    return <EventsPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "services") {
    return <ServicesPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (
    page.slug === "khitab-e-jumah" ||
    page.slug === "khitab-e-jumah-audios" ||
    page.slug === "khitab-e-jumah-audio" ||
    page.slug.includes("khitab")
  ) {
    return <KhitabAudiosPageEditor pageId={page.id} initialPageData={page} />;
  }

  if (page.slug === "friday-sermons" || page.slug === "sermons") {
    return <SermonsPageEditor pageId={page.id} initialPageData={page} />;
  }

  const magazineIds = [
    "31c629e7-cad9-41e8-8c3f-ca442337925c", // Meesaq
    "94a5dcc9-70c6-46aa-88f0-3334f1716b36", // Hikmat e Quran
    "74417c7d-4664-479c-890c-07073e9f8510", // Nida-e-Khilafat
    "a1bc3371-0e89-4662-8440-3794ebccc9f3", // Perspective
  ];

  if (magazineIds.includes(page.id) || ["meesaq", "hikmat-e-quran", "nida-e-khilafat", "perspective"].includes(page.slug)) {
    return <MagazineLinksEditor pageId={page.id} title={page.title} />;
  }

  return <PageForm mode="edit" initialData={page} parentPages={parentPages} />;
}
