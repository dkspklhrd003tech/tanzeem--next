import { Metadata } from "next";
import { db } from "@/db";
import { darseQuranEvents } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { QuranicCirclesPage } from "@/components/darse-quran/QuranicCirclesPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quranic Circles (Dars-e-Quran) | Tanzeem-e-Islami",
  description:
    "Find a Dars-e-Quran (Quranic study circle) near you. Tanzeem-e-Islami conducts regular Quran study sessions in cities across Pakistan.",
  keywords: [
    "Dars-e-Quran",
    "Quranic circles",
    "Quran study",
    "Islamic study circle",
    "Tanzeem",
    "Dora-e-Tarjuma",
  ],
  openGraph: {
    title: "Quranic Circles — Tanzeem-e-Islami",
    description:
      "Find a Dars-e-Quran near you. Regular Quran study sessions across Pakistan.",
    type: "website",
  },
};

export default async function QuranicCirclesRoute({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; type?: string; ladies?: string }>;
}) {
  const sp = await searchParams;
  const city = sp.city?.trim() ?? "";
  const type = sp.type?.trim() ?? "";
  const ladies = sp.ladies?.trim() ?? "";

  // Fetch all published events from DB (server side — no client fetch needed)
  const allEvents = await db
    .select()
    .from(darseQuranEvents)
    .where(eq(darseQuranEvents.isPublished, true))
    .orderBy(asc(darseQuranEvents.city), asc(darseQuranEvents.time));

  // Unique sorted city + type lists for filter UI
  const cities = Array.from(new Set(allEvents.map((e) => e.city))).sort();
  const types = Array.from(new Set(allEvents.map((e) => e.type).filter(Boolean))).sort();

  // Apply filters
  const filtered = allEvents.filter((e) => {
    if (city && e.city !== city) return false;
    if (type && e.type !== type) return false;
    if (ladies === "yes" && !e.hasLadiesArrangement) return false;
    return true;
  });

  return (
    <main className=" bg-background">
      <QuranicCirclesPage
        events={filtered}
        allEvents={allEvents}
        cities={cities}
        types={types}
        activeCity={city}
        activeType={type}
        activeLadies={ladies}
        total={allEvents.length}
        filteredTotal={filtered.length}
      />
    </main>
  );
}
