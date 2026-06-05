import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Audio Books | Tanzeem-e-Islami" };

export default function AudioBooksPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Audio Books</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Explore our collection of audio books covering Quranic studies, Seerah, and Islamic thought.
          </p>

          <h2>Available Audio Books</h2>
          <ul>
            <li><strong>Bayan-ul-Quran</strong> &mdash; Audio commentary on the Quran by Dr. Israr Ahmed</li>
            <li><strong>Tasheel-ul-Quran</strong> &mdash; Simplified Quran study program in audio format</li>
            <li><strong>Seerat-un-Nabi (SAW)</strong> &mdash; Audio biography of Prophet Muhammad</li>
            <li><strong>Islamic Psychology</strong> &mdash; Lectures on Islamic psychology and spirituality</li>
            <li><strong>Minhaj-e-Inqilab-e-Nabawi</strong> &mdash; Prophetic methodology of revolution</li>
          </ul>
          <p>
            Browse all audio books in our <a href="/resources/audio-books">audio books library</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Explore Books"
        subheading="Browse our collection of written publications."
        buttonLabel="Books"
        buttonUrl="/resources/books"
      />
    </main>
  );
}
