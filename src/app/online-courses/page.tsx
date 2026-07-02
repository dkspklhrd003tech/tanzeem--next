import { getCmsPage, getCleanContent } from "@/lib/page-helpers";
import { DynamicPageContent, generatePageMetadata } from "@/components/shared/DynamicPageContent";
import { CTABanner } from "@/components/shared/CTABanner";

import { RedirectPage } from "@/components/shared/RedirectPage";

export const dynamic = "force-dynamic";

const SLUG = "online-courses";
const DEFAULT_TITLE = "Online Courses | Tanzeem-e-Islami";
const DEFAULT_DESC = "Structured Quranic and Islamic education through our online learning platform — study at your own pace from anywhere in the world.";

export async function generateMetadata() {
  const { page } = await getCmsPage(SLUG);
  return generatePageMetadata(page, DEFAULT_TITLE, DEFAULT_DESC);
}

export default async function OnlineCoursesPage() {
  const { page, sections } = await getCmsPage(SLUG);

  if (page && page.template === "redirect") {
    return <RedirectPage title={page.title} url={page.content.trim() || "https://lms.quranacademy.com/"} />;
  }

  if (page && sections.length > 0) {
    return (
      <main className="min-h-screen bg-background">
        <DynamicPageContent sections={sections} />
      </main>
    );
  }

  if (page) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-6 md:py-8 max-w-4xl">
          <div className="prose prose-lg  max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: getCleanContent(page.content) }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Online Courses</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            Study Islamic sciences, Quranic tafseer, and spiritual development through our structured online
            courses — available from anywhere in the world, at your own pace.
          </p>

          <h2>About Our Online Education</h2>
          <p>
            Tanzeem-e-Islami&apos;s online courses make systematic Islamic education accessible to Muslims across
            the globe. Rooted in the Ruju Ilal Quran (Return to the Quran) methodology, our online programs
            are designed to build a deep, practical understanding of the Quran, Hadith, and Islamic sciences
            in the learner&apos;s own time and environment.
          </p>
          <p>
            All courses are developed under the supervision of qualified Islamic scholars and follow a
            structured curriculum. Students receive study materials, recorded lectures, and access to
            mentors who guide them through their learning journey.
          </p>

          <h2>Available Courses</h2>
          <h3>Tafseer-ul-Quran</h3>
          <p>
            An in-depth study of the Quran with full tafseer commentary. This course covers the linguistic,
            historical, and spiritual dimensions of each surah, drawing on the works of classical and
            contemporary scholars.
          </p>
          <h3>Hadith Sciences</h3>
          <p>
            A foundational course on the Sunnah of the Prophet ﷺ, covering major hadith collections,
            principles of hadith authentication, and the practical application of prophetic teachings.
          </p>
          <h3>Islamic History and Civilization</h3>
          <p>
            An overview of the rise and decline of Islamic civilization, key historical events, and lessons
            for the contemporary Muslim Ummah.
          </p>
          <h3>Iqamat-e-Deen — Understanding Our Obligation</h3>
          <p>
            A course based on Tanzeem-e-Islami&apos;s core mission: understanding the obligation of establishing
            the Deen of Allah, its methodology, and the role of every Muslim in this effort.
          </p>
          <h3>Quran Academy Online (via LMS)</h3>
          <p>
            Access Quran Academy&apos;s full learning management system for self-paced courses with video
            lectures, quizzes, and certificates upon completion.
          </p>

          <h2>Registration</h2>
          <p>
            Registering for an online course is straightforward:
          </p>
          <ol>
            <li>Browse the available courses listed above or on the Quran Academy LMS.</li>
            <li>Click the registration link for your chosen course to fill in your details.</li>
            <li>Our team will confirm your enrollment and share course materials within 2–3 working days.</li>
            <li>Join the online sessions or access recorded content at your convenience.</li>
          </ol>
          <p>
            For further information on enrollment, fees (many courses are offered free of charge), or
            technical support, contact us at{" "}
            <a href="/contact" className="text-primary hover:underline">our contact page</a>.
          </p>
        </article>
      </div>
      <CTABanner
        heading="Begin Your Islamic Education Online"
        subheading="Join thousands of students worldwide studying Quran and Islamic sciences through our online platform."
        buttonLabel="Contact Us to Enroll"
        buttonUrl="/contact"
      />
    </main>
  );
}
