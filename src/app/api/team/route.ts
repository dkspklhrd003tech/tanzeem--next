import { NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const team = await db.query.teamMembers.findMany({
            orderBy: [desc(teamMembers.order), desc(teamMembers.createdAt)],
        });
        return NextResponse.json({ teamMembers: team });
    } catch (error) {
        console.error("Failed to fetch team members:", error);
        return NextResponse.json(
            { error: "Failed to fetch team members" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const newMember = {
            id: uuidv4(),
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            designation: body.designation || null,
            bio: body.bio || null,
            avatar: body.avatar || null,
            buttonName: body.buttonName || null,
            buttonUrl: body.buttonUrl || null,
            email: body.email || null,
            phone: body.phone || null,
            order: body.order || 0,
            isActive: body.isActive !== undefined ? body.isActive : true,
        };

        await db.insert(teamMembers).values(newMember);

        return NextResponse.json(
            { message: "Team member Created Successfully", teamMember: newMember },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to create team member:", error);
        return NextResponse.json(
            { error: "Failed to create team member" },
            { status: 500 }
        );
    }
}
