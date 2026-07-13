import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Tazkeer | Tanzeem-e-Islami" };

export default function TazkeerPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Tazkeer</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Short, impactful reminders and reflections on Islamic teachings for daily spiritual nourishment.
          </p>

          <h2>About Tazkeer</h2>
          <p>
            Tazkeer is a series of short, focused reminders and reflections based on the Quran and Sunnah.
            These bite-sized videos are designed to provide spiritual nourishment and practical guidance for
            Muslims in their daily lives.
          </p>

          <h2>Topics</h2>
          <ul>
            <li>The importance of Salah and its spiritual impact</li>
            <li>Developing taqwa (God-consciousness) in daily life</li>
            <li>Overcoming common spiritual challenges</li>
            <li>Reminders about death and the Hereafter</li>
            <li>The power of dua and reliance on Allah</li>
          </ul>

          <h2>Watch Tazkeer</h2>
          <p>
            Browse the Tazkeer series in our <a href="/resources/videos/by-category/tazkeer">video library</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Watch Tazkeer Videos"
        subheading="Explore the complete collection of Tazkeer reminders."
        buttonLabel="Browse Videos"
        buttonUrl="/resources/videos"
      />
    </main>
  );
}
