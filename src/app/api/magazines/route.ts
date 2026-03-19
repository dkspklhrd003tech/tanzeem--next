import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magazines } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const allMagazines = await db.select().from(magazines).orderBy(magazines.order, desc(magazines.createdAt));
        return NextResponse.json({ magazines: allMagazines });
    } catch (error) {
        console.error("Failed to fetch magazines:", error);
        return NextResponse.json({ error: "Failed to fetch magazines" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const newId = uuidv4();

        const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + newId.substring(0, 4);

        await db.insert(magazines).values({
            id: newId,
            title: body.title,
            slug: slug,
            issueNumber: body.issueNumber || body.category || "Current Issue",
            coverImage: body.coverImage || null,
            isFeatured: body.isFeatured || false,
            isPublished: true,
            authorId: user.id,
        } as any);

        revalidatePath("/");

        const newMag = await db.select().from(magazines).where(eq(magazines.id, newId));
        return NextResponse.json(newMag[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create magazine:", error);
        return NextResponse.json({ error: "Failed to create magazine" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { orders } = body;

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            for (const item of orders) {
                await tx.update(magazines).set({ order: item.order }).where(eq(magazines.id, item.id));
            }
        });

        revalidatePath("/");
        return NextResponse.json({ success: true, message: "Magazines reordered successfully" });
    } catch (error) {
        console.error("Patch magazines error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
