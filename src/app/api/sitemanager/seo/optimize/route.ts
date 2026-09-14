import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, inArray, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function revalidateAllPaths(rawSlug: string) {
  const slug = rawSlug.replace(/^\/+/, "");
  const paths = new Set<string>([
    `/${slug}`,
    `/[...slug]`,
    "/",
    "/sitemanager/seo",
    "/sitemanager/pages",
  ]);
  const segments = slug.split("/");
  if (segments.length > 1) paths.add(`/${segments.slice(1).join("/")}`);
  if (!slug.startsWith("organization/")) paths.add(`/organization/${slug}`);

  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch (_) {}
  }
}

function synthesizeSeoForPage(page: any, sections: any[]) {
  // 1. Gather text content & authentic accordion FAQs from page_sections
  let extractedText = "";
  const faqs: { q: string; a: string }[] = [];

  if (sections && sections.length > 0) {
    sections.forEach((sec: any) => {
      let config = sec.config;
      if (typeof config === "string") {
        try {
          config = JSON.parse(config);
        } catch {
          config = {};
        }
      }
      config = config || {};

      const textChunks = [
        config.heading,
        config.title,
        config.subheading,
        config.body,
        config.description,
        config.quoteText,
      ];
      extractedText += " " + textChunks.filter(Boolean).join(" ");

      if (sec.type === "accordion" && Array.isArray(config.items)) {
        config.items.forEach((item: any) => {
          if (item.question && item.answer) {
            faqs.push({
              q: String(item.question).trim(),
              a: String(item.answer).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
            });
          }
        });
      }
    });
  }

  // Fallback to page.content / page.excerpt if sections have minimal text
  if (extractedText.trim().length < 50 && page.content) {
    extractedText += " " + page.content;
  }
  if (page.excerpt) {
    extractedText += " " + page.excerpt;
  }

  extractedText = extractedText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const title = (page.title || page.slug || "Page").trim();
  const slug = page.slug ? page.slug.replace(/^\/+/, "") : "";
  const isHome = slug === "" || slug === "home" || title.toLowerCase() === "home";

  // 2. Meta Title (Between 30 and 60 chars)
  let metaTitle = page.metaTitle?.trim() || "";
  if (!metaTitle || metaTitle.length < 30 || metaTitle.length > 70) {
    if (isHome) {
      metaTitle = "Tanzeem-e-Islami | Movement for Khilafah & Revival";
    } else {
      metaTitle = `${title} | Tanzeem-e-Islami`;
      if (metaTitle.length < 30) {
        metaTitle = `${title} - Official Resources | Tanzeem-e-Islami`;
      }
      if (metaTitle.length > 60) {
        metaTitle = metaTitle.substring(0, 57).trim() + "...";
      }
    }
  }

  // 3. Meta Description (Between 70 and 155 chars)
  let metaDescription = page.metaDescription?.trim() || "";
  if (!metaDescription || metaDescription.length < 70) {
    if (extractedText.length >= 100) {
      metaDescription = extractedText.substring(0, 145).trim() + "...";
    } else if (extractedText.length > 25) {
      metaDescription = `${extractedText.trim()} Discover authentic Islamic guidance, publications, and initiatives from Tanzeem-e-Islami.`;
      if (metaDescription.length > 155) {
        metaDescription = metaDescription.substring(0, 150).trim() + "...";
      }
    } else {
      metaDescription = `Explore official resources, publications, and ideological guidance regarding ${title} provided by Tanzeem-e-Islami.`;
    }
  }

  // 4. Canonical URL
  const canonicalUrl = page.canonicalUrl?.trim() || `/${slug}`;

  // 5. Open Graph Image & Alt Text
  const ogImage = page.ogImage?.trim() || page.featuredImage?.trim() || "/images/tanzeem-logo.png";
  const featuredImageAlt =
    page.featuredImageAlt?.trim() ||
    `Official illustration and visual media for ${title} at Tanzeem-e-Islami`;

  // Parse existing seoData
  let prevSeo: any = page.seoData;
  if (typeof prevSeo === "string") {
    try {
      prevSeo = JSON.parse(prevSeo);
    } catch {
      prevSeo = {};
    }
  }
  prevSeo = prevSeo || {};

  // 6. GEO Summary & Entities
  const geoSummary =
    prevSeo.geo?.summary && prevSeo.geo.summary.length >= 40
      ? prevSeo.geo.summary
      : extractedText.length > 60
      ? `This official page provides comprehensive information regarding ${title}. Core insights: ${extractedText.substring(0, 280)}...`
      : `An in-depth official resource and summary of ${title} presented by Tanzeem-e-Islami.`;

  const geoEntities =
    prevSeo.geo?.entities?.trim() ||
    "Tanzeem-e-Islami, Quran, Sunnah, Islamic System, Khilafat, Dr. Israr Ahmad";

  // 7. AEO FAQ
  let aeoFaq = prevSeo.aeo?.faq?.trim() || "";
  if (!aeoFaq) {
    if (faqs.length > 0) {
      aeoFaq = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
    } else {
      aeoFaq = `Q: What is the main focus of ${title}?\nA: This page provides official guidance and educational resources regarding ${title} by Tanzeem-e-Islami.\n\nQ: How can I learn more about Tanzeem-e-Islami's work?\nA: Explore our online portal or contact our local regional offices for literature, study circles, and audio-visual archives.`;
    }
  }

  // 8. Dynamic JSON-LD Schema
  let schemaJson = prevSeo.schema?.json?.trim() || "";
  if (!schemaJson) {
    const schemaObj: any = {
      "@context": "https://schema.org",
      "@type": page.schemaType || "WebPage",
      name: metaTitle,
      description: metaDescription,
      url: `https://tanzeem.org/${slug}`,
      publisher: {
        "@type": "Organization",
        name: "Tanzeem-e-Islami",
        url: "https://tanzeem.org",
        logo: "https://tanzeem.org/images/tanzeem-logo.png",
      },
    };

    if (faqs.length > 0) {
      schemaObj.mainEntity = faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      }));
    }

    schemaJson = JSON.stringify(schemaObj, null, 2);
  }

  const updatedSeoData = {
    ...prevSeo,
    ogImageAlt: prevSeo.ogImageAlt || `Social share card preview for ${title}`,
    geo: {
      ...(prevSeo.geo || {}),
      summary: geoSummary,
      entities: geoEntities,
    },
    aeo: {
      ...(prevSeo.aeo || {}),
      faq: aeoFaq,
    },
    schema: {
      ...(prevSeo.schema || {}),
      json: schemaJson,
    },
  };

  return {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    featuredImageAlt,
    seoData: updatedSeoData,
    updatedAt: new Date(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { pageId, pageIds, all } = body;

    let targetPages: any[] = [];

    if (pageId) {
      targetPages = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
    } else if (Array.isArray(pageIds) && pageIds.length > 0) {
      targetPages = await db.select().from(pages).where(inArray(pages.id, pageIds));
    } else if (all) {
      targetPages = await db.select().from(pages);
    } else {
      return NextResponse.json({ error: "Specify pageId, pageIds, or all: true" }, { status: 400 });
    }

    if (targetPages.length === 0) {
      return NextResponse.json({ message: "No pages found to optimize", updatedCount: 0 });
    }

    // Process each target page
    let updatedCount = 0;
    const optimizedPages: any[] = [];

    for (const page of targetPages) {
      // Fetch sections for this page to extract real accordion FAQs and copy
      const sections = await db
        .select()
        .from(pageSections)
        .where(and(eq(pageSections.pageId, page.id), eq(pageSections.isActive, true)))
        .orderBy(asc(pageSections.order));

      const optimizedFields = synthesizeSeoForPage(page, sections);

      await db
        .update(pages)
        .set(optimizedFields)
        .where(eq(pages.id, page.id));

      revalidateAllPaths(page.slug || "");
      updatedCount++;
      optimizedPages.push({ id: page.id, title: page.title, slug: page.slug });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully optimized SEO for ${updatedCount} page(s).`,
      updatedCount,
      optimizedPages,
    });
  } catch (error: any) {
    console.error("Error in /api/sitemanager/seo/optimize:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during SEO optimization" },
      { status: 500 }
    );
  }
}
