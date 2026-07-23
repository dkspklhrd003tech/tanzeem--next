import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { videoCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updateFields: any = { updatedAt: new Date() };
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.slug !== undefined) updateFields.slug = body.slug;
    if (body.imageUrl !== undefined) updateFields.imageUrl = body.imageUrl;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.order !== undefined) updateFields.order = body.order;
    if (body.isActive !== undefined) updateFields.isActive = body.isActive;
    if (body.customFields !== undefined) updateFields.customFields = body.customFields;
    
    await db.update(videoCategories).set(updateFields).where(eq(videoCategories.id, id));
    
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
    await db.delete(videoCategories).where(eq(videoCategories.id, id));
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

