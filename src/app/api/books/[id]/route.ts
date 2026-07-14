import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        await db
            .update(books)
            .set({
                ...body,
                updatedAt: new Date()
            })
            .where(eq(books.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update book:", error);
        return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.delete(books).where(eq(books.id, id));

        return NextResponse.json({ success: true, message: "Book Deleted" });
    } catch (error) {
        console.error("Failed to Delete Book:", error);
        return NextResponse.json({ error: "Failed to Delete Book" }, { status: 500 });
    }
}
