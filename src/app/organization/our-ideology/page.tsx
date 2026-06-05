import { HubLanding } from "@/components/shared/HubLanding";

export const metadata = { title: "Our Ideology | Tanzeem-e-Islami" };

const cards = [
  { title: "Basic Belief", href: "/organization/our-ideology/basic-belief", description: "Fundamental Islamic beliefs and principles" },
  { title: "Our Obligations", href: "/organization/our-ideology/our-obligations", description: "Our duties and responsibilities as Muslims" },
  { title: "Methodology", href: "/organization/our-ideology/methodology", description: "Our approach and method of work" },
  { title: "Foundation", href: "/organization/our-ideology/foundation", description: "The foundational principles of our movement" },
];

export default function IdeologyHubPage() {
  return (
    <HubLanding
      title="Our Ideology"
      subtitle="Explore the beliefs, obligations, methodology, and foundation of Tanzeem-e-Islami."
      cards={cards}
    />
  );
}
