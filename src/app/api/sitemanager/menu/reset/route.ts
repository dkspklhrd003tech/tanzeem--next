import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuItems, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_MENU_HEADER } from "@/lib/menu-defaults";

export const dynamic = "force-dynamic";

/**
 * POST /api/sitemanager/menu/reset
 * Body: { location: "header" | "footer" | "social" }
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { location } = await req.json() as { location: string };
  if (!location) return NextResponse.json({ error: "location is required" }, { status: 400 });

  if (location !== "header") {
    return NextResponse.json({ error: "Reset only supported for header menu" }, { status: 400 });
  }

  // Flatten the nested default structure with stable UUIDs
  const flat: Array<{
    id: string; label: string; url: string | null;
    parentId: string | null; order: number;
    isOpenInNew: boolean; isVisible: boolean; menuType: string;
  }> = [];

  function flatten(nodes: typeof DEFAULT_MENU_HEADER, parentId: string | null = null) {
    nodes.forEach((node, i) => {
      flat.push({
        id:          node.id,
        label:       node.label,
        url:         node.url ?? null,
        parentId,
        order:       i,
        isOpenInNew: node.external ?? false,
        isVisible:   true,
        menuType:    "header",
      });
      if (node.children?.length) flatten(node.children, node.id);
    });
  }

  flatten(DEFAULT_MENU_HEADER);

  await db.delete(menuItems).where(eq(menuItems.menuType, "header"));
  await db.insert(menuItems).values(flat);

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(), userId: user.id,
    action: "MENU_RESET", entityType: "menu", entityId: "header",
    details: `Reset header menu to defaults (${flat.length} items)`,
  });

  return NextResponse.json({ success: true, count: flat.length });
}
