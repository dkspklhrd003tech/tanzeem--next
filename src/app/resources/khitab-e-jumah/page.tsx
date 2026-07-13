import { db } from "@/db";
import { khitabAudios, khitabAudioCategories } from "@/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { CTABanner } from "@/components/shared/CTABanner";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Headset, AudioLines } from "lucide-react";
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
        .orderBy(asc(khitabAudioCategories.order), desc(khitabAudioCategories.createdAt));

    const allSermons = await db
        .select()
        .from(khitabAudios)
        .where(eq(khitabAudios.isPublished, true))
        .orderBy(asc(khitabAudios.order), desc(khitabAudios.publishedAt));

    return (
        <main className="">
            <div className="container mx-auto py-6 md:py-10">
                <div className="max-w-7xl mx-auto">

                    <div className={
                        `grid gap-6 ` +
                        (categories.length === 1 ? "grid gap-4 grid-cols-1 md:grid-cols-3 max-w-5xl"
                            : "grid gap-4 grid-cols-1 md:grid-cols-3")
                    }>
                        {categories.map((cat: any) => {
                            const cleanSlug = cat.slug?.replace(/^\/+/, '') || '';
                            const sermonCount = allSermons.filter(s => s.categoryId === cat.id).length;

                            return (
                                <Link href={`/resources/khitab-e-jumah/category/${cleanSlug}`} key={cat.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-primary-light/80 hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full">
                                    <div className="flex-1">
                                        <div className="flex flex-col items-start gap-1 mb-1">
                                            <h3 className="font-bold text-md flex items-center gap-2 group-hover:text-primary transition-colors uppercase leading-snug line-clamp-3">
                                                {cat.name}
                                            </h3>
                                            {cat.urduName && (
                                                <h4 className="font-bold text-xl tracking-wider text-foreground font-nastaleeq mt-1 line-clamp-1" dir="rtl">{cat.urduName}</h4>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-[#0d5844]/10 text-[#0d5844] group-hover:bg-[#0d5844] group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                                            <AudioLines className="w-6 h-6" />
                                        </button>
                                        <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">
                                            {sermonCount} Audios
                                        </span>
                                    </div>
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
