import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CampaignsGrid } from "@/components/resources/CampaignsGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Campaigns | Tanzeem-e-Islami",
    description: "Official campaigns from Tanzeem-e-Islami.",
    openGraph: {
        title: "Campaigns | Tanzeem-e-Islami",
        description: "Official campaigns from Tanzeem-e-Islami.",
    },
};

export default async function CampaignsPage() {
    const items = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.isPublished, true))
        .orderBy(desc(campaigns.createdAt))
        .limit(50);

    return (
        <main className=" bg-background">
            <div className="container mx-auto py-6 md:py-8">
                <div className="max-w-7xl mx-auto">
                    <CampaignsGrid initialItems={items as any} />
                </div>
            </div>
            <CTABanner
                heading="Support Our Services & Campaigns"
                subheading="Join hands with Tanzeem-e-Islami to support our ongoing services & campaigns."
                buttonLabel="Visit Services"
                buttonUrl="/services"
            />
        </main>
    );
}
