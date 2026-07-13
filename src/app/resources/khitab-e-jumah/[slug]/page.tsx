import { notFound } from "next/navigation";
import { db } from "@/db";
import { khitabAudios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AudioDetail } from "@/components/resources/AudioDetail"; // Assuming there is an AudioDetail or we can pass it to SermonDetail for now. Wait, I should check if AudioDetail exists.
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const sermon = await db.query.khitabAudios.findFirst({
        where: eq(khitabAudios.slug, slug),
    });

    if (!sermon || !sermon.isPublished) {
        return { title: "Audio Not Found | Tanzeem-e-Islami" };
    }

    const title = sermon.title;
    const description = sermon.description ?? undefined;

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
    const sermon = await db.query.khitabAudios.findFirst({
        where: eq(khitabAudios.slug, slug),
    });

    if (!sermon || !sermon.isPublished) {
        notFound();
    }

    return (
        <main className=" bg-background">
            <h1 className="sr-only">{sermon.title}</h1>
            <AudioDetail audio={sermon} backHref={`/resources/khitab-e-jumah/`} backLabel="Back to Categories" />
        </main>
    );
}
