import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Ruju Ilal Quran | Tanzeem-e-Islami" };

export default function RujuIlalQuranPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Ruju Ilal Quran</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Return to the Quran — a movement to revive the Quranic spirit and implement its teachings in individual and collective life.
          </p>

          <h2>The Call to Return to the Quran</h2>
          <p>
            Ruju Ilal Quran (Return to the Quran) is the foundational call of Tanzeem-e-Islami. It is an invitation to all Muslims to turn back to the Quran as the ultimate source of guidance, legislation, and spiritual inspiration. The movement emphasizes that the revival of the Ummah can only occur through a sincere and comprehensive return to the Quranic teachings.
          </p>

          <h2>Core Principles</h2>
          <ul>
            <li>The Quran is the primary source of guidance for all aspects of life — spiritual, social, political, and economic</li>
            <li>Understanding the Quran requires both intellectual study and practical application</li>
            <li>Every Muslim has the right and responsibility to access the Quran directly</li>
            <li>The Quranic message must be understood in its historical context and applied to contemporary challenges</li>
            <li>Systematic study of the Quran leads to Iman (faith) and action</li>
          </ul>

          <h2>Our Approach</h2>
          <p>
            Tanzeem-e-Islami&apos;s educational programs are designed around the Ruju Ilal Quran framework. Through Dars-e-Quran, Bayan-ul-Quran, and other initiatives, we aim to make Quranic education accessible to Muslims of all backgrounds. Our approach emphasizes understanding the Quran&apos;s message, reflecting on its meanings, and implementing its teachings in daily life.
          </p>

          <h2>Key Objectives</h2>
          <ul>
            <li>To create a Quran-centric worldview among Muslims</li>
            <li>To revive the tradition of Quranic scholarship and reflection</li>
            <li>To build a community that lives by Quranic values</li>
            <li>To establish educational institutions that prioritize Quranic studies</li>
            <li>To develop a generation committed to the message of the Quran</li>
          </ul>
        </article>
      </div>
      <CTABanner
        heading="Start Your Quranic Journey"
        subheading="Join our Dars-e-Quran program to study the Quran systematically."
        buttonLabel="Join Dars-e-Quran"
        buttonUrl="/darse-quran"
      />
    </main>
  );
}
