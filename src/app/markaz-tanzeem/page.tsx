import { StatsGrid } from "@/components/shared/StatsGrid";
import { CTABanner } from "@/components/shared/CTABanner";

export const metadata = { title: "Markaz Tanzeem | Tanzeem-e-Islami" };

const stats = [
  { number: "1991", label: "Established" },
  { number: "10+", label: "Acres" },
  { number: "Multi", label: "Purpose" },
  { number: "HQ", label: "Role" },
];

export default function MarkazTanzeemPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-12 md:py-8">
        <article className="prose prose-lg  max-w-4xl mx-auto">
          <h1>Markaz Tanzeem-e-Islami</h1>
          <p className="lead text-xl text-muted-foreground mb-8">
            The central headquarters of Tanzeem-e-Islami, located in Lahore, Pakistan.
          </p>

          <h2>About Markaz Tanzeem</h2>
          <p>
            Markaz Tanzeem-e-Islami is the central headquarters of Tanzeem-e-Islami, situated in a spacious
            campus in Lahore, Pakistan. Established in 1991, the Markaz serves as the nerve center for all
            organizational activities including administration, education, publications, and media production.
          </p>

          <h2>Facilities</h2>
          <ul>
            <li>Main auditorium for public gatherings and seminars</li>
            <li>Quran Academy for systematic Islamic education</li>
            <li>Library with extensive collection of Islamic literature</li>
            <li>Media production studio for audio and video recording</li>
            <li>Publication department for books and magazines</li>
            <li>Administrative offices and residential facilities</li>
          </ul>

          <h2>Activities at Markaz</h2>
          <ul>
            <li>Regular Dars-e-Quran circles and study sessions</li>
            <li>Training programs for workers (kaar-kun)</li>
            <li>Public seminars and conferences</li>
            <li>Weekly Jum&apos;ah prayers and Khutbah</li>
            <li>Publication of Meesaq, Hikmat-e-Quran, and Nida-e-Khilafat</li>
            <li>Recording and distribution of Bayan-ul-Quran lectures</li>
          </ul>

          <h2>Visit Markaz</h2>
          <p>
            <strong>Address:</strong> 67-A, Johar Town, Lahore, Pakistan<br />
            <strong>Phone:</strong> +92 42 35869501
          </p>
        </article>
      </div>
      <StatsGrid stats={stats} />
      <CTABanner
        heading="Explore Distance Learning"
        subheading="Study Islamic sciences from anywhere in the world."
        buttonLabel="Distance Learning"
        buttonUrl="/distance-learning"
      />
    </main>
  );
}
