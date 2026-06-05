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
} from "@/db/schema";
import { eq } from "drizzle-orm";
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
};

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
        console.error(`Error fetching ${await params.then(p=>p.entity)}:`, error);
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

        await db.update(table).set(data).where(eq((table as any).id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error updating ${await params.then(p=>p.entity)}:`, error);
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting ${await params.then(p=>p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
