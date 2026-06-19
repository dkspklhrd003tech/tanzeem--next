import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuItems, activityLogs } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sanitizeUrl } from "@/lib/security";

export const dynamic = "force-dynamic";

// ── GET /api/sitemanager/menu?location=header ─────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") ?? "header";

  const rows = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuType, location))
    .orderBy(asc(menuItems.order));

  return NextResponse.json({ items: rows });
}

// ── POST /api/sitemanager/menu — add a single item ────────────────────────────
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  if (!data.label) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  const id = crypto.randomUUID();
  // Sanitize the URL: drops javascript:/data: schemes (returns null when unsafe).
  const safeUrl = data.url ? sanitizeUrl(data.url) : null;
  await db.insert(menuItems).values({
    id,
    label:       data.label,
    url:         safeUrl,
    parentId:    data.parentId ?? null,
    order:       data.order ?? 0,
    isOpenInNew: data.isOpenInNew ?? false,
    isVisible:   data.isVisible ?? true,
    menuType:    data.menuType ?? "header",
  });

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(), userId: user.id,
    action: "MENU_CREATE", entityType: "menu_item", entityId: id,
    details: `Added menu item "${data.label}"`,
  });

  const [created] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return NextResponse.json({ item: created }, { status: 201 });
}
