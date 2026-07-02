import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Ameer Say Mulaqat | Tanzeem-e-Islami" };

export default function AmeerSayMulaqatPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Ameer Say Mulaqat</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            A unique program where the Ameer of Tanzeem-e-Islami engages directly with the audience on various topics.
          </p>

          <h2>About the Program</h2>
          <p>
            Ameer Say Mulaqat is a regular program where Shujauddin Sheikh, the Ameer of Tanzeem-e-Islami,
            engages directly with the audience. The program provides a platform for open dialogue on Islamic
            teachings, contemporary issues, organizational activities, and questions from viewers.
          </p>

          <h2>Format</h2>
          <ul>
            <li>Open Q&A sessions with the audience</li>
            <li>Discussion on current affairs from an Islamic perspective</li>
            <li>Guidance on personal and spiritual development</li>
            <li>Updates on Tanzeem-e-Islami&apos;s activities</li>
          </ul>

          <h2>Watch Episodes</h2>
          <p>
            All episodes of Ameer Say Mulaqat are available in our <a href="/resources/videos">video library</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Watch Videos"
        subheading="Browse our complete library of video content."
        buttonLabel="Video Library"
        buttonUrl="/resources/videos"
      />
    </main>
  );
}
