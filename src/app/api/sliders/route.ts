import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { homeSliders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const sliders = await db
            .select()
            .from(homeSliders)
            .orderBy(desc(homeSliders.order), desc(homeSliders.createdAt));

        return NextResponse.json(sliders);
    } catch (error) {
        console.error("Failed to fetch sliders:", error);
        return NextResponse.json({ error: "Failed to fetch sliders" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, imageUrl, linkUrl, order, isActive } = body;

        const { v4: uuidv4 } = require('uuid');
        const newId = uuidv4();

        await db.insert(homeSliders).values({
            id: newId,
            title,
            imageUrl,
            linkUrl: linkUrl || null,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        const newSlider = await db
            .select()
            .from(homeSliders)
            .where(eq(homeSliders.id, newId));

        return NextResponse.json(newSlider[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create slider:", error);
        return NextResponse.json({ error: "Failed to create slider" }, { status: 500 });
    }
}

// PATCH - Bulk reorder sliders (drag-and-drop)
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { orders } = body as { orders: { id: string; order: number }[] };

        if (!Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await Promise.all(
            orders.map(({ id, order }) =>
                db.update(homeSliders).set({ order }).where(eq(homeSliders.id, id))
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to reorder sliders:", error);
        return NextResponse.json({ error: "Failed to reorder sliders" }, { status: 500 });
    }
}
