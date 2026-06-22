import { notFound } from "next/navigation";
import Link from "next/link";
import { QuranicCirclesTable } from "@/components/resources/QuranicCirclesTable";
import { AudioList } from "@/components/resources/AudioList";
import { getActiveLocations, getPublishedAudio } from "@/lib/resources";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  "quranic-circles": "Quranic Circles",
  "khitabat-e-jummah": "Khitabat-e-Jummah Addresses",
};

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const title = TITLES[slug.join("/")] || "Public Programs";
  return { title: `${title} | Tanzeem-e-Islami` };
}

export default async function PublicProgramSubPage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const title = TITLES[path];

  if (!title) notFound();

  return (
    <div className="container mx-auto py-8 md:py-10 px-4">
      <div className="max-w-4xl mb-8">
        <Link href="/public-programs" className="text-sm text-primary hover:underline">
          ← Public Programs
        </Link>
        <h1 className="font-amiri text-3xl md:text-4xl font-bold text-primary mt-2">{title}</h1>
        {path === "quranic-circles" && (
          <p className="text-foreground-muted mt-2">
            Weekly Quranic study circles across Pakistan. Contact your local coordinator for timings.
          </p>
        )}
      </div>

      {path === "quranic-circles" && (
        <QuranicCirclesTable
          locations={(await getActiveLocations()).map((l) => ({
            id: l.id,
            name: l.name,
            city: l.city,
            address: l.address,
            phone: l.phone,
            email: l.email,
          }))}
        />
      )}

      {path === "khitabat-e-jummah" && (
        <AudioList items={await getPublishedAudio()} />
      )}
    </div>
  );
}
