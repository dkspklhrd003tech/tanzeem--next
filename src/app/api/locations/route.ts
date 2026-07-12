import { NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

/**
 * GET /api/locations
 * Returns all active locations ordered by name, used by the Contact page
 * city-tab selector. Public — no auth required.
 */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.isActive, true))
      .orderBy(asc(locations.name));

    return NextResponse.json({ locations: rows });
  } catch (error) {
    console.error("GET /api/locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
