import { HubLanding } from "@/components/shared/HubLanding";

export const metadata = { title: "Resources | Tanzeem-e-Islami" };

const cards = [
  { title: "Audios", href: "/resources/audios", description: "Lectures by speaker, category, and audio books" },
  { title: "Videos", href: "/resources/videos", description: "Video lectures and series" },
  { title: "Books", href: "/resources/books", description: "Islamic books and publications" },
  { title: "Magazines", href: "/resources/magazines", description: "Meesaq, Hikmat-e-Quran, Nida-e-Khilafat" },
  { title: "Press Releases", href: "/resources/press-releases", description: "Official announcements" },
  { title: "Social Media", href: "/resources/social-media", description: "Follow Tanzeem online" },
  { title: "Khitab-e-Jum'ah", href: "/resources/khitab-e-jumah", description: "Friday sermon audio archive" },
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
