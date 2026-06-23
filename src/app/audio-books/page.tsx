import { db } from "@/db";
import { audioBooks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AudioBooksGrid } from "@/components/resources/AudioBooksGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Audio Books | Tanzeem-e-Islami",
    description: "Official audio books from Tanzeem-e-Islami.",
    openGraph: {
        title: "Audio Books | Tanzeem-e-Islami",
        description: "Official audio books from Tanzeem-e-Islami.",
    },
};

export default async function AudioBooksPage() {
    const items = await db
        .select()
        .from(audioBooks)
        .where(eq(audioBooks.isPublished, true))
        .orderBy(audioBooks.orderIndex, desc(audioBooks.publishedAt))
        .limit(50);

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto py-8 md:py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <AudioBooksGrid initialItems={items} />
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
