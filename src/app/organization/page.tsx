import { HubLanding } from "@/components/shared/HubLanding";

export const metadata = { title: "Organization | Tanzeem-e-Islami" };

const cards = [
  { title: "Background", href: "/organization/background", description: "History and founding of Tanzeem-e-Islami" },
  { title: "Mission Statement", href: "/organization/mission-statement", description: "Our mission and purpose" },
  { title: "Our Ideology", href: "/organization/our-ideology", description: "Beliefs, obligations, methodology, and foundation" },
  { title: "The Founder", href: "/organization/the-founder", description: "Dr. Israr Ahmed (1932–2010)" },
  { title: "The Ameer", href: "/organization/the-ameer", description: "Shujauddin Sheikh — current leadership" },
];

export default function OrganizationPage() {
  return (
    <HubLanding
      title="Organization"
      subtitle="Learn about Tanzeem-e-Islami's history, mission, ideology, and leadership."
      cards={cards}
    />
  );
}
