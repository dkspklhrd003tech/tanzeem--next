import { notFound } from "next/navigation";
import { db } from "@/db";
import { khitabAudioCategories, khitabAudios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Mic, ArrowLeft, Calendar, FileText } from "lucide-react";
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
        .orderBy(desc(khitabAudios.publishedAt));

    const publishedItems = items.filter(item => item.isPublished);

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="container mx-auto py-6 md:py-12">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
                        <Link href="/resources/khitab-e-jumah">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                        </Link>
                    </Button>

                    <div className="mb-10 pb-8 border-b border-border/50">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{category.name}</h1>
                        {category.urduName && (
                            <h2 className="text-2xl font-bold text-foreground font-amiri mb-4" dir="rtl">{category.urduName}</h2>
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
                                <Link href={`/resources/khitab-e-jumah/${cleanSlug}`} key={item.id} className="block group">
                                    <div className="relative bg-white border border-border rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-full p-6 flex flex-col justify-center min-h-[160px]">
                                        {/* Watermark Icon */}
                                        <div className="absolute -right-4 -bottom-4 text-[#0d5844]/5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                            <FileText className="w-32 h-32" strokeWidth={1.5} />
                                        </div>
                                        
                                        {/* Date Pill */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d5844]/10 text-[#0d5844] text-[10px] sm:text-xs font-bold mb-4 w-fit">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formattedDate}</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-foreground text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2 uppercase">
                                            {item.title}
                                        </h3>
                                        
                                        {item.titleUrdu && (
                                            <h4 className="font-bold text-lg text-foreground font-amiri mt-2 line-clamp-1" dir="rtl">{item.titleUrdu}</h4>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                        
                        {publishedItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-2xl border border-dashed border-border">
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
