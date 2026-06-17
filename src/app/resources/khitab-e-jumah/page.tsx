import { db } from "@/db";
import { sermons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SermonsList } from "@/components/resources/SermonsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Khitab-e-Jum'ah | Tanzeem-e-Islami",
    description: "Friday sermons (Khitab-e-Jum'ah) by Tanzeem-e-Islami leaders. Listen to weekly Jumu'ah addresses on Islam, current affairs, and spiritual guidance.",
    openGraph: {
        title: "Khitab-e-Jum'ah | Tanzeem-e-Islami",
        description: "Friday sermons (Khitab-e-Jum'ah) by Tanzeem-e-Islami leaders.",
    },
};

export default async function KhitabEJumahPage() {
    const data = await db
        .select()
        .from(sermons)
        .where(eq(sermons.isPublished, true))
        .orderBy(desc(sermons.sermonDate));

    return (
        <main className="min-h-screen bg-background">
            <SermonsList sermons={data} />
        </main>
    );
}
