import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "History of Tanzeem-e-Islami | Tanzeem-e-Islami" };

export default function HistoryOfTanzeemPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>History of Tanzeem-e-Islami</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            The journey of Tanzeem-e-Islami from its founding to the present day.
          </p>

          <h2>Founding and Early Years</h2>
          <p>
            Tanzeem-e-Islami was founded in 1975 by Dr. Israr Ahmed (1932-2010), a renowned Islamic scholar,
            thinker, and orator. Dr. Israr Ahmed envisioned an Islamic revival movement that would work
            systematically to re-establish the Khilafah (Islamic Caliphate) by following the methodology of
            Prophet Muhammad (SAWS).
          </p>
          <p>
            The movement emerged from Dr. Israr Ahmed&apos;s deep conviction that the revival of Islam required
            not just individual piety but a comprehensive, organized effort to implement Islamic teachings
            in all spheres of life — social, cultural, political, and economic.
          </p>

          <h2>The Vision</h2>
          <p>
            Dr. Israr Ahmed&apos;s vision was inspired by the poetry and philosophy of Allama Muhammad Iqbal,
            who had called for a revival of Islamic dynamism and the establishment of a just social order
            based on Quranic principles. The movement&apos;s foundational call is &quot;Ruju Ilal Quran&quot; (Return to
            the Quran), emphasizing the need to make the Quran the central guide for all aspects of life.
          </p>

          <h2>Key Milestones</h2>
          <ul>
            <li><strong>1975:</strong> Founding of Tanzeem-e-Islami by Dr. Israr Ahmed</li>
            <li><strong>1980s:</strong> Expansion of Dars-e-Quran programs across Pakistan</li>
            <li><strong>1990s:</strong> Establishment of Quran Academies and educational institutions</li>
            <li><strong>2000s:</strong> Launch of Bayan-ul-Quran TV program reaching millions worldwide</li>
            <li><strong>2010:</strong> Passing of Dr. Israr Ahmed; continued leadership under Shujauddin Sheikh</li>
            <li><strong>2010-present:</strong> Digital expansion through online platforms and social media</li>
          </ul>

          <h2>Current Leadership</h2>
          <p>
            Since 2010, Tanzeem-e-Islami has been led by Mohtaram Shujauddin Sheikh, who continues to build
            upon Dr. Israr Ahmed&apos;s legacy. Under his leadership, the movement has expanded its digital
            presence, launched new educational initiatives, and strengthened its organizational structure.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Learn More About Tanzeem-e-Islami"
        subheading="Explore our organization, ideology, and programs."
        buttonLabel="About Organization"
        buttonUrl="/organization"
      />
    </main>
  );
}
