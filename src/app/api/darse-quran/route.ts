import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { darseQuranEvents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth"; // Based on your auth implementation
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const admin = searchParams.get('admin');

        // Allow fetching all if admin flag is passed, otherwise only published
        const query = admin === 'true'
            ? db.select().from(darseQuranEvents).orderBy(desc(darseQuranEvents.createdAt))
            : db.select().from(darseQuranEvents).where(eq(darseQuranEvents.isPublished, true)).orderBy(desc(darseQuranEvents.createdAt));

        const events = await query;
        return NextResponse.json({ events });
    } catch (error) {
        console.error("Failed to fetch darse quran events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        // Assuming Editor or Admin roles required
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const id = uuidv4();

        await db.insert(darseQuranEvents).values({
            id,
            city: data.city,
            time: data.time,
            address: data.address,
            type: data.type,
            hasLadiesArrangement: Boolean(data.hasLadiesArrangement),
            mudarris: data.mudarris,
            contact: data.contact || null,
            isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        });

        const [newEvent] = await db.select().from(darseQuranEvents).where(eq(darseQuranEvents.id, id));
        return NextResponse.json({ event: newEvent }, { status: 201 });
    } catch (error) {
        console.error("Failed to create event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
