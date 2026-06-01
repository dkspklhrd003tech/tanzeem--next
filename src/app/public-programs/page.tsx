import { HubLanding } from "@/components/shared/HubLanding";

export const metadata = { title: "Public Programs | Tanzeem-e-Islami" };

const cards = [
  {
    title: "Quranic Circles",
    href: "/public-programs/quranic-circles",
    description: "Weekly study circles across Pakistan",
  },
  {
    title: "Khitabat-e-Jummah Addresses",
    href: "/public-programs/khitabat-e-jummah",
    description: "Archived Friday addresses",
  },
];

export default function PublicProgramsPage() {
  return (
    <HubLanding
      title="Public Programs"
      subtitle="Community programs and weekly gatherings."
      cards={cards}
    />
  );
}
