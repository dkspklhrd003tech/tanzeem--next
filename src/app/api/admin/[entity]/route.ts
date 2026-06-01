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
import { eq, desc } from "drizzle-orm";
// Assume a simple mock auth for now since getCurrentUser might be in lib/auth which we don't have exact path context for yet
// import { getCurrentUser } from "@/lib/auth";

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    try {
        const { entity } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        // Ideally add auth check here:
        // const user = await getCurrentUser(request);
        // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Using any type to bypass strict drizzle typing dynamically
        const results = await db.select().from(table).orderBy(desc((table as any).updatedAt || (table as any).id)).limit(100);

        return NextResponse.json({ items: results });
    } catch (error) {
        console.error(`Error fetching ${await params.then(p=>p.entity)}:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    try {
        const { entity } = await params;
        const table = entityMap[entity];

        if (!table) {
            return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
        }

        const data = await request.json();

        // In a real app: Validate data against schema

        // Provide standard defaults if missing
        const insertData = {
            id: crypto.randomUUID(),
            ...data,
            // Only add timestamp if the column is expected, but drizzle handles defaultNow()
        };

        await db.insert(table).values(insertData);

        return NextResponse.json({ success: true, id: insertData.id });
    } catch (error) {
        console.error(`Error creating ${await params.then(p=>p.entity)}:`, error);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}
