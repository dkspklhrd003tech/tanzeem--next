import { HubLanding } from "@/components/shared/HubLanding";
import { ContactForm } from "@/components/shared/ContactForm";

export const metadata = { title: "Join Tanzeem | Tanzeem-e-Islami" };

export default function JoinPage() {
  return (
    <>
      <HubLanding
        title="Join Tanzeem"
        subtitle="Become part of the movement to establish Deen through knowledge and collective action."
        cards={[
          {
            title: "Membership Application",
            href: "https://app.dhtr.org/contactus",
            external: true,
            description: "Submit your membership inquiry through the official DHTR portal.",
          },
        ]}
      />
      <section className="container mx-auto px-4 pb-16 max-w-xl">
        <h2 className="font-amiri text-xl font-bold text-primary mb-4">Or contact us directly</h2>
        <ContactForm />
      </section>
    </>
  );
}
