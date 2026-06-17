import { db } from '../src/db';
import { sermons } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const SERMON_SEEDS = [
    {
        id: crypto.randomUUID(),
        title: "Iqamat-e-Deen — Hamari Zimmedari",
        slug: "iqamat-e-deen-hamari-zimmedari",
        speakerName: "Shujauddin Sheikh",
        sermonDate: new Date("2025-01-03"),
        audioUrl: "https://tanzeem.org/audio/khitab-2025-01-03.mp3",
        videoUrl: null,
        thumbnailUrl: null,
        description: "<p>Friday sermon on the obligation of establishing Deen.</p>",
        isPublished: true,
    },
    {
        id: crypto.randomUUID(),
        title: "Quran Aur Hamara Taluq",
        slug: "quran-aur-hamara-taluq",
        speakerName: "Shujauddin Sheikh",
        sermonDate: new Date("2025-01-10"),
        audioUrl: null,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        description: "<p>Friday sermon on our relationship with the Quran.</p>",
        isPublished: true,
    },
    {
        id: crypto.randomUUID(),
        title: "Sabr Aur Shukr — Islamic Perspective",
        slug: "sabr-aur-shukr-islamic-perspective",
        speakerName: "Dr. Israr Ahmed",
        sermonDate: new Date("2010-04-02"),
        audioUrl: "https://tanzeem.org/audio/dr-israr-sabr-shukr.mp3",
        videoUrl: "https://www.youtube.com/watch?v=abc123example",
        thumbnailUrl: null,
        description: "<p>Classic sermon by Dr. Israr Ahmed on patience and gratitude.</p>",
        isPublished: true,
    },
];

async function seedSermons() {
    console.log("🌱 Seeding Sermons (Khitab-e-Jum'ah)...");
    for (const sermon of SERMON_SEEDS) {
        const existing = await db
            .select({ id: sermons.id })
            .from(sermons)
            .where(eq(sermons.slug, sermon.slug))
            .limit(1);
        if (existing.length === 0) {
            await db.insert(sermons).values(sermon);
            console.log(`✅ Inserted: ${sermon.slug}`);
        } else {
            console.log(`⏭️  Skipped (exists): ${sermon.slug}`);
        }
    }
    console.log("✅ Sermons seeded successfully!");
}

seedSermons().catch(console.error);
