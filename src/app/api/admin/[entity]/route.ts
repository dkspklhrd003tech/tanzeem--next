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
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

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
};

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

        const results = await db.select().from(table).orderBy(desc((table as any).updatedAt || (table as any).id)).limit(100);

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

        const insertData = {
            id: crypto.randomUUID(),
            ...data,
        };

        await db.insert(table).values(insertData);

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
