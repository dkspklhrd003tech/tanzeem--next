import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Hikmat-e-Quran Magazine | Tanzeem-e-Islami" };

export default function HikmatEQuranPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Hikmat-e-Quran</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            A specialized publication focusing on the intellectual and spiritual dimensions of the Quran.
          </p>

          <h2>About Hikmat-e-Quran</h2>
          <p>
            Hikmat-e-Quran is a quarterly magazine published by Tanzeem-e-Islami that focuses specifically
            on the intellectual and spiritual dimensions of the Quran. The magazine aims to explore the
            timeless wisdom (hikmah) contained in the Quran and demonstrate its relevance to contemporary challenges.
          </p>
          <p>
            Each issue features in-depth articles on Quranic themes, Tafseer of selected chapters and verses,
            and reflections on how Quranic principles can guide Muslims in various spheres of life.
          </p>

          <h2>Recent Issues</h2>
          <p>
            Browse recent and past issues of Hikmat-e-Quran in our <a href="/resources/magazines/hikmat-e-quran">magazine archive</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Explore Nida-e-Khilafat"
        subheading="Another important publication from Tanzeem-e-Islami."
        buttonLabel="Nida-e-Khilafat"
        buttonUrl="/nida-e-khilafat"
      />
    </main>
  );
}
