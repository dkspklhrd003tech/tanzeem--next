import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { khitabatJummahAddresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const admin = searchParams.get('admin');

        // Allow fetching all if admin flag is passed, otherwise only published
        const query = admin === 'true'
            ? db.select().from(khitabatJummahAddresses).orderBy(desc(khitabatJummahAddresses.createdAt))
            : db.select().from(khitabatJummahAddresses).where(eq(khitabatJummahAddresses.isPublished, true)).orderBy(desc(khitabatJummahAddresses.createdAt));

        const addresses = await query;
        return NextResponse.json({ addresses });
    } catch (error) {
        console.error("Failed to fetch khitabat-e-jummah addresses:", error);
        return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const id = uuidv4();

        await db.insert(khitabatJummahAddresses).values({
            id,
            masjid: data.masjid,
            address: data.address,
            city: data.city,
            time: data.time,
            contact: data.contact || null,
            map: data.map || null,
            isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        });

        const [newAddress] = await db.select().from(khitabatJummahAddresses).where(eq(khitabatJummahAddresses.id, id));
        return NextResponse.json({ address: newAddress }, { status: 201 });
    } catch (error) {
        console.error("Failed to create address:", error);
        return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
    }
}
