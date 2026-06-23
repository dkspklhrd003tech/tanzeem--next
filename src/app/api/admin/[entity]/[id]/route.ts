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
} from "@/db/schema";
import { eq } from "drizzle-orm";
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
    "audio-books": audioBooks,
    magazines,
    campaigns: homeCampaigns,
    locations,
    sermons,
    faqs: faqItems,
    downloads,
    "download-categories": downloadCategories,
    galleries,
    donations: donationCampaigns,
    "social-platforms": socialPlatforms,
    "social-accounts": socialAccounts,
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

async function getItemIdColumn(table: any): Promise<string> {
    return "id";
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string, id: string }> }
) {
    try {
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity, id } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const [item] = await db.select().from(table).where(eq((table as any).id, id)).limit(1);

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ item });
    } catch (error) {
        console.error(`Error fetching ${await params.then(p => p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string, id: string }> }
) {
    try {
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity, id } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        // Check existence first
        const existing = await db.select({ id: (table as any).id }).from(table).where(eq((table as any).id, id)).limit(1);
        if (!existing || existing.length === 0) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const data = await request.json();

        // Check for duplicate slug if slug is being changed
        if (data.slug) {
            const dup = await db.select({ id: (table as any).id })
                .from(table)
                .where(eq((table as any).slug, data.slug))
                .limit(1);
            if (dup.length > 0 && dup[0].id !== id) {
                return NextResponse.json({
                    error: "An item with this slug already exists"
                }, { status: 409 });
            }
        }

        const parsedData = parseDateFields(data);
        await db.update(table).set(parsedData).where(eq((table as any).id, id));
        revalidateEntityPaths(entity);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error updating ${await params.then(p => p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string, id: string }> }
) {
    try {
        const authError = await requireAuth(request);
        if (authError) return authError;

        const { entity, id } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        // Check existence first
        const existing = await db.select({ id: (table as any).id }).from(table).where(eq((table as any).id, id)).limit(1);
        if (!existing || existing.length === 0) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        await db.delete(table).where(eq((table as any).id, id));
        revalidateEntityPaths(entity);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting ${await params.then(p => p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
