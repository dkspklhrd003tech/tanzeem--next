import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { homeSliders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        await db
            .update(homeSliders)
            .set({
                ...body,
                updatedAt: new Date()
            })
            .where(eq(homeSliders.id, id));

        const updated = await db
            .select()
            .from(homeSliders)
            .where(eq(homeSliders.id, id));

        if (!updated.length) {
            return NextResponse.json({ error: "Slider not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Failed to update slider:", error);
        return NextResponse.json({ error: "Failed to update slider" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.delete(homeSliders).where(eq(homeSliders.id, id));

        return NextResponse.json({ success: true, message: "Slider deleted" });
    } catch (error) {
        console.error("Failed to delete slider:", error);
        return NextResponse.json({ error: "Failed to delete slider" }, { status: 500 });
    }
}
