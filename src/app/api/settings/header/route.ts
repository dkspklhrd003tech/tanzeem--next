import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser, getSession } from "@/lib/auth";

/** Keys that belong to the header group (consumed by Header.tsx + admin HeaderManager). */
const HEADER_KEYS = [
  "header_logo",
  "site_name",
  "site_tagline",
  "youtube_url",
  "facebook_url",
  "twitter_url",
  "whatsapp_url",
  "instagram_url",
  "telegram_url",
  "header_cta_text",
  "header_cta_url",
  "header_show_search",
  "header_show_date",
  "date_display_mode",
  "hijri_offset",
  "manual_date_text",
];

/**
 * GET /api/settings/header
 * Returns all header-relevant settings as a flat key→value map. Public.
 */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, HEADER_KEYS));

    const flat: Record<string, string> = {};
    for (const r of rows) flat[r.key] = r.value;

    return NextResponse.json({ settings: flat });
  } catch (err) {
    console.error("GET /api/settings/header:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/settings/header
 * Upserts any header settings key. Requires auth.
 * Body: Record<string, string> — only header-whitelisted keys are accepted.
 */
export async function PUT(request: NextRequest) {
  try {
    const allCookies = request.cookies.getAll().map(c => `${c.name}=${c.value}`);
    console.log("DEBUG PUT /api/settings/header - cookies:", allCookies);
    const session = await getSession(request);
    console.log("DEBUG PUT /api/settings/header - session:", session);
    const user = await getCurrentUser(request);
    console.log("DEBUG PUT /api/settings/header - user:", user);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Record<string, string> = await request.json();

    // Only allow whitelisted header keys — reject unknown keys silently.
    const allowed = Object.fromEntries(
      Object.entries(body).filter(([k]) => HEADER_KEYS.includes(k))
    );

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid header keys provided" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(allowed)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      const group = existing[0]?.group ?? "header";

      await db
        .insert(settings)
        .values({ id: crypto.randomUUID(), key, value: String(value), type: "text", group })
        .onDuplicateKeyUpdate({ set: { value: String(value) } });
    }

    return NextResponse.json({ success: true, updated: Object.keys(allowed) });
  } catch (err) {
    console.error("PUT /api/settings/header:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
