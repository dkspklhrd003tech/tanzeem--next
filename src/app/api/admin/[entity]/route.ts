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
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function revalidateEntityPaths(entity: string) {
    try {
        if (entity === "faqs") {
            revalidatePath("/faqs");
            revalidatePath("/faq");
        } else if (entity === "press-releases") {
            revalidatePath("/press-releases");
        } else if (entity === "social-accounts" || entity === "social-platforms") {
            revalidatePath("/social-media");
        } else if (entity === "sermons") {
            revalidatePath("/sermons");
        } else if (entity === "campaigns") {
            revalidatePath("/");
        }
        revalidatePath("/");
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
    magazines,
    campaigns: homeCampaigns,
    locations,
    sermons,
    // ── New entities (Phase 4) ───────────────────────────────────────────────
    faqs: faqItems,
    downloads,
    "download-categories": downloadCategories,
    galleries,
    donations: donationCampaigns,
    "social-platforms": socialPlatforms,
    "social-accounts": socialAccounts,
};

const REQUIRED_FIELDS: Record<string, string[]> = {
    posts: ["title", "content", "slug"],
    audio: ["title", "audioUrl", "slug"],
    videos: ["title", "slug"],
    books: ["title", "slug"],
    "press-releases": ["title", "content", "slug"],
    magazines: ["title", "slug"],
    campaigns: ["title", "slug"],
    events: ["title", "slug", "startDate"],
    sermons: ["title", "slug"],
    faqs: ["question", "answer"],
    downloads: ["title", "slug", "fileUrl"],
    "download-categories": ["name", "slug"],
    galleries: ["title", "slug"],
    donations: ["title", "slug"],
    "social-platforms": ["name", "slug"],
    "social-accounts": ["title", "url"],
};

function parseDateFields(data: any) {
    const dateFields = ["publishedAt", "createdAt", "updatedAt", "startDate", "endDate"];
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
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        let results;
        if (entity === "press-releases") {
            results = await db.select().from(table).orderBy(table.orderIndex, desc(table.publishedAt)).limit(100);
        } else {
            results = await db.select().from(table).orderBy(desc((table as any).updatedAt || (table as any).id)).limit(100);
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
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity } = await params;
        const table = entityMap[entity];

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
        if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
            return NextResponse.json({
                error: "Slug must contain only lowercase letters, numbers, and hyphens"
            }, { status: 400 });
        }

        // Check for duplicate slug
        if (data.slug) {
            const existing = await db.select({ id: (table as any).id })
                .from(table)
                .where(eq((table as any).slug, data.slug))
                .limit(1);
            if (existing.length > 0) {
                return NextResponse.json({
                    error: "An item with this slug already exists"
                }, { status: 409 });
            }
        }

        const parsedData = parseDateFields(data);
        const insertData = {
            id: crypto.randomUUID(),
            ...parsedData,
        };

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
                if (entity === "social-platforms" || entity === "social-accounts") {
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
