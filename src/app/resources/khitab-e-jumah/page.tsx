import { db } from "@/db";
import { khitabAudios, khitabAudioCategories } from "@/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { CTABanner } from "@/components/shared/CTABanner";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Headset } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Khitab-e-Jum'ah Categories | Tanzeem-e-Islami",
    description: "Browse Friday sermons (Khitab-e-Jum'ah) by category from Tanzeem-e-Islami.",
    openGraph: {
        title: "Khitab-e-Jum'ah Categories | Tanzeem-e-Islami",
        description: "Browse Friday sermons (Khitab-e-Jum'ah) by category from Tanzeem-e-Islami.",
    },
};

export default async function KhitabEJumahCategoriesPage() {
    // Fetch categories ordered by `order`
    const categories = await db
        .select()
        .from(khitabAudioCategories)
        .orderBy(desc(khitabAudioCategories.order), desc(khitabAudioCategories.createdAt));

    const allSermons = await db
        .select()
        .from(khitabAudios)
        .where(eq(khitabAudios.isPublished, true))
        .orderBy(asc(khitabAudios.order), desc(khitabAudios.publishedAt));

    return (
        <main className="min-h-screen">
            <div className="container mx-auto py-6 md:py-10">
                <div className="max-w-7xl mx-auto">

                    <div className={
                        `grid gap-6 ` +
                        (categories.length === 1 ? "grid gap-4 grid-cols-1 md:grid-cols-3 max-w-5xl"
                            : "grid gap-4 grid-cols-1 md:grid-cols-3")
                    }>
                        {categories.map((cat: any) => {
                            const cleanSlug = cat.slug?.replace(/^\/+/, '') || '';
                            return (
                                <Link href={`/resources/khitab-e-jumah/category/${cleanSlug}`} key={cat.id}>
                                    <Card className="cursor-pointer overflow-hidden hover:shadow-lg transition-all h-full group border-border/50 hover:border-primary/50">
                                        <CardContent className="p-4 flex flex-row items-center gap-4 text-left">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Headset className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight mb-1">{cat.name}</h3>
                                                {cat.urduName && (
                                                    <h4 className="font-bold text-lg text-foreground font-amiri text-right" dir="rtl">{cat.urduName}</h4>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}

                        {categories.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                No categories found. Please check back later.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CTABanner
                heading="Find a Jummah Venue Near You"
                subheading="Join us for Friday prayers at one of our official venues."
                buttonLabel="Jummah Venues"
                buttonUrl="/khitabat-addresses"
            />
        </main>
    );
}
