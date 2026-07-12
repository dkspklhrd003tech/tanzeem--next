import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialAccounts, activityLogs } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// GET - Get all accounts (optionally filtered by platform)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("platformId");

    let query = db.select().from(socialAccounts);
    
    if (platformId) {
      query = query.where(eq(socialAccounts.platformId, platformId)) as any;
    }

    const data = await query.orderBy(asc(socialAccounts.order));
    return NextResponse.json({ success: true, accounts: data });
  } catch (error) {
    console.error("Get social accounts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or Update accounts
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accounts } = await request.json();
    if (!Array.isArray(accounts)) {
      return NextResponse.json({ error: "Invalid payload: accounts must be an array" }, { status: 400 });
    }

    const results: any[] = [];

    for (const account of accounts) {
      const id = account.id || crypto.randomUUID();
      
      const payload = {
        id,
        platformId: account.platformId,
        title: account.title,
        url: account.url,
        imageUrl: account.imageUrl,
        buttonText: account.buttonText || "Follow",
        order: account.order || 0,
        isActive: account.isActive !== undefined ? account.isActive : true,
      };

      await db.insert(socialAccounts)
        .values(payload)
        .onDuplicateKeyUpdate({
          set: {
            platformId: account.platformId,
            title: account.title,
            url: account.url,
            imageUrl: account.imageUrl,
            buttonText: account.buttonText || "Follow",
            order: account.order || 0,
            isActive: account.isActive !== undefined ? account.isActive : true,
          }
        });

      results.push(payload);
    }

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "update",
      entityType: "social_accounts",
      details: JSON.stringify({ count: accounts.length }),
    });

    return NextResponse.json({ success: true, accounts: results });
  } catch (error: any) {
    console.error("Update social accounts error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete an account
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    await db.delete(socialAccounts).where(eq(socialAccounts.id, id));

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "delete",
      entityType: "social_accounts",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error: any) {
    console.error("Delete social account error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
