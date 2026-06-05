import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Foundation | Tanzeem-e-Islami" };

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Foundation</h1>
          <p>
            The foundation of Tanzeem-e-Islami rests upon the firm belief that Islam is a complete code of life
            (Deen) and that the Quran and Sunnah provide comprehensive guidance for humanity in all times and
            places. The movement is built on the following foundational pillars:
          </p>

          <h2>I. The Quran as the Primary Source</h2>
          <p>
            The Holy Quran is the ultimate source of guidance for Tanzeem-e-Islami. We believe that the Quran
            is not just a book of worship and recitation but a complete constitution for human life.
          </p>

          <h2>II. The Sunnah as the Practical Model</h2>
          <p>
            The life of Prophet Muhammad (SAW) provides the perfect practical model for implementing Quranic
            teachings. His Sunnah demonstrates how the principles of the Quran can be applied in real-life situations.
          </p>

          <h2>III. The Islamic Concept of Tawheed</h2>
          <p>
            The concept of Tawheed (Oneness of Allah) is the central organizing principle of our worldview.
            It implies that Allah alone is the Sovereign and Law-Giver, all authority belongs to Him alone, and
            human life must be organized according to His commandments.
          </p>

          <h2>IV. The Comprehensive Nature of Deen</h2>
          <p>
            Islam is not a religion in the Western sense &mdash; a set of private beliefs and rituals. It is a
            complete Deen encompassing faith, worship, ethics, law, social relations, economics, politics, and culture.
          </p>

          <h2>V. The Concept of Ummah</h2>
          <p>
            Muslims are not just a religious community but a distinct nation (Ummah) with a unique identity,
            mission, and destiny. The Ummah has been entrusted with the responsibility of being witnesses over humanity.
          </p>

          <h2>VI. The Principle of Shura (Consultation)</h2>
          <p>
            Decision-making in Tanzeem-e-Islami is based on the principle of Shura (mutual consultation).
            Leadership is accountable to the members, and important decisions are made collectively after
            thorough discussion and deliberation.
          </p>

          <h2>VII. Gradual and Systematic Change</h2>
          <p>
            Islamic revival requires patient, systematic, and sustained effort through education, training, and
            institution-building rather than through sudden revolution or political opportunism.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Meet Our Founder"
        subheading="Learn about Dr. Israr Ahmed, the visionary founder of Tanzeem-e-Islami."
        buttonLabel="The Founder"
        buttonUrl="/organization/the-founder"
      />
    </main>
  );
}
