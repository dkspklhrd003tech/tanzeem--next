import { notFound } from "next/navigation";
import { db } from "@/db";
import { sermons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SermonDetail } from "@/components/resources/SermonDetail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const sermon = await db.query.sermons.findFirst({
        where: eq(sermons.slug, slug),
    });

    if (!sermon || !sermon.isPublished) {
        return { title: "Sermon Not Found | Tanzeem-e-Islami" };
    }

    const title = sermon.metaTitle || sermon.title;
    const description = sermon.metaDescription ?? undefined;

    return {
        title: `${title} | Tanzeem-e-Islami`,
        description,
        openGraph: {
            title,
            description,
            ...(sermon.thumbnailUrl ? { images: [{ url: sermon.thumbnailUrl }] } : {}),
        },
    };
}

export default async function SermonDetailPage({ params }: Props) {
    const { slug } = await params;
    const sermon = await db.query.sermons.findFirst({
        where: eq(sermons.slug, slug),
    });

    if (!sermon || !sermon.isPublished) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background">
            <SermonDetail sermon={sermon} />
        </main>
    );
}
