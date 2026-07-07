import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { locations, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const data = await request.json();

    await db.update(locations)
      .set({
        name: data.name,
        slug: data.slug,
        city: data.city,
        address: data.address,
        phone: data.phone,
        email: data.email,
        details: data.details,
        country: data.country,
        isActive: data.isActive,
      })
      .where(eq(locations.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "UPDATE_LOCATION",
      entityType: "location",
      entityId: id,
      details: `Updated location ${data.name || id}`,
    });

    const [updated] = await db.select().from(locations).where(eq(locations.id, id));
    if (updated && typeof updated.details === "string") {
      updated.details = JSON.parse(updated.details);
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await db.delete(locations).where(eq(locations.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "DELETE_LOCATION",
      entityType: "location",
      entityId: id,
      details: `Deleted location ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
