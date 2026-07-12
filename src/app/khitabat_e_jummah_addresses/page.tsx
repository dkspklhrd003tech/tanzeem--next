import { Metadata } from "next";
import { db } from "@/db";
import { khitabatJummahAddresses } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { KhitabatJummahPage } from "@/components/khitabat/KhitabatJummahPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khitabat-e-Jummah Addresses | Tanzeem-e-Islami",
  description:
    "Find Friday sermon (Khitabat-e-Jummah) addresses of Tanzeem-e-Islami speakers across Pakistan.",
  keywords: [
    "Khitabat-e-Jummah",
    "Friday Sermons",
    "Tanzeem-e-Islami",
    "Jummah Addresses",
    "Masjid Locations",
  ],
  openGraph: {
    title: "Khitabat-e-Jummah Addresses — Tanzeem-e-Islami",
    description: "Friday sermon venues and timings across Pakistan.",
    type: "website",
  },
};

export default async function KhitabatJummahRoute() {
  // Fetch all published addresses from the database
  const addresses = await db
    .select()
    .from(khitabatJummahAddresses)
    .where(eq(khitabatJummahAddresses.isPublished, true))
    .orderBy(asc(khitabatJummahAddresses.city), asc(khitabatJummahAddresses.masjid));

  // Map to clean types for component
  const cleanAddresses = addresses.map((addr) => ({
    id: addr.id,
    masjid: addr.masjid,
    address: addr.address,
    city: addr.city,
    time: addr.time,
    contact: addr.contact,
    map: addr.map,
  }));

  return (
    <main className="min-h-screen bg-background">
      <KhitabatJummahPage addresses={cleanAddresses} />
    </main>
  );
}
