import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magazines } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const allMagazines = await db.select().from(magazines).orderBy(desc(magazines.createdAt));
        return NextResponse.json({ magazines: allMagazines });
    } catch (error) {
        console.error("Failed to fetch magazines:", error);
        return NextResponse.json({ error: "Failed to fetch magazines" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newId = uuidv4();

        const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + newId.substring(0, 4);

        await db.insert(magazines).values({
            id: newId,
            title: body.title,
            slug: slug,
            issueNumber: body.category || "Monthly",
            coverImage: body.coverImage || null,
            isFeatured: body.isFeatured || false,
            isPublished: true,
            authorId: "admin",
        } as any); // Using 'any' here as 'category' might not exist on magazines but we might map it to something else

        const newMag = await db.select().from(magazines).where(eq(magazines.id, newId));
        return NextResponse.json(newMag[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create magazine:", error);
        return NextResponse.json({ error: "Failed to create magazine" }, { status: 500 });
    }
}
