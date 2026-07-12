import { Metadata } from "next";
import { SocialHub } from "@/components/social/SocialHub";
import { db } from "@/db";
import { socialPlatforms, socialAccounts, pages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Social Media Hub | Tanzeem-e-Islami",
  description: "Connect with Tanzeem-e-Islami and Dr. Israr Ahmed across all major social media platforms.",
};

export default async function SocialMediaPage() {
  // Fetch page layout settings
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, "social-media")
  });
  const layout = page?.template === "vertical" ? "vertical" : "horizontal";

  // Fetch data server-side for initial load
  const platforms = await db.select().from(socialPlatforms).where(eq(socialPlatforms.isActive, true)).orderBy(asc(socialPlatforms.order));
  const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.isActive, true)).orderBy(asc(socialAccounts.order));

  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto">
        <SocialHub initialPlatforms={platforms} initialAccounts={accounts} layout={layout} />
      </div>
    </main>
  );
}
