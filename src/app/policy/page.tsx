import { Metadata } from "next";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ModernizedProsePage } from "@/components/shared/ModernizedProsePage";
import { webPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { resolveMediaUrl } from "@/lib/utils";

export const revalidate = 300;

async function getPolicySettings() {
  const data = await db.select().from(settings).where(eq(settings.group, "policy_page"));
  const config: Record<string, string> = {
    policy_title: "Privacy Policy",
    policy_content: "",
    policy_featured_image: "",
  };
  for (const row of data) {
    if (row.key in config) {
      config[row.key] = row.value || "";
    }
  }
  return config;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPolicySettings();
  
  return {
    title: config.policy_title,
    description: "Read our official privacy policy and terms of service.",
  };
}

export default async function PolicyPage() {
  const config = await getPolicySettings();

  const title = config.policy_title || "Privacy Policy";
  const content = config.policy_content || "";
  const featuredImage = config.policy_featured_image ? resolveMediaUrl(config.policy_featured_image) : null;

  const webpage = webPageJsonLd({
    title,
    description: "Official privacy policy and terms of service.",
    path: "/policy",
  });

  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path: "/policy" },
  ];
  const bc = breadcrumbJsonLd(crumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bc) }}
      />
      
      <ModernizedProsePage
        title={title}
        content={content}
        slug="policy"
        breadcrumbs={crumbs}
        featuredImage={featuredImage}
      />
    </>
  );
}
