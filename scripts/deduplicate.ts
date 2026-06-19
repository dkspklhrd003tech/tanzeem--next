import { db } from "../src/lib/db";
import { pages, pageSections } from "../src/db/schema";
import { inArray, eq } from "drizzle-orm";

const PREFERRED_SLUGS = [
  "organization/background",
  "organization/mission-statement",
  "organization/our-ideology",
  "organization/the-founder",
  "organization/the-ameer",
  "organization/history",
  "organization/introduction",
  "education/ruju-ilal-quran",
  "education/distance-learning",
  "resources/audios",
  "resources/videos",
  "resources/books",
  "resources/magazines",
  "resources/press",
  "contact",
  "faqs"
];

const TITLE_GROUPS: Record<string, string[]> = {
  "founder": ["the founder", "founder"],
  "ameer": ["the ameer", "ameer"],
  "contact": ["contact us", "contact"],
  "ruju": ["ruju ilal quran"],
  "distance": ["distance learning"],
  "audio": ["audio library", "resources audios"],
  "video": ["video library"],
  "books": ["books", "books & publications"],
  "magazines": ["magazines"],
  "press": ["press releases", "resources press", "press"],
  "history": ["history"],
  "introduction": ["introduction"],
  "background": ["background"],
  "mission": ["mission statement", "our mission"],
  "ideology": ["our ideology"]
};

async function main() {
    console.log("Fetching all pages...");
    const allPages = await db.select().from(pages);
    console.log(`Found ${allPages.length} pages in database.`);

    // Map each page to a group key if it matches, otherwise use its slug
    const grouped: Record<string, typeof allPages> = {};

    for (const page of allPages) {
        const titleNorm = page.title.toLowerCase().trim();
        let groupKey = `slug:${page.slug.toLowerCase().trim()}`;

        // Check if the title belongs to any defined TITLE_GROUPS
        for (const [key, titles] of Object.entries(TITLE_GROUPS)) {
            if (titles.includes(titleNorm)) {
                groupKey = `group:${key}`;
                break;
            }
        }

        if (!grouped[groupKey]) {
            grouped[groupKey] = [];
        }
        grouped[groupKey].push(page);
    }

    const idsToDelete: string[] = [];

    for (const [groupKey, list] of Object.entries(grouped)) {
        if (list.length > 1) {
            console.log(`Duplicate group found for "${groupKey}": ${list.length} entries.`);
            
            // Rank the list to choose which one to keep
            const sorted = [...list].sort((a, b) => {
                // Rank 1: Is in PREFERRED_SLUGS list?
                const aPrefIndex = PREFERRED_SLUGS.indexOf(a.slug);
                const bPrefIndex = PREFERRED_SLUGS.indexOf(b.slug);
                
                if (aPrefIndex !== -1 && bPrefIndex === -1) return -1;
                if (bPrefIndex !== -1 && aPrefIndex === -1) return 1;
                if (aPrefIndex !== -1 && bPrefIndex !== -1) return aPrefIndex - bPrefIndex;

                // Rank 2: Has a slash in the slug (nested)?
                const aHasSlash = a.slug.includes("/");
                const bHasSlash = b.slug.includes("/");
                if (aHasSlash && !bHasSlash) return -1;
                if (bHasSlash && !aHasSlash) return 1;

                // Rank 3: Newest updatedAt date
                const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return dateB - dateA;
            });

            const keep = sorted[0];
            console.log(`  Keeping ID ${keep.id} ("${keep.title}", slug: "${keep.slug}", updated: ${keep.updatedAt})`);

            for (let i = 1; i < sorted.length; i++) {
                idsToDelete.push(sorted[i].id);
                console.log(`  To Delete ID ${sorted[i].id} ("${sorted[i].title}", slug: "${sorted[i].slug}", updated: ${sorted[i].updatedAt})`);
            }
        }
    }

    if (idsToDelete.length === 0) {
        console.log("No duplicate pages found.");
        return;
    }

    console.log(`Deleting associated sections for ${idsToDelete.length} duplicate pages...`);
    const chunkSize = 50;
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        await db.delete(pageSections).where(inArray(pageSections.pageId, chunk));
    }

    console.log(`Deleting ${idsToDelete.length} duplicate page entries...`);
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        await db.delete(pages).where(inArray(pages.id, chunk));
    }

    console.log("Deduplication complete!");
}

main().catch(console.error).finally(() => process.exit(0));
