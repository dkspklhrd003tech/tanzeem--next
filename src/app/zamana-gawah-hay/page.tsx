import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Zamana Gawah Hai | Tanzeem-e-Islami" };

export default function ZamanaGawahHayPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Zamana Gawah Hai</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            A landmark television program by Dr. Israr Ahmed that addressed contemporary issues from an Islamic perspective.
          </p>

          <h2>About the Program</h2>
          <p>
            Zamana Gawah Hai (The Era Bears Witness) was Dr. Israr Ahmed&apos;s landmark television program that
            aired on national television. The program addressed a wide range of contemporary issues &mdash; political,
            social, economic, and cultural &mdash; from a deep and insightful Islamic perspective.
          </p>
          <p>
            The program gained immense popularity for its intellectual depth, candid analysis, and Dr. Israr
            Ahmed&apos;s unique ability to connect Quranic teachings with modern-day challenges.
          </p>

          <h2>Topics Covered</h2>
          <ul>
            <li>The Islamic concept of state and governance</li>
            <li>The political situation of the Muslim world</li>
            <li>Western civilization: a critical analysis</li>
            <li>The Palestinian question</li>
            <li>The intellectual crisis of the Ummah</li>
          </ul>

          <h2>Watch Episodes</h2>
          <p>
            All episodes of Zamana Gawah Hai are available in our <a href="/resources/videos">video library</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Watch Videos"
        subheading="Browse our complete library of video lectures and programs."
        buttonLabel="Video Library"
        buttonUrl="/resources/videos"
      />
    </main>
  );
}
