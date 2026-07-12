import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { menuItems, activityLogs } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * PUT /api/sitemanager/menu/reorder
 * Body: { location: string, items: FlatItem[] }
 * FlatItem: { id, label, url, parentId, order, isOpenInNew, isVisible, menuType }
 *
 * Replaces all items for the given location with the provided flat list.
 * New items (id starting with "new-") get a fresh UUID.
 */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { location, items } = await req.json() as {
    location: string;
    items: Array<{
      id: string; label: string; url?: string | null;
      parentId?: string | null; order: number;
      isOpenInNew?: boolean; isVisible?: boolean; menuType?: string;
    }>;
  };

  if (!location || !Array.isArray(items)) {
    return NextResponse.json({ error: "location and items are required" }, { status: 400 });
  }

  // Map new temp IDs → real UUIDs so parent references stay consistent
  const idMap: Record<string, string> = {};
  for (const item of items) {
    idMap[item.id] = item.id.startsWith("new-") ? crypto.randomUUID() : item.id;
  }

  // Delete all existing items for this location
  await db.delete(menuItems).where(eq(menuItems.menuType, location));

  // Re-insert with correct IDs and resolved parentIds
  if (items.length > 0) {
    await db.insert(menuItems).values(
      items.map((item) => ({
        id:          idMap[item.id],
        label:       item.label,
        url:         item.url ?? null,
        parentId:    item.parentId ? (idMap[item.parentId] ?? item.parentId) : null,
        order:       item.order,
        isOpenInNew: item.isOpenInNew ?? false,
        isVisible:   item.isVisible ?? true,
        menuType:    location,
      }))
    );
  }

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(), userId: user.id,
    action: "MENU_REORDER", entityType: "menu",
    entityId: location,
    details: `Saved ${items.length} items for "${location}" menu`,
  });

  return NextResponse.json({ success: true, count: items.length });
}
