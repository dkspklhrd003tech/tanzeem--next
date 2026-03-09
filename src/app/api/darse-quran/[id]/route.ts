import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { darseQuranEvents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const id = params.id;
        const data = await request.json();

        await db.update(darseQuranEvents)
            .set({
                city: data.city,
                time: data.time,
                address: data.address,
                type: data.type,
                hasLadiesArrangement: Boolean(data.hasLadiesArrangement),
                mudarris: data.mudarris,
                contact: data.contact,
                isPublished: Boolean(data.isPublished),
                updatedAt: new Date(),
            })
            .where(eq(darseQuranEvents.id, id));

        const [updated] = await db.select().from(darseQuranEvents).where(eq(darseQuranEvents.id, id));
        return NextResponse.json({ event: updated });
    } catch (error) {
        console.error("Failed to update event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const id = params.id;

        await db.delete(darseQuranEvents).where(eq(darseQuranEvents.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
