import { NextResponse } from "next/server";
import { db } from "@/db";
import { homeCampaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const body = await request.json();

        // Check if exists
        const existing = await db.query.homeCampaigns.findFirst({
            where: eq(homeCampaigns.id, id)
        });

        if (!existing) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        await db.update(homeCampaigns).set({
            title: body.title,
            imageUrl: body.imageUrl,
            linkUrl: body.linkUrl,
            order: body.order,
            isActive: body.isActive,
            updatedAt: new Date()
        }).where(eq(homeCampaigns.id, id));

        return NextResponse.json({ message: "Campaign updated successfully" });
    } catch (error) {
        console.error("Failed to update campaign:", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
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

        const existing = await db.query.homeCampaigns.findFirst({
            where: eq(homeCampaigns.id, id)
        });

        if (!existing) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        await db.delete(homeCampaigns).where(eq(homeCampaigns.id, id));

        return NextResponse.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Failed to delete campaign:", error);
        return NextResponse.json(
            { error: "Failed to delete campaign" },
            { status: 500 }
        );
    }
}
