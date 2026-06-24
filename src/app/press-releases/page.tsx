import { db } from "@/db";
import { pressReleases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PressReleasesGrid } from "@/components/resources/PressReleasesGrid";
import { CTABanner } from "@/components/shared/CTABanner";
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
        .orderBy(pressReleases.orderIndex, desc(pressReleases.publishedAt))
        .limit(50);

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto py-6 md:py-8">
                <div className="max-w-7xl mx-auto">
                    <PressReleasesGrid initialItems={items} />
                </div>
            </div>
            <CTABanner
                heading="Follow Our Social Media"
                subheading="Stay connected with Tanzeem-e-Islami on social media platforms."
                buttonLabel="Social Media"
                buttonUrl="/social-media"
            />
        </main>
    );
}
