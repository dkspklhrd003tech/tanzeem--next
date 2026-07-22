import { notFound } from "next/navigation";
import { db } from "@/db";
import { khitabAudioCategories, khitabAudios } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import Link from "next/link";
import { Mic, ArrowLeft, Calendar, FileText, AudioLines } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CTABanner } from "@/components/shared/CTABanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await db.query.khitabAudioCategories.findFirst({
        where: eq(khitabAudioCategories.slug, slug),
    });

    if (!category) {
        return { title: "Category Not Found | Tanzeem-e-Islami" };
    }

    return {
        title: `${category.name} | Khitab E Jummah | Tanzeem-e-Islami`,
        description: category.description || `Audio sermons for ${category.name}`,
    };
}

export default async function KhitabEJumahCategoryPage({ params }: Props) {
    const { slug } = await params;
    const category = await db.query.khitabAudioCategories.findFirst({
        where: eq(khitabAudioCategories.slug, slug),
    });

    if (!category) {
        notFound();
    }

    const items = await db
        .select()
        .from(khitabAudios)
        .where(eq(khitabAudios.categoryId, category.id))
        .orderBy(asc(khitabAudios.order), desc(khitabAudios.publishedAt));

    const publishedItems = items.filter(item => item.isPublished);

    return (
        <main className=" bg-slate-50">
            <div className="container mx-auto py-6 md:py-12">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" asChild className="mb-2 text-foreground">
                        <Link href="/resources/khitab-e-jumah">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                        </Link>
                    </Button>

                    <div className="pb-2 border-b border-border/50">
                        <h1 className="text-3xl md:text-4xl text-center font-bold text-foreground mb-4">{category.name}</h1>
                        {category.urduName && (
                            <h2 className="text-2xl font-bold text-foreground font-nastaleeq mb-4" dir="rtl">{category.urduName}</h2>
                        )}
                        {category.description && (
                            <p className="text-lg text-muted-foreground">{category.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publishedItems.map((item: any) => {
                            const dateStr = item.publishedAt || item.createdAt;
                            const formattedDate = dateStr
                                ? new Date(dateStr).toLocaleDateString("en-GB", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }).toUpperCase()
                                : "RECENT";

                            const cleanSlug = item.slug?.replace(/^\/+/, '') || '';

                            return (
                                <Link key={item.id}
                                    href={`/resources/khitab-e-jumah/${cleanSlug}`}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-primary/50 hover:border-border/50 bg-muted/50 hover:bg-primary-light/80 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full">
                                    <div className="flex-1">
                                        <div className="flex flex-col items-start gap-1 mb-1">
                                            {/* Date Pill */}
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0d5844]/10 text-[#0d5844] text-[10px] sm:text-xs font-bold mb-1 w-fit">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formattedDate}</span>
                                            </div>
                                            <h3 className="font-bold text-md flex items-center gap-2 group-hover:text-primary transition-colors uppercase leading-snug line-clamp-3">
                                                {item.title}
                                            </h3>
                                            {item.titleUrdu && (
                                                <h4 className="font-bold text-xl tracking-wider text-foreground font-nastaleeq mt-1 line-clamp-1" dir="rtl">{item.titleUrdu}</h4>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white group-hover:bg-primary/10 group-hover:text-primary transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                                            <AudioLines className="w-7 h-7" />
                                        </button>
                                        <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">Listen Now</span>
                                    </div>
                                </Link>
                            );
                        })}

                        {publishedItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-dashed border-border">
                                No audio sermons found in this category.
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
