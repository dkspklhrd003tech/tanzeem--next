import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PUT - Update a menu item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { id } = await params;

        const existingMenu = await db.query.menuItems.findFirst({
            where: eq(menuItems.id, id),
        });

        if (!existingMenu) {
            return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        }

        await db.update(menuItems)
            .set({
                label: data.label !== undefined ? data.label : existingMenu.label,
                url: data.url !== undefined ? data.url : existingMenu.url,
                parentId: data.parentId !== undefined ? data.parentId : existingMenu.parentId,
                order: data.order !== undefined ? data.order : existingMenu.order,
                isOpenInNew: data.isOpenInNew !== undefined ? data.isOpenInNew : existingMenu.isOpenInNew,
                isVisible: data.isVisible !== undefined ? data.isVisible : existingMenu.isVisible,
                menuType: data.menuType !== undefined ? data.menuType : existingMenu.menuType,
            })
            .where(eq(menuItems.id, id));

        const updatedMenu = await db.query.menuItems.findFirst({
            where: eq(menuItems.id, id),
        });

        // Log activity
        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "update",
            entityType: "menu_item",
            entityId: id,
            details: JSON.stringify({ label: updatedMenu?.label }),
        });

        return NextResponse.json({ menu: updatedMenu });
    } catch (error) {
        console.error("Update menu error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a menu item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existingMenu = await db.query.menuItems.findFirst({
            where: eq(menuItems.id, id),
        });

        if (!existingMenu) {
            return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        }

        // Delete the menu item
        await db.delete(menuItems).where(eq(menuItems.id, id));

        // Log activity
        await db.insert(activityLogs).values({
            id: crypto.randomUUID(),
            userId: user.id,
            action: "delete",
            entityType: "menu_item",
            entityId: id,
            details: JSON.stringify({ label: existingMenu.label }),
        });

        return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Delete menu error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
