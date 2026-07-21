import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientShareButton } from "@/components/shared/ClientShareButton";
import { PdfViewerHeader } from "@/components/shared/PdfViewerHeader";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    // We fetch the 4 known magazine setting keys
    const settingKeys = [
        "magazine_links_31c629e7-cad9-41e8-8c3f-ca442337925c", // meesaq
        "magazine_links_94a5dcc9-70c6-46aa-88f0-3334f1716b36", // hikmat-e-quran
        "magazine_links_74417c7d-4664-479c-890c-07073e9f8510", // nida-e-khilafat
        "magazine_links_a1bc3371-0e89-4662-8440-3794ebccc9f3", // perspective
    ];

    const result = await db.select().from(settings).where(inArray(settings.key, settingKeys));

    let targetLink: any = null;
    for (const row of result) {
        if (row.value) {
            try {
                const links = JSON.parse(row.value);
                const match = links.find((l: any) => l.slug === slug && l.isActive);
                if (match) {
                    targetLink = match;
                    break;
                }
            } catch { }
        }
    }

    if (!targetLink) {
        return { title: "Not Found | Tanzeem-e-Islami" };
    }

    return {
        title: `${targetLink.title} | Magazine`,
        description: `Read the magazine: ${targetLink.title}`,
    };
}

export default async function MagazineDetailsPage({ params }: PageProps) {
    const { slug } = await params;

    const settingKeys = [
        "magazine_links_31c629e7-cad9-41e8-8c3f-ca442337925c", // meesaq
        "magazine_links_94a5dcc9-70c6-46aa-88f0-3334f1716b36", // hikmat-e-quran
        "magazine_links_74417c7d-4664-479c-890c-07073e9f8510", // nida-e-khilafat
        "magazine_links_a1bc3371-0e89-4662-8440-3794ebccc9f3", // perspective
    ];

    const result = await db.select().from(settings).where(inArray(settings.key, settingKeys));

    let targetLink: any = null;
    for (const row of result) {
        if (row.value) {
            try {
                const links = JSON.parse(row.value);
                const match = links.find((l: any) => l.slug === slug && l.isActive);
                if (match) {
                    targetLink = match;
                    break;
                }
            } catch { }
        }
    }

    if (!targetLink) {
        notFound();
    }

    return (
        <main className=" bg-zinc-50/50">
            <div className="container mx-auto py-10 flex flex-col items-center mt-4">
                <div className="w-full max-w-5xl mb-6">
                    {targetLink.url?.endsWith(".pdf") ? (
                        <PdfViewerHeader
                            title={targetLink.title}
                            pdfUrl={targetLink.url}
                            downloadFilename={targetLink.title.replace(/[^a-zA-Z0-9]/g, "-")}
                            downloadButtonText="Download PDF"
                        />
                    ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                {targetLink.title}
                            </h1>
                            <div className="flex items-center gap-2">
                                <ClientShareButton variant="icon" />
                            </div>
                        </div>
                    )}
                </div>

                {targetLink.url ? (
                    <div className="w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden border border-border shadow-xl bg-white relative">
                        <iframe
                            src={targetLink.url}
                            className="w-full h-full border-none"
                            title={targetLink.title}
                            allow="autoplay; fullscreen"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border w-full max-w-5xl">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">Document URL not available.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
