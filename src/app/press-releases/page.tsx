import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Press Releases | Tanzeem-e-Islami" };

const releases = [
  { title: "Annual Conference 2026 Announced", date: "January 15, 2026", excerpt: "Tanzeem-e-Islami announces its annual conference focusing on contemporary challenges facing the Ummah." },
  { title: "New Distance Learning Platform Launched", date: "December 1, 2025", excerpt: "Tanzeem-e-Islami launches a revamped online learning platform for Islamic studies." },
  { title: "Statement on Palestine Solidarity", date: "October 10, 2025", excerpt: "Tanzeem-e-Islami issues a statement expressing solidarity with the people of Palestine." },
  { title: "Dars-e-Quran Expansion Program", date: "August 20, 2025", excerpt: "Tanzeem-e-Islami announces expansion of Dars-e-Quran circles to 50 new cities." },
  { title: "New Publication: Islamic Governance", date: "June 5, 2025", excerpt: "Tanzeem-e-Islami publishes a comprehensive book on Islamic governance and political theory." },
  { title: "Interfaith Dialogue Initiative", date: "April 15, 2025", excerpt: "Tanzeem-e-Islami launches an interfaith dialogue program to promote mutual understanding." },
];

export default function PressReleasesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <article className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Press Releases</h1>
          <p className="text-lg text-muted-foreground">Latest news, statements, and announcements from Tanzeem-e-Islami.</p>
        </article>
        <div className="max-w-4xl mx-auto space-y-6">
          {releases.map((release, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all">
              <p className="text-sm text-muted-foreground mb-2">{release.date}</p>
              <h3 className="text-xl font-semibold text-foreground mb-2">{release.title}</h3>
              <p className="text-muted-foreground">{release.excerpt}</p>
              <a
                href="/resources/press-releases"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                Browse All →
              </a>
            </div>
          ))}
        </div>
      </div>
      <CTABanner
        heading="Follow Our Social Media"
        subheading="Stay connected with Tanzeem-e-Islami on social media platforms."
        buttonLabel="Social Media"
        buttonUrl="/social-media"
      />
    </main>
  );
}
