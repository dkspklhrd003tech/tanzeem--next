import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTrafficStats } from "@/app/actions/trafficActions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getTrafficStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching traffic stats:", error);
    return NextResponse.json({ error: "Failed to fetch traffic stats" }, { status: 500 });
  }
}
