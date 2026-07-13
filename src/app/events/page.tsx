import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { EventsGrid } from "@/components/resources/EventsGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Events | Tanzeem-e-Islami",
    description: "Upcoming and past events from Tanzeem-e-Islami.",
    openGraph: {
        title: "Events | Tanzeem-e-Islami",
        description: "Upcoming and past events from Tanzeem-e-Islami.",
    },
};

export default async function EventsPage() {
    const items = await db
        .select()
        .from(events)
        .where(eq(events.isPublished, true))
        .orderBy(desc(events.createdAt))
        .limit(50);

    return (
        <main className=" bg-background">
            <div className="container mx-auto py-6 md:py-8">
                <div className="max-w-7xl mx-auto">
                    <EventsGrid initialItems={items as any} />
                </div>
            </div>
            <CTABanner
                heading="Join Our Events"
                subheading="Stay connected with Tanzeem-e-Islami by participating in our events."
                buttonLabel="Contact Us"
                buttonUrl="/contact"
            />
        </main>
    );
}
