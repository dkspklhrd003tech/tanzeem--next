import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { magazines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        await db
            .update(magazines)
            .set({
                ...body,
                updatedAt: new Date()
            })
            .where(eq(magazines.id, id));

        revalidatePath("/");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update mag:", error);
        return NextResponse.json({ error: "Failed to update mag" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.delete(magazines).where(eq(magazines.id, id));

        revalidatePath("/");
        return NextResponse.json({ success: true, message: "Magazine deleted" });
    } catch (error) {
        console.error("Failed to delete mag:", error);
        return NextResponse.json({ error: "Failed to delete mag" }, { status: 500 });
    }
}
