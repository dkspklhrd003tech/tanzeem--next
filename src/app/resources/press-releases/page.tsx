import { db } from "@/db";
import { pressReleases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { LatestPressReleases } from "@/components/home/LatestPressReleases";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Press Releases | Tanzeem-e-Islami",
    description: "Official announcements and press releases from Tanzeem-e-Islami.",
    openGraph: {
        title: "Press Releases | Tanzeem-e-Islami",
        description: "Official announcements and press releases from Tanzeem-e-Islami.",
    },
};

export default async function PressReleasesPage() {
    const items = await db
        .select()
        .from(pressReleases)
        .where(eq(pressReleases.isPublished, true))
        .orderBy(desc(pressReleases.publishedAt))
        .limit(30);

    return (
        <main className="min-h-screen bg-background">
            <LatestPressReleases items={items} />
        </main>
    );
}
