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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string, id: string }> }
) {
    try {
        const { entity, id } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const data = await request.json();

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
        const { entity, id } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        await db.delete(table).where(eq((table as any).id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting ${await params.then(p=>p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
