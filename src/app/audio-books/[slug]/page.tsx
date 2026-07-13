import { db } from "@/db";
import { audioBooks } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CTABanner } from "@/components/shared/CTABanner";
import Link from "next/link";
import { ArrowLeft, PlayCircle, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { WaveformPlayer } from "@/components/resources/WaveformPlayer";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const items = await db
        .select()
        .from(audioBooks)
        .where(
            or(
                eq(audioBooks.slug, slug),
                eq(audioBooks.id, slug)
            )
        )
        .limit(1);

    if (!items.length) {
        return {
            title: "Not Found | Tanzeem-e-Islami",
        };
    }

    const item = items[0];
    return {
        title: `${item.title} | Audio Books`,
        description: item.excerpt || "Listen to this audio book from Tanzeem-e-Islami.",
    };
}

export default async function AudioBookDetailsPage({ params }: PageProps) {
    const { slug } = await params;

    const items = await db
        .select()
        .from(audioBooks)
        .where(
            or(
                eq(audioBooks.slug, slug),
                eq(audioBooks.id, slug)
            )
        )
        .limit(1);

    if (!items.length) {
        notFound();
    }

    const selectedItem = items[0];

    const formattedDate = selectedItem.publishedAt
        ? new Date(selectedItem.publishedAt).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Recent";

    return (
        <main className="min-h-screen bg-zinc-50/50">
            {/* Header / Actions Bar */}
            <div className="border-b bg-background sticky top-[72px] z-40 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="/audio-books">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Audio Books
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container mx-auto py-10 px-4">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Image */}
                    <div className="w-full md:w-1/3 bg-muted relative aspect-[3/4] md:aspect-auto">
                        {selectedItem.featuredImage ? (
                            <img
                                src={selectedItem.featuredImage}
                                alt={selectedItem.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <PlayCircle className="h-20 w-20 text-primary/30" />
                            </div>
                        )}
                    </div>

                    {/* Right: Content & Player */}
                    <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col bg-primary-light">
                        <div className="flex items-center gap-2 mb-4 text-sm text-primary">
                            <Calendar className="h-4 w-4 text-medium" />
                            <span>{formattedDate}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            {selectedItem.title}
                        </h1>

                        {/* Audio Player */}
                        <div className="py-6 w-full">
                            {selectedItem.audioUrl ? (
                                <div>
                                    <WaveformPlayer
                                        audioUrl={selectedItem.audioUrl}
                                        title={selectedItem.title}
                                        publishedAt={selectedItem.publishedAt}
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <Button asChild variant="outline" size="sm" className="bg-primary text-xs text-white">
                                            <a href={resolveMediaUrl(selectedItem.audioUrl)} download={`${selectedItem.slug || "audio-book"}.mp3`}>
                                                Download MP3
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium text-sm">Audio file not available.</p>
                                </div>
                            )}
                        </div>

                        {/* Content / Excerpt
                        <div className="flex-1">
                            {selectedItem.content && selectedItem.content !== "<p></p>" ? (
                                <div 
                                    className="prose prose-sm max-w-none text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: selectedItem.content }} 
                                />
                            ) : selectedItem.excerpt ? (
                                <p className="text-muted-foreground">
                                    {selectedItem.excerpt}
                                </p>
                            ) : null}
                        </div> */}
                    </div>
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
