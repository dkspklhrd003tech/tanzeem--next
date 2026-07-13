import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "disclaimer_views"))
      .limit(1);

    if (existing.length > 0) {
      const currentViews = parseInt(existing[0].value || "0", 10) || 0;
      await db.update(settings)
        .set({ value: (currentViews + 1).toString() })
        .where(eq(settings.key, "disclaimer_views"));
    } else {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        key: "disclaimer_views",
        value: "1",
        type: "number",
        group: "general",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to increment disclaimer views:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
