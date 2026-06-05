import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Perspective Magazine | Tanzeem-e-Islami" };

export default function PerspectivePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Perspective</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Tanzeem-e-Islami&apos;s English publication presenting Islamic perspectives on contemporary global issues.
          </p>

          <h2>About Perspective</h2>
          <p>
            Perspective is the English-language magazine published by Tanzeem-e-Islami. It aims to present
            Islamic perspectives on contemporary global issues to an international audience.
          </p>
          <p>
            Each issue covers a diverse range of topics including Islamic theology, comparative religion,
            global politics, social issues, science and religion, and interfaith dialogue.
          </p>

          <h2>Recent Issues</h2>
          <p>
            Browse recent and past issues of Perspective in our <a href="/resources/magazines/perspective">magazine archive</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Press Releases"
        subheading="Stay updated with the latest news and announcements from Tanzeem-e-Islami."
        buttonLabel="Press Releases"
        buttonUrl="/press-releases"
      />
    </main>
  );
}
