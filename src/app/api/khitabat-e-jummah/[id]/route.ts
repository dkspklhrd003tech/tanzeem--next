import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { khitabatJummahAddresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const id = params.id;
        const data = await request.json();

        await db.update(khitabatJummahAddresses)
            .set({
                masjid: data.masjid,
                address: data.address,
                city: data.city,
                time: data.time,
                contact: data.contact || null,
                map: data.map || null,
                isPublished: Boolean(data.isPublished),
                updatedAt: new Date(),
            })
            .where(eq(khitabatJummahAddresses.id, id));

        const [updated] = await db.select().from(khitabatJummahAddresses).where(eq(khitabatJummahAddresses.id, id));
        return NextResponse.json({ address: updated });
    } catch (error) {
        console.error("Failed to update address:", error);
        return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const id = params.id;

        await db.delete(khitabatJummahAddresses).where(eq(khitabatJummahAddresses.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete address:", error);
        return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
    }
}
