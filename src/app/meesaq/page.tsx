import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Meesaq Magazine | Tanzeem-e-Islami" };

export default function MeesaqPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Meesaq</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Monthly magazine of Tanzeem-e-Islami covering Islamic thought, contemporary issues, and organizational news.
          </p>

          <h2>About Meesaq</h2>
          <p>
            Meesaq is a monthly Urdu magazine published by Tanzeem-e-Islami. The magazine covers a wide range
            of topics including Tafseer-e-Quran, Hadith studies, Islamic history, contemporary issues from an
            Islamic perspective, and updates on Tanzeem-e-Islami&apos;s activities.
          </p>
          <p>
            The magazine features contributions from scholars, intellectuals, and writers who share a commitment
            to Islamic revival. Regular sections include Quranic reflections, analysis of current events,
            book reviews, and reader correspondence.
          </p>

          <h2>Recent Issues</h2>
          <p>
            Browse recent and past issues of Meesaq in our <a href="/resources/magazines/meesaq">magazine archive</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Explore Hikmat-e-Quran"
        subheading="Another quality publication from Tanzeem-e-Islami."
        buttonLabel="Hikmat-e-Quran"
        buttonUrl="/hikmat-e-quran"
      />
    </main>
  );
}
