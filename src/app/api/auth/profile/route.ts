import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email is taken by someone else
    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, user.id)),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        name,
        email,
        avatar,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
