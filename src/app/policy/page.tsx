import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";
import { resolveMediaUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Policy" };

export default async function PolicyPage() {
  let settingsRows: any[] = [];
  try {
    settingsRows = await db
      .select()
      .from(settings)
      .where(eq(settings.group, "policy_page"));
  } catch (err) {
    console.error("Failed to fetch policy page settings:", err);
  }

  const settingsMap = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const title = settingsMap["policy_title"] || "Policy";
  const content = settingsMap["policy_content"] || "";
  const featuredImage = settingsMap["policy_featured_image"]
    ? resolveMediaUrl(settingsMap["policy_featured_image"])
    : null;

  return (
    <ModernizedProsePage
      title={title}
      content={content}
      slug="policy"
      breadcrumbs={[{ name: title, path: "/policy" }]}
      featuredImage={featuredImage}
    />
  );
}
