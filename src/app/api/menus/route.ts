import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, desc, asc, and } from "drizzle-orm";
import { sanitizeUrl } from "@/lib/security";

// Helper function to build a tree structure from flat menu items
function buildMenuTree(items: any[], parentId: string | null = null): any[] {
    return items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
            ...item,
            children: buildMenuTree(items, item.id),
        }));
}

// GET - List all menu items
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const menuType = searchParams.get("menuType") || "main";
        const hierarchy = searchParams.get("hierarchy") === "true"; // return as tree
        const visibleOnly = searchParams.get("visibleOnly") === "true";

        const conditions = [eq(menuItems.menuType, menuType)];

        if (visibleOnly) {
            conditions.push(eq(menuItems.isVisible, true));
        }

        const items = await db.query.menuItems.findMany({
            where: conditions.length > 1 ? and(...conditions) : conditions[0],
            orderBy: [asc(menuItems.order)],
        });

        if (hierarchy) {
            const tree = buildMenuTree(items);
            return NextResponse.json({ menus: tree });
        }

        return NextResponse.json({ menus: items });
    } catch (error) {
        console.error("Get menus error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.label) {
            return NextResponse.json(
                { error: "Label is required" },
                { status: 400 }
            );
        }

        const mId = crypto.randomUUID();

        // Sanitize the URL: drops javascript:/data: schemes (returns null when unsafe).
        const safeUrl = data.url ? sanitizeUrl(data.url) : null;

        await db.insert(menuItems).values({
            id: mId,
            label: data.label,
            url: safeUrl,
            parentId: data.parentId || null,
            order: data.order || 0,
            isOpenInNew: data.isOpenInNew ?? false,
            isVisible: data.isVisible ?? true,
            menuType: data.menuType || "main",
        });

        const newItem = await db.query.menuItems.findFirst({
            where: eq(menuItems.id, mId),
        });

        // Log activity
        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "create",
            entityType: "menu_item",
            entityId: mId,
            details: JSON.stringify({ label: data.label }),
        });

        return NextResponse.json({ menu: newItem }, { status: 201 });
    } catch (error) {
        console.error("Create menu error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
