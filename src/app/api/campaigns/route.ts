import { NextResponse } from "next/server";
import { db } from "@/db";
import { homeCampaigns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const campaigns = await db.query.homeCampaigns.findMany({
            orderBy: [desc(homeCampaigns.order), desc(homeCampaigns.createdAt)],
        });
        return NextResponse.json({ campaigns });
    } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.title || !body.imageUrl) {
            return NextResponse.json(
                { error: "Title and Image URL are required" },
                { status: 400 }
            );
        }

        const newCampaign = {
            id: uuidv4(),
            title: body.title,
            imageUrl: body.imageUrl,
            linkUrl: body.linkUrl || "",
            order: body.order || 0,
            isActive: body.isActive !== undefined ? body.isActive : true,
        };

        await db.insert(homeCampaigns).values(newCampaign);

        return NextResponse.json(
            { message: "Campaign created successfully", campaign: newCampaign },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to create campaign:", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { orders } = body; // Expected: [{ id: string, order: number }, ...]

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json(
                { error: "Invalid orders data" },
                { status: 400 }
            );
        }

        // Perform bulk update (sequential for simplicity with small lists)
        for (const item of orders) {
            await db.update(homeCampaigns)
                .set({ order: item.order })
                .where(eq(homeCampaigns.id, item.id));
        }

        return NextResponse.json({ message: "Reordered successfully" });
    } catch (error) {
        console.error("Failed to reorder campaigns:", error);
        return NextResponse.json(
            { error: "Failed to reorder campaigns" },
            { status: 500 }
        );
    }
}
