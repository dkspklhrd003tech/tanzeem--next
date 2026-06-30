import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { audioCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await db.update(audioCategories).set({
      name: body.name,
      slug: body.slug,
      code: body.code,
      description: body.description,
      order: body.order,
      isActive: body.isActive,
      updatedAt: new Date()
    }).where(eq(audioCategories.id, id));
    
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(audioCategories).where(eq(audioCategories.id, id));
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

