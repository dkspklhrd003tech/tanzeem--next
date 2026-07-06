import { NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const body = await request.json();

        const existing = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.id, id)
        });

        if (!existing) {
            return NextResponse.json({ error: "Team member not found" }, { status: 404 });
        }

        await db.update(teamMembers).set({
            name: body.name,
            slug: body.slug,
            designation: body.designation,
            bio: body.bio,
            avatar: body.avatar,
            buttonName: body.buttonName,
            buttonUrl: body.buttonUrl,
            email: body.email,
            phone: body.phone,
            order: body.order,
            isActive: body.isActive,
            updatedAt: new Date()
        }).where(eq(teamMembers.id, id));

        return NextResponse.json({ message: "Team member updated successfully" });
    } catch (error) {
        console.error("Failed to update team member:", error);
        return NextResponse.json(
            { error: "Failed to update team member" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const existing = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.id, id)
        });

        if (!existing) {
            return NextResponse.json({ error: "Team member not found" }, { status: 404 });
        }

        await db.delete(teamMembers).where(eq(teamMembers.id, id));

        return NextResponse.json({ message: "Team member deleted successfully" });
    } catch (error) {
        console.error("Failed to delete team member:", error);
        return NextResponse.json(
            { error: "Failed to delete team member" },
            { status: 500 }
        );
    }
}
