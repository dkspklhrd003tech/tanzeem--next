import { TeamGrid } from "@/components/shared/TeamGrid";
import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "The Founder | Tanzeem-e-Islami" };

const founderMembers = [
  {
    name: "Dr. Israr Ahmed",
    designation: "Founder & First Ameer (1975–2010)",
    bio: "Dr. Israr Ahmed (1932–2010) was a visionary Islamic scholar, theologian, philosopher, and the founder of Tanzeem-e-Islami.",
    avatar: "https://tanzeem.org/media/dr-israr-ahmed.jpg",
    socials: {
      website: "https://tanzeem.org/dr-israr-ahmed",
    },
  },
];

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>The Founder</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Dr. Israr Ahmed (1932&ndash;2010) &mdash; Founder of Tanzeem-e-Islami, a visionary scholar, theologian, and revivalist who dedicated his life to the cause of Islam.
          </p>

          <TeamGrid heading="Founder" members={founderMembers} />

          <h2>Early Life and Education</h2>
          <p>
            Dr. Israr Ahmed was born on April 26, 1932, in Hisar, Punjab (now in Haryana, India). He received
            his early education from a local school and later studied at King Edward Medical College in Lahore,
            where he earned his MBBS degree in 1954. Despite his medical training, his true passion lay in
            Islamic studies and the intellectual revival of the Muslim Ummah.
          </p>

          <h2>Intellectual Development</h2>
          <p>
            During his student years, Dr. Israr Ahmed was deeply influenced by the poetry and philosophy of
            Allama Muhammad Iqbal and the writings of Maulana Abul A&apos;la Maududi. He became actively involved
            with the Islami Jamiat-e-Tulaba and later with Jamaat-e-Islami.
          </p>

          <h2>Founding of Tanzeem-e-Islami</h2>
          <p>
            In 1975, Dr. Israr Ahmed founded Tanzeem-e-Islami with the vision of creating a nucleus of committed
            workers (kaar-kun) who would devote their lives to the revival of Islam.
          </p>

          <h2>Literary and Scholarly Contributions</h2>
          <ul>
            <li>Tafseer-e-Asri (Contemporary Commentary on the Quran)</li>
            <li>Minhaj-e-Inqilab-e-Nabawi (The Prophetic Method of Revolution)</li>
            <li>Tasheel-ul-Quran (Simplified Quran Study Series)</li>
            <li>Thousands of audio and video lectures</li>
          </ul>

          <h2>Key Contributions</h2>
          <ul>
            <li><strong>Bayan-ul-Quran:</strong> Comprehensive Quran commentary program</li>
            <li><strong>Dars-e-Quran:</strong> Systematic Quran study circles</li>
            <li><strong>Quran Academy:</strong> Structured Islamic education</li>
            <li><strong>Zamana Gawah Hai:</strong> Landmark television program</li>
          </ul>

          <h2>Legacy</h2>
          <p>
            Dr. Israr Ahmed passed away on April 14, 2010, but his legacy continues through Tanzeem-e-Islami
            and the countless individuals whose lives he transformed.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Current Leadership"
        subheading="Meet Shujauddin Sheikh, the current Ameer of Tanzeem-e-Islami."
        buttonLabel="The Ameer"
        buttonUrl="/organization/the-ameer"
      />
    </main>
  );
}
