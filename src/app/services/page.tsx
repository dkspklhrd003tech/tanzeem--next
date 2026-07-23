import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ServicesGrid } from "@/components/resources/ServicesGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Services | Tanzeem-e-Islami",
    description: "Official services from Tanzeem-e-Islami.",
    openGraph: {
        title: "Services | Tanzeem-e-Islami",
        description: "Official services from Tanzeem-e-Islami.",
    },
};

export default async function ServicesPage() {
    const items = await db
        .select()
        .from(services)
        .where(eq(services.isPublished, true))
        .orderBy(desc(services.createdAt))
        .limit(50);

    return (
        <main className=" bg-background">
            <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
                <div className="max-w-7xl mx-auto">
                    <ServicesGrid initialItems={items as any} />
                </div>
            </div>
            <CTABanner
                heading="Learn More About Our Services"
                subheading="Get involved with our various community services and initiatives."
                buttonLabel="Contact Us"
                buttonUrl="/contact"
            />
        </main>
    );
}
