/**
 * seed-settings.ts
 *
 * Seeds the `settings` table with site-wide key/value pairs so components have
 * real data and can drop hardcoded fallbacks. Idempotent via onDuplicateKeyUpdate.
 *
 * Groups:
 *   - identity       : logo, branding
 *   - social         : social-media profile URLs
 *   - contact        : address, phone, email
 *   - global_banner  : page banner background + overlay + display toggles
 *   - homepage       : homepage section text/badges consumed by page.tsx
 *
 * Run:  npx tsx scripts/seed-settings.ts
 */
import { db } from "../src/lib/db";
import { settings } from "../src/db/schema";

interface SettingSeed {
  key: string;
  value: string;
  type: "text" | "textarea" | "boolean" | "number" | "image";
  group: string;
}

const SEEDS: SettingSeed[] = [
  // ─── Identity / Branding ───────────────────────────────────────────────────
  { key: "site_logo", value: "", type: "image", group: "identity" },
  { key: "site_name", value: "Tanzeem-e-Islami", type: "text", group: "identity" },
  { key: "site_tagline", value: "تنظیمِ اسلامی", type: "text", group: "identity" },

  // ─── Social media ──────────────────────────────────────────────────────────
  { key: "youtube_url", value: "https://youtube.com/@tanzeemeislami", type: "text", group: "social" },
  { key: "facebook_url", value: "https://facebook.com/tanzeemeislami", type: "text", group: "social" },
  { key: "twitter_url", value: "https://twitter.com/tanzeemeislami", type: "text", group: "social" },
  { key: "whatsapp_url", value: "https://wa.me/+923324353693", type: "text", group: "social" },
  { key: "instagram_url", value: "https://instagram.com/tanzeemeislami", type: "text", group: "social" },
  { key: "telegram_url", value: "https://t.me/tanzeemeislami", type: "text", group: "social" },

  // ─── Contact ───────────────────────────────────────────────────────────────
  { key: "whatsapp_number", value: "0332-4353693", type: "text", group: "contact" },
  { key: "contact_email", value: "markaz@tanzeem.org", type: "text", group: "contact" },
  { key: "contact_email_office", value: "info@tanzeem.org", type: "text", group: "contact" },
  { key: "contact_phone", value: "+92 (42) 35473375-78", type: "text", group: "contact" },
  { key: "footer_address", value: "23 KM Multan Road, Near Chung, Lahore, Punjab, Pakistan", type: "textarea", group: "contact" },
  { key: "footer_copyright", value: "© ${year} Tanzeem-e-Islami. All rights reserved.", type: "text", group: "contact" },

  // ─── Global Page Banner ────────────────────────────────────────────────────
  { key: "banner_bg_image", value: "/images/default-banner.jpg", type: "image", group: "global_banner" },
  { key: "banner_overlay_color", value: "#003d25", type: "text", group: "global_banner" },
  { key: "banner_overlay_opacity", value: "0.7", type: "text", group: "global_banner" },
  { key: "banner_text_color", value: "#ffffff", type: "text", group: "global_banner" },
  { key: "banner_height", value: "300px", type: "text", group: "global_banner" },
  { key: "banner_breadcrumb_separator", value: "/", type: "text", group: "global_banner" },
  { key: "banner_show_breadcrumbs", value: "true", type: "boolean", group: "global_banner" },

  // ─── Homepage sections (consumed by src/app/page.tsx settingsMap) ──────────
  { key: "about_title", value: "About Tanzeem-e-Islami", type: "text", group: "homepage" },
  { key: "about_subtitle", value: "A Quranic movement for the revival of Islam", type: "textarea", group: "homepage" },
  { key: "mission_title", value: "Our Mission", type: "text", group: "homepage" },
  { key: "mission_subtitle", value: "Calling humanity to the Quran and Sunnah", type: "textarea", group: "homepage" },
  { key: "cta_title", value: "Connect With Us", type: "text", group: "homepage" },
  { key: "cta_subtitle", value: "Follow Tanzeem-e-Islami across our platforms", type: "textarea", group: "homepage" },

  // ─── Header controls ───────────────────────────────────────────────────────
  { key: "header_cta_text", value: "Join Tanzeem", type: "text", group: "header" },
  { key: "header_cta_url", value: "/join", type: "text", group: "header" },
  { key: "header_show_search", value: "true", type: "boolean", group: "header" },
  { key: "header_show_date", value: "true", type: "boolean", group: "header" },
  { key: "date_display_mode", value: "auto", type: "text", group: "header" },
  { key: "hijri_offset", value: "0", type: "number", group: "header" },
  { key: "manual_date_text", value: "", type: "text", group: "header" },

  // ─── Footer columns (stored as JSON strings in the settings table) ─────────
  // The footer link columns are managed via menu_items (menuType='footer').
  // These keys store the Contact Us column fields not covered by contact group.
  { key: "footer_landline", value: "+92 (42) 35473375-78", type: "text", group: "footer" },
  { key: "footer_whatsapp_note", value: "(Text or Voice Message Only)", type: "text", group: "footer" },
  { key: "footer_show_social", value: "true", type: "boolean", group: "footer" },
];

async function main() {
  console.log(`Seeding ${SEEDS.length} settings…`);

  for (const s of SEEDS) {
    // Resolve the ${year} placeholder in copyright at seed time.
    const value = s.value.replace("${year}", String(new Date().getFullYear()));

    await db
      .insert(settings)
      .values({
        id: crypto.randomUUID(),
        key: s.key,
        value,
        type: s.type,
        group: s.group,
      })
      .onDuplicateKeyUpdate({
        set: {
          value,
          type: s.type,
          group: s.group,
        },
      });
  }

  console.log("✓ Settings seeded successfully.");
}

main().catch((err) => {
  console.error("Settings seed failed:", err);
  process.exit(1);
});
