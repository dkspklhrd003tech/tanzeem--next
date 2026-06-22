import { HubLanding } from "@/components/shared/HubLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources | Tanzeem-e-Islami",
  description: "Access audios, videos, books, magazines, press releases, and official publications from Tanzeem-e-Islami.",
  openGraph: {
    title: "Resources | Tanzeem-e-Islami",
    description: "Access audios, videos, books, magazines, press releases, and official publications from Tanzeem-e-Islami.",
  },
};

const cards = [
  { title: "Audios", href: "/resources/audios", description: "Lectures by speaker, category, and audio books" },
  { title: "Videos", href: "/resources/videos", description: "Video lectures and series" },
  { title: "Books", href: "/resources/books", description: "Islamic books and publications" },
  { title: "Magazines", href: "/resources/magazines", description: "Meesaq, Hikmat-e-Quran, Nida-e-Khilafat" },
  { title: "Press Releases", href: "/resources/press-releases", description: "Official announcements" },
  { title: "Social Media", href: "/resources/social-media", description: "Follow Tanzeem online" },
  { title: "Khitab-e-Jum'ah", href: "/resources/khitab-e-jumah", description: "Friday sermon audio archive" },
  { title: "FAQ", href: "/faqs", description: "Frequently asked questions" },
];

export default function ResourcesPage() {
  return (
    <HubLanding
      title="Resources"
      subtitle="Access audios, videos, books, magazines, and official publications."
      cards={cards}
    />
  );
}
