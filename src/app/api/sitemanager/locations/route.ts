import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { locations, activityLogs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(locations).orderBy(asc(locations.name));
    return NextResponse.json({ locations: rows });
  } catch (error) {
    console.error("GET locations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const id = crypto.randomUUID();

    await db.insert(locations).values({
      id,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      city: data.city || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      country: data.country || "Pakistan",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "CREATE_LOCATION",
      entityType: "location",
      entityId: id,
      details: `Created location ${data.name}`,
    });

    const [created] = await db.select().from(locations).where(eq(locations.id, id));
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
