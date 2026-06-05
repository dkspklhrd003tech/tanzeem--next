import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Nida-e-Khilafat Magazine | Tanzeem-e-Islami" };

export default function NidaEKhilafatPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Nida-e-Khilafat</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            A magazine dedicated to the revival of the Islamic Caliphate and the unity of the Muslim Ummah.
          </p>

          <h2>About Nida-e-Khilafat</h2>
          <p>
            Nida-e-Khilafat is a magazine published by Tanzeem-e-Islami that focuses on the concept, history,
            and contemporary relevance of the Islamic Caliphate (Khilafah). The magazine explores the political
            dimensions of Islam and the obligation of Muslims to work for the establishment of the Islamic
            system of governance.
          </p>
          <p>
            The magazine features articles on Islamic political theory, analysis of the current political
            situation of the Muslim world, and discussions on strategies for the revival of the Khilafah.
          </p>

          <h2>Recent Issues</h2>
          <p>
            Browse recent and past issues of Nida-e-Khilafat in our <a href="/resources/magazines/nida-e-khilafat">magazine archive</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Read Perspective Magazine"
        subheading="Explore Tanzeem-e-Islami&apos;s English-language publication."
        buttonLabel="Perspective"
        buttonUrl="/perspective"
      />
    </main>
  );
}
