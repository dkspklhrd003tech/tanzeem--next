import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    posts,
    audio,
    videos,
    books,
    teamMembers,
    events,
    pressReleases,
    audioBooks,
    magazines,
    homeCampaigns,
    locations,
    sermons,
    faqItems,
    downloads,
    downloadCategories,
    galleries,
    donationCampaigns,
    socialPlatforms,
    socialAccounts,
    bookCategories,
    videoCategories,
    audioCategories,
    speakers,
    campaigns,
    services,
    sermonCategories,
    khitabAudios,
    khitabAudioCategories,
    forms,
    formFields,
    formEmailConfigs,
    emailLogs,
    formSubmissions,
} from "@/db/schema";
import { eq, desc, asc, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function revalidateEntityPaths(entity: string) {
    try {
        if (entity === "faqs") {
            revalidatePath("/faqs");
            revalidatePath("/faq");
        } else if (entity === "press-releases") {
            revalidatePath("/press-releases");
        } else if (entity === "audio-books") {
            revalidatePath("/audio-books");
        } else if (entity === "social-accounts" || entity === "social-platforms") {
            revalidatePath("/social-media");
        } else if (entity === "sermons" || entity === "sermon-categories") {
            revalidatePath("/resources/khitab-e-jumah");
            revalidatePath("/khitab-e-jumah");
        } else if (entity === "campaigns") {
            revalidatePath("/");
            revalidatePath("/campaigns");
            revalidatePath("/[slug]", "page");
        } else if (entity === "services") {
            revalidatePath("/");
            revalidatePath("/services");
            revalidatePath("/[slug]", "page");
        } else if (entity === "book-categories" || entity === "books") {
            revalidatePath("/books-by-category");
            revalidatePath("/books");
        } else if (entity === "videos" || entity === "video-categories" || entity === "speakers" || entity === "audio") {
            revalidatePath("/videos");
            revalidatePath("/videos-by-category");
            revalidatePath("/videos-by-speakers");
            revalidatePath("/audios-by-speaker");
        }
        revalidatePath("/", "layout");
        revalidatePath("/", "page");
    } catch (e) {
        console.error("Revalidation failed:", e);
    }
}

const entityMap: Record<string, any> = {
    posts,
    audio,
    videos,
    books,
    team: teamMembers,
    events,
    "press-releases": pressReleases,
    "audio-books": audioBooks,
    magazines,
    "home-campaigns": homeCampaigns,
    campaigns: campaigns,
    services: services,
    locations,
    sermons,
    "sermon-categories": sermonCategories,
    "khitab-audios": khitabAudios,
    "khitab-audio-categories": khitabAudioCategories,
    // ── New entities (Phase 4) ───────────────────────────────────────────────
    faqs: faqItems,
    downloads,
    "download-categories": downloadCategories,
    galleries,
    donations: donationCampaigns,
    "social-platforms": socialPlatforms,
    "social-accounts": socialAccounts,
    "book-categories": bookCategories,
    "video-categories": videoCategories,
    "audio-categories": audioCategories,
    speakers,
    forms,
    "form-fields": formFields,
    "form-email-configs": formEmailConfigs,
    "email-logs": emailLogs,
    "form-submissions": formSubmissions,
};

const REQUIRED_FIELDS: Record<string, string[]> = {
    posts: ["title", "content", "slug"],
    audio: ["title", "audioUrl", "slug"],
    videos: ["title", "slug"],
    books: ["title", "slug"],
    "press-releases": ["title", "slug"],
    "audio-books": ["title", "content", "slug"],
    magazines: ["title", "slug"],
    "home-campaigns": ["title", "slug"],
    campaigns: ["title", "slug"],
    services: ["title", "slug"],
    events: ["title", "slug", "startDate"],
    sermons: ["title", "slug"],
    faqs: ["question", "answer"],
    downloads: ["title", "slug", "fileUrl"],
    "download-categories": ["name", "slug"],
    galleries: ["title", "slug"],
    donations: ["title", "slug"],
    "social-platforms": ["name", "slug"],
    "social-accounts": ["title", "url"],
    "book-categories": ["name", "slug"],
    "video-categories": ["name", "slug"],
    "audio-categories": ["name", "slug"],
    "sermon-categories": ["name", "slug"],
    speakers: ["name", "slug"],
    forms: ["name", "slug"],
    "form-fields": ["type", "label"],
    "form-email-configs": ["subject", "targetEmail", "templateHtml"],
    "email-logs": ["sentTo", "status"],
};

function parseDateFields(data: any) {
    const dateFields = ["publishedAt", "createdAt", "updatedAt", "startDate", "endDate", "startsAt", "endsAt"];
    const parsed = { ...data };
    for (const field of dateFields) {
        if (parsed[field] !== undefined) {
            if (parsed[field]) {
                const date = new Date(parsed[field]);
                parsed[field] = isNaN(date.getTime()) ? null : date;
            } else {
                parsed[field] = null;
            }
        }
    }
    return parsed;
}

async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    try {
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity } = await params;
        const normalizedEntity = entity.toLowerCase();
        const table = entityMap[normalizedEntity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type");
        const speakerId = searchParams.get("speakerId");
        const categoryId = searchParams.get("categoryId");
        const limitParam = searchParams.get("limit");

        // Determine query limit:
        // Media entities need high limit so admin can see, manage, search, and reorder all items
        const mediaEntities = [
            "audio",
            "videos",
            "books",
            "magazines",
            "audio-books",
            "sermons",
            "khitab-audios",
            "speakers",
            "book-categories",
            "video-categories",
            "audio-categories",
        ];

        let queryLimit: number | null = null;
        if (limitParam === "all" || limitParam === "0" || limitParam === "-1") {
            queryLimit = null; // No limit
        } else if (limitParam) {
            const parsed = parseInt(limitParam, 10);
            queryLimit = isNaN(parsed) ? 100 : parsed;
        } else if (mediaEntities.includes(normalizedEntity) || speakerId || categoryId) {
            queryLimit = 10000; // Safe high ceiling for admin media lists
        } else {
            queryLimit = 100;
        }

        // Build where conditions
        const conditions: any[] = [];
        if (type && (table as any).type) {
            conditions.push(eq((table as any).type, type));
        }
        if (speakerId && (table as any).speakerId) {
            conditions.push(eq((table as any).speakerId, speakerId));
        }
        if (categoryId && (table as any).categoryId) {
            conditions.push(eq((table as any).categoryId, categoryId));
        }

        let query = db.select().from(table);
        if (conditions.length === 1) {
            query = query.where(conditions[0]) as any;
        } else if (conditions.length > 1) {
            query = query.where(and(...conditions)) as any;
        }

        // Determine ordering
        if (normalizedEntity === "press-releases") {
            query = query.orderBy((table as any).orderIndex || (table as any).order || (table as any).id, desc(table.publishedAt)) as any;
        } else if (normalizedEntity === "speakers") {
            query = query.orderBy(asc((table as any).order || (table as any).id), asc((table as any).name || (table as any).id)) as any;
        } else if (normalizedEntity === "services") {
            query = query.orderBy(asc((table as any).order || (table as any).id)) as any;
        } else if (normalizedEntity === "campaigns") {
            query = query.orderBy(asc((table as any).orderIndex || (table as any).id)) as any;
        } else if ((table as any).order !== undefined) {
            query = query.orderBy(asc((table as any).order)) as any;
        } else {
            query = query.orderBy(desc((table as any).updatedAt || (table as any).createdAt || (table as any).id)) as any;
        }

        if (queryLimit !== null) {
            query = query.limit(queryLimit) as any;
        }

        let results = await query;

        // Augment counts for speakers
        if (normalizedEntity === "speakers") {
            const [audioCounts, videoCounts] = await Promise.all([
                db.select({ speakerId: audio.speakerId, count: count() }).from(audio).groupBy(audio.speakerId),
                db.select({ speakerId: videos.speakerId, count: count() }).from(videos).groupBy(videos.speakerId),
            ]);
            const audioMap: Record<string, number> = {};
            for (const r of audioCounts) {
                if (r.speakerId) audioMap[r.speakerId] = Number(r.count);
            }
            const videoMap: Record<string, number> = {};
            for (const r of videoCounts) {
                if (r.speakerId) videoMap[r.speakerId] = Number(r.count);
            }
            results = results.map((sp: any) => ({
                ...sp,
                audioCount: audioMap[sp.id] ?? 0,
                videoCount: videoMap[sp.id] ?? 0,
            }));
        }

        // Augment counts for categories
        if (normalizedEntity === "book-categories") {
            const bCounts = await db.select({ categoryId: books.categoryId, count: count() }).from(books).groupBy(books.categoryId);
            const bMap: Record<string, number> = {};
            for (const r of bCounts) {
                if (r.categoryId) bMap[r.categoryId] = Number(r.count);
            }
            results = results.map((cat: any) => ({
                ...cat,
                bookCount: bMap[cat.id] ?? 0,
                itemCount: bMap[cat.id] ?? 0,
            }));
        } else if (normalizedEntity === "video-categories") {
            const vCounts = await db.select({ categoryId: videos.categoryId, count: count() }).from(videos).groupBy(videos.categoryId);
            const vMap: Record<string, number> = {};
            for (const r of vCounts) {
                if (r.categoryId) vMap[r.categoryId] = Number(r.count);
            }
            results = results.map((cat: any) => ({
                ...cat,
                videoCount: vMap[cat.id] ?? 0,
                itemCount: vMap[cat.id] ?? 0,
            }));
        } else if (normalizedEntity === "audio-categories") {
            const aCounts = await db.select({ categoryId: audio.categoryId, count: count() }).from(audio).groupBy(audio.categoryId);
            const aMap: Record<string, number> = {};
            for (const r of aCounts) {
                if (r.categoryId) aMap[r.categoryId] = Number(r.count);
            }
            results = results.map((cat: any) => ({
                ...cat,
                audioCount: aMap[cat.id] ?? 0,
                itemCount: aMap[cat.id] ?? 0,
            }));
        }

        return NextResponse.json({ items: results });
    } catch (error) {
        console.error(`Error fetching ${await params.then(p => p.entity)}:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    try {
        const userError = await requireAuth(request);
        if (userError) return userError;

        // Retrieve user to use for authorId
        const user = await getCurrentUser(request);

        const { entity } = await params;
        const table = entityMap[entity.toLowerCase()];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const data = await request.json();

        // Validate required fields
        const required = REQUIRED_FIELDS[entity] || [];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            return NextResponse.json({
                error: `Missing required fields: ${missing.join(", ")}`
            }, { status: 400 });
        }

        // Validate slug format if present
        if (data.slug && !/^[a-zA-Z0-9-/_.:?=&]+$/.test(data.slug)) {
            return NextResponse.json({
                error: "Slug contains invalid characters. Only letters, numbers, hyphens, slashes, and basic URL characters are allowed."
            }, { status: 400 });
        }

        // Ensure unique slug
        if (data.slug) {
            let baseSlug = data.slug;
            let currentSlug = baseSlug;
            let counter = 1;

            while (true) {
                const existing = await db.select({ id: (table as any).id })
                    .from(table)
                    .where(eq((table as any).slug, currentSlug))
                    .limit(1);

                if (existing.length === 0) {
                    data.slug = currentSlug;
                    break;
                }
                currentSlug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        const parsedData = parseDateFields(data);
        const insertData = {
            id: crypto.randomUUID(),
            ...parsedData,
        };

        // Add authorId if the table expects it
        if (entity === "posts" || entity === "audio" || entity === "videos" || entity === "books" || entity === "press-releases" || entity === "audio-books" || entity === "magazines" || entity === "campaigns" || entity === "home-campaigns" || entity === "sermons" || entity === "services" || entity === "events") {
            insertData.authorId = user?.id || "system";
        }

        await db.insert(table).values(insertData);
        revalidateEntityPaths(entity);

        return NextResponse.json({ success: true, id: insertData.id });
    } catch (error: any) {
        console.error(`Error creating ${await params.then(p => p.entity)}:`, error);
        // Handle unique constraint violations from DB
        if (error?.code === 'ER_DUP_ENTRY' || error?.message?.includes('duplicate key')) {
            return NextResponse.json({
                error: "An item with this slug already exists"
            }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    try {
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const body = await request.json();
        const { orders } = body; // Expected: [{ id: string, orderIndex: number }, ...]

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            for (const item of orders) {
                const updateFields: Record<string, any> = {};
                // Dynamically check if the table has 'order' or 'orderIndex'
                if ((table as any).order) {
                    updateFields.order = item.orderIndex;
                } else {
                    updateFields.orderIndex = item.orderIndex;
                }
                await tx.update(table).set(updateFields).where(eq((table as any).id, item.id));
            }
        });
        revalidateEntityPaths(entity);

        return NextResponse.json({ success: true, message: `${entity} reordered successfully` });
    } catch (error) {
        console.error(`Patch ${await params.then(p => p.entity)} error:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
