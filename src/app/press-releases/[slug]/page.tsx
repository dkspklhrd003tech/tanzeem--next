import { db } from "@/db";
import { pressReleases } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CTABanner } from "@/components/shared/CTABanner";
import Link from "next/link";
import { ArrowLeft, Printer, Download, Share2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientShareButton } from "@/components/shared/ClientShareButton";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const items = await db
        .select()
        .from(pressReleases)
        .where(
            or(
                eq(pressReleases.slug, slug),
                eq(pressReleases.id, slug)
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
        title: `${item.title} | Press Releases`,
        description: item.excerpt || "Read this press release from Tanzeem-e-Islami.",
    };
}

export default async function PressReleaseDetailsPage({ params }: PageProps) {
    const { slug } = await params;

    const items = await db
        .select()
        .from(pressReleases)
        .where(
            or(
                eq(pressReleases.slug, slug),
                eq(pressReleases.id, slug)
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
        <main className=" bg-zinc-50/50">

            <div className="container mx-auto py-8 px-4 flex flex-col items-center">
                <div className="w-full max-w-5xl z-40 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-2 max-w-[70%]">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold tracking-widest uppercase bg-[#E8F0EC] text-[#0A5C36] w-fit">
                                <Calendar className="w-3.5 h-3.5" />
                                {formattedDate}
                            </span>
                            <div className="flex items-start gap-3">
                                <h1 className="text-lg md:text-xl font-semibold text-foreground line-clamp-2">
                                    {selectedItem.title}
                                </h1>
                                <ClientShareButton variant="icon" className="-mt-1" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedItem.pdfUrl && (
                                <Button asChild size="sm" className="h-8 bg-primary text-white">
                                    <a href={selectedItem.pdfUrl} download={`${selectedItem.slug || 'press-release'}.pdf`}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Press Release
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {selectedItem.pdfUrl ? (
                    <div className="w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden border border-border shadow-xl bg-white">
                        <iframe
                            src={`${selectedItem.pdfUrl}#toolbar=1`}
                            className="w-full h-full border-none"
                            title="PDF Document Viewer"
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-3xl bg-white shadow-xl border border-zinc-200/80 rounded-xl p-8 md:p-12 text-zinc-800 overflow-hidden flex flex-col">
                        <div className="border-b-2 border-emerald-800 pb-5 mb-8 text-center">
                            <h3 className="font-amiri text-2xl font-extrabold text-emerald-800 tracking-wide">
                                TANZEEM-E-ISLAMI
                            </h3>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                                Official Press & Media Division
                            </p>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground font-medium mb-6">
                            <span>Ref: TI/PR/{selectedItem.slug?.toUpperCase() || selectedItem.id.slice(0, 8)}</span>
                            <span>Date: {formattedDate}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 leading-normal tracking-tight text-center md:text-left">
                            {selectedItem.title}
                        </h1>

                        <div
                            className="prose prose-emerald max-w-none text-base leading-relaxed text-justify space-y-4"
                            dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                        />

                        <div className="mt-16 pt-8 border-t border-border/50 text-center md:text-left">
                            <p className="font-bold text-sm text-foreground">Media Spokesperson</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Tanzeem-e-Islami Headquarters, Lahore</p>
                        </div>
                    </div>
                )}
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
