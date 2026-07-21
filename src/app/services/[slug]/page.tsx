import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CTABanner } from "@/components/shared/CTABanner";
import { ImageSlider } from "@/components/shared/ImageSlider";
import { Button } from "@/components/ui/button";
import { PlayCircle, Download } from "lucide-react";
import { PdfViewerHeader } from "@/components/shared/PdfViewerHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [service] = await db.select().from(services).where(eq(services.slug, slug)).limit(1);

    if (!service || !service.isPublished) return { title: "Not Found" };

    return {
        title: service.metaTitle || service.title,
        description: service.metaDescription || service.description || "Service details.",
    };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [service] = await db.select().from(services).where(eq(services.slug, slug)).limit(1);

    if (!service || !service.isPublished) {
        notFound();
    }

    let customFields = service.customFields as any;
    if (typeof customFields === 'string') {
        try { customFields = JSON.parse(customFields); } catch (e) { customFields = {}; }
    }
    const blocks = customFields?.blocks || [];

    const formattedDate = service.createdAt
        ? new Date(service.createdAt).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : undefined;

    return (
        <main className=" bg-background">
            <div className="max-w-5xl mx-auto py-8 md:py-12">
                <div className="space-y-12">
                    {/* Dynamic Blocks */}
                    <div className="space-y-10 pt-6">
                        {blocks.map((block: any, idx: number) => {
                            if (!block.value) return null;

                            switch (block.type) {
                                case "text":
                                    return (
                                        <div key={idx} className="space-y-4">
                                            {block.title && <h2 className="text-3xl text-center mx-auto font-bold text-foreground">{block.title}</h2>}
                                            <div
                                                className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-a:text-primary"
                                                dangerouslySetInnerHTML={{ __html: block.value }}
                                            />
                                        </div>
                                    );

                                case "image":
                                    return (
                                        <div key={idx} className="space-y-4">
                                            {block.title && <h2 className="text-3xl text-center mx-auto font-bold text-foreground">{block.title}</h2>}
                                            <div className="w-full relative aspect-auto rounded-xl overflow-hidden shadow-lg border border-border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={block.value}
                                                    alt={block.title || `Service Block ${idx}`}
                                                    className="w-full h-auto object-contain"
                                                />
                                            </div>
                                        </div>
                                    );

                                case "pdf": {
                                    const pdfUrl = typeof block.value === 'string' ? block.value : block.value?.url;
                                    const pdfTitle = typeof block.value === 'string' ? null : block.value?.title;
                                    if (!pdfUrl) return null;

                                    // Resolve absolute URL
                                    let resolvedPdfUrl = pdfUrl;
                                    if (resolvedPdfUrl.startsWith("public_html/")) resolvedPdfUrl = "/" + resolvedPdfUrl;
                                    if (resolvedPdfUrl.startsWith("/public_html/uploads")) resolvedPdfUrl = resolvedPdfUrl.replace("/public_html/uploads", "/uploads");
                                    
                                    const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://tanzeem.dks.com.pk';
                                    const absolutePdfUrl = resolvedPdfUrl.startsWith('http') 
                                        ? resolvedPdfUrl 
                                        : `${mediaBase.replace(/\/$/, '')}${resolvedPdfUrl.startsWith('/') ? '' : '/'}${resolvedPdfUrl}`;

                                    return (
                                        <div key={idx} className="space-y-4">
                                            <PdfViewerHeader
                                                title={pdfTitle || block.title || service.title}
                                                dateText={formattedDate}
                                                pdfUrl={absolutePdfUrl}
                                                downloadFilename={slug}
                                                downloadButtonText="Download PDF"
                                            />

                                            {/* Inline PDF Viewer */}
                                            <div className="w-full rounded-xl overflow-hidden border border-border shadow-lg bg-black/5">
                                                <iframe
                                                    src={`${absolutePdfUrl}#toolbar=1`}
                                                    className="w-full border-0"
                                                    style={{ height: "82vh", minHeight: "520px" }}
                                                    title={pdfTitle || block.title || "PDF Document"}
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                case "thumbnails":
                                    if (!Array.isArray(block.value) || block.value.length === 0) return null;
                                    return (
                                        <div key={idx} className="space-y-4">
                                            {block.title && <h2 className="text-3xl text-center mx-auto font-bold text-foreground">{block.title}</h2>}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                {block.value.map((thumb: any, tIdx: number) => {
                                                    const isVideo = thumb.url && (thumb.url.includes("youtube.com") || thumb.url.includes("youtu.be") || thumb.url.includes("vimeo") || thumb.url.includes("ok.ru"));
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
                                                            {thumb.title && (
                                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                                    <h3 className="text-white font-medium text-sm line-clamp-2">{thumb.title}</h3>
                                                                </div>
                                                            )}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );

                                case "video": {
                                    // Normalize: support both legacy string and new array format
                                    const rawUrls: string[] = Array.isArray(block.value)
                                        ? block.value
                                        : block.value ? [block.value] : [];
                                    const embedUrls = rawUrls
                                        .filter(Boolean)
                                        .map((u: string) => {
                                            if (u.includes("youtube.com/watch?v=")) return u.replace("watch?v=", "embed/").split("&")[0];
                                            if (u.includes("youtu.be/")) return u.replace("youtu.be/", "youtube.com/embed/").split("?")[0];
                                            if (u.includes("ok.ru/video/")) return u.replace("ok.ru/video/", "ok.ru/videoembed/");
                                            return u;
                                        });
                                    if (embedUrls.length === 0) return null;
                                    return (
                                        <div key={idx} className="space-y-4">
                                            {block.title && <h2 className="text-3xl text-center mx-auto font-bold text-foreground">{block.title}</h2>}
                                            <div className={`grid gap-4 ${embedUrls.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                                                {embedUrls.map((embedUrl: string, vIdx: number) => (
                                                    <div key={vIdx} className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                                                        <iframe
                                                            src={embedUrl}
                                                            className="w-full h-full border-0"
                                                            allowFullScreen
                                                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                case "slider":
                                    if (!Array.isArray(block.value) || block.value.length === 0) return null;
                                    return (
                                        <div key={idx} className="w-full space-y-4">
                                            {block.title && <h2 className="text-3xl text-center mx-auto font-bold text-foreground">{block.title}</h2>}
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
                subheading="Help Tanzeem-e-Islami expand these services and reach more people across the globe."
                buttonLabel="Get Involved"
                buttonUrl="/contact"
            />
        </main>
    );
}
