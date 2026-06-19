import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

/** Keys that belong to the footer group. */
const FOOTER_KEYS = [
  "footer_address",
  "footer_copyright",
  "footer_landline",
  "whatsapp_number",
  "footer_whatsapp_note",
  "contact_email",
  "contact_email_office",
  "footer_show_social",
  "youtube_url",
  "facebook_url",
  "twitter_url",
  "whatsapp_url",
  "instagram_url",
  "telegram_url",
];

/**
 * GET /api/settings/footer
 * Returns all footer-relevant settings as a flat key→value map. Public.
 */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, FOOTER_KEYS));

    const flat: Record<string, string> = {};
    for (const r of rows) flat[r.key] = r.value;

    return NextResponse.json({ settings: flat });
  } catch (err) {
    console.error("GET /api/settings/footer:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/settings/footer
 * Upserts footer settings keys. Requires auth.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Record<string, string> = await request.json();
    const allowed = Object.fromEntries(
      Object.entries(body).filter(([k]) => FOOTER_KEYS.includes(k))
    );

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid footer keys provided" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(allowed)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      const group = existing[0]?.group ?? "footer";

      await db
        .insert(settings)
        .values({ id: crypto.randomUUID(), key, value: String(value), type: "text", group })
        .onDuplicateKeyUpdate({ set: { value: String(value) } });
    }

    return NextResponse.json({ success: true, updated: Object.keys(allowed) });
  } catch (err) {
    console.error("PUT /api/settings/footer:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
