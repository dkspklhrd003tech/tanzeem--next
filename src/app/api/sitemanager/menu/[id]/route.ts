import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuItems, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

// ── PUT /api/sitemanager/menu/[id] ────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(menuItems).set({
    label:       data.label       ?? existing.label,
    url:         data.url         !== undefined ? data.url         : existing.url,
    parentId:    data.parentId    !== undefined ? data.parentId    : existing.parentId,
    order:       data.order       ?? existing.order,
    isOpenInNew: data.isOpenInNew ?? existing.isOpenInNew,
    isVisible:   data.isVisible   ?? existing.isVisible,
    menuType:    data.menuType    ?? existing.menuType,
  }).where(eq(menuItems.id, id));

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(), userId: user.id,
    action: "MENU_UPDATE", entityType: "menu_item", entityId: id,
    details: `Updated menu item "${data.label ?? existing.label}"`,
  });

  const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return NextResponse.json({ item: updated });
}

// ── DELETE /api/sitemanager/menu/[id] ─────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove children too
  await db.delete(menuItems).where(eq(menuItems.parentId, id));
  await db.delete(menuItems).where(eq(menuItems.id, id));

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(), userId: user.id,
    action: "MENU_DELETE", entityType: "menu_item", entityId: id,
    details: `Deleted menu item "${existing.label}"`,
  });

  return NextResponse.json({ success: true });
}
