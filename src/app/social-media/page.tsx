import { Metadata } from "next";
import { SocialHub } from "@/components/social/SocialHub";
import { db } from "@/lib/db";
import { socialPlatforms, socialAccounts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Social Media Hub | Tanzeem-e-Islami",
  description: "Connect with Tanzeem-e-Islami and Dr. Israr Ahmed across all major social media platforms.",
};

export default async function SocialMediaPage() {
  // Fetch data server-side for initial load
  const platforms = await db.select().from(socialPlatforms).where(eq(socialPlatforms.isActive, true)).orderBy(asc(socialPlatforms.order));
  const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.isActive, true)).orderBy(asc(socialAccounts.order));

  return (
    <main className="min-h-screen bg-background py-12 md:py-16">
      <div className="container mx-auto">
        <header className="text-center mb-16 space-y-4">
          <div className="inline-block py-1.5 rounded-full bg-primary/5 text-primary text-sm font-bold tracking-widest uppercase mb-2">
            Stay Connected
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0d5844] tracking-tight">
            Digital Ecosystem
          </h1>
          <p className="text-lg text-[#0d5844]/70 max-w-2xl mx-auto leading-relaxed">
            Follow our official handles for the latest lectures, updates, and educational content from Tanzeem-e-Islami and Dr. Israr Ahmed.
          </p>
        </header>

        <SocialHub initialPlatforms={platforms} initialAccounts={accounts} />
      </div>
    </main>
  );
}
