import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { audioCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const { updates } = await req.json(); // Array of { id, order }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx.update(audioCategories)
          .set({ order: update.order })
          .where(eq(audioCategories.id, update.id));
      }
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 });
  }
}
