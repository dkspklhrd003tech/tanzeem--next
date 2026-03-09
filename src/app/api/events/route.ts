import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, asc, count, and, gte } from "drizzle-orm";

// GET - List all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const upcoming = searchParams.get("upcoming");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions: any[] = [];

    if (published === "true") conditions.push(eq(events.isPublished, true));
    if (published === "false") conditions.push(eq(events.isPublished, false));
    if (upcoming === "true") conditions.push(gte(events.startDate, new Date()));

    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`),
          like(events.location, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [eventsData, totalResult] = await Promise.all([
      db.query.events.findMany({
        where: whereClause,
        with: {
          author: { columns: { id: true, name: true } },
        },
        orderBy: [asc(events.startDate)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(events).where(whereClause),
    ]);

    return NextResponse.json({ events: eventsData, total: totalResult[0].count });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    if (!data.title || !data.slug || !data.startDate) {
      return NextResponse.json({ error: "Title, slug, and start date are required" }, { status: 400 });
    }

    const eventId = crypto.randomUUID();

    await db.insert(events).values({
      id: eventId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location,
      address: data.address,
      isOnline: data.isOnline ?? false,
      onlineUrl: data.onlineUrl,
      isPublished: data.isPublished ?? false,
      registrationRequired: data.registrationRequired ?? false,
      registrationUrl: data.registrationUrl,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      authorId: user.id,
    });

    const newEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "event",
      entityId: eventId,
      details: JSON.stringify({ title: data.title }),
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
