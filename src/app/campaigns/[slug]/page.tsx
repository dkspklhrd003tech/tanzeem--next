import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CTABanner } from "@/components/shared/CTABanner";
import { ImageSlider } from "@/components/shared/ImageSlider";
import { Button } from "@/components/ui/button";
import { FileText, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);

    if (!campaign || !campaign.isPublished) return { title: "Not Found" };

    return {
        title: campaign.metaTitle || campaign.title,
        description: campaign.metaDescription || "Campaign details.",
    };
}

export default async function CampaignDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);

    if (!campaign || !campaign.isPublished) {
        notFound();
    }

    const blocks = campaign.customFields?.blocks || [];

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto py-8 md:py-16 max-w-4xl px-4">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary">{campaign.title}</h1>
                    </div>

                    {/* Main Image */}
                    {campaign.thumbnailUrl && (
                        <div className="w-full relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-border">
                            <Image
                                src={campaign.thumbnailUrl}
                                alt={campaign.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Dynamic Blocks */}
                    <div className="space-y-12 pt-6">
                        {blocks.map((block: any, idx: number) => {
                            if (!block.value) return null;

                            switch (block.type) {
                                case "text":
                                    return (
                                        <div 
                                            key={idx} 
                                            className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-a:text-primary"
                                            dangerouslySetInnerHTML={{ __html: block.value }} 
                                        />
                                    );

                                case "image":
                                    return (
                                        <div key={idx} className="w-full relative aspect-auto rounded-xl overflow-hidden shadow-lg border border-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={block.value}
                                                alt={`Campaign Block ${idx}`}
                                                className="w-full h-auto object-cover"
                                            />
                                        </div>
                                    );

                                case "pdf":
                                    const pdfUrl = typeof block.value === 'string' ? block.value : block.value?.url;
                                    const pdfTitle = typeof block.value === 'string' ? null : block.value?.title;
                                    if (!pdfUrl) return null;
                                    
                                    return (
                                        <div key={idx} className="bg-muted/30 border border-border p-6 rounded-2xl flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{pdfTitle || "Document Attachment"}</h3>
                                                    <p className="text-sm text-muted-foreground">Click to view or download the attached PDF document.</p>
                                                </div>
                                            </div>
                                            <Button asChild className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                                    View PDF
                                                </a>
                                            </Button>
                                        </div>
                                    );

                                case "thumbnails":
                                    if (!Array.isArray(block.value) || block.value.length === 0) return null;
                                    return (
                                        <div key={idx} className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {block.value.map((thumb: any, tIdx: number) => {
                                                const isVideo = thumb.url && (thumb.url.includes("youtube.com") || thumb.url.includes("youtu.be") || thumb.url.includes("vimeo"));
                                                return (
                                                    <Link 
                                                        key={tIdx} 
                                                        href={thumb.url || "#"} 
                                                        target={thumb.url?.startsWith("/") ? "_self" : "_blank"}
                                                        className="group relative aspect-video rounded-xl overflow-hidden shadow-md border border-border block"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={thumb.image}
                                                            alt={`Thumbnail ${tIdx}`}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                        {isVideo && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <PlayCircle className="h-12 w-12 text-white/90 drop-shadow-lg group-hover:scale-110 transition-transform" />
                                                            </div>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    );

                                case "slider":
                                    if (!Array.isArray(block.value) || block.value.length === 0) return null;
                                    return (
                                        <div key={idx} className="w-full">
                                            <ImageSlider slides={block.value} />
                                        </div>
                                    );

                                default:
                                    return null;
                            }
                        })}
                    </div>
                </div>
            </div>

            <CTABanner
                heading="Support Our Mission"
                subheading="Help Tanzeem-e-Islami expand these campaigns and reach more people across the globe."
                buttonLabel="Get Involved"
                buttonUrl="/contact"
            />
        </main>
    );
}
