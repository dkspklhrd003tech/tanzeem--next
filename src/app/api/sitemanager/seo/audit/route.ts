import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allPages = await db.select().from(pages).orderBy(desc(pages.updatedAt));
    const totalPages = allPages.length;

    let healthyPages = 0;
    let pagesWithErrors = 0;
    let traditionalPassed = 0;
    let altTextsPassed = 0;
    let aeoGeoPassed = 0;
    let schemaPassed = 0;
    let technicalPassed = 0;

    const auditedPages: any[] = [];

    for (const p of allPages) {
      const issues: string[] = [];

      let seoData: any = p.seoData;
      if (typeof seoData === "string") {
        try {
          seoData = JSON.parse(seoData);
        } catch {
          seoData = {};
        }
      }
      seoData = seoData || {};

      let hasTradIssue = false;
      if (!p.metaTitle || p.metaTitle.trim().length < 30) {
        issues.push("Meta Title missing or too short (< 30 chars)");
        hasTradIssue = true;
      }
      if (!p.metaDescription || p.metaDescription.trim().length < 70) {
        issues.push("Meta Description missing or too short (< 70 chars)");
        hasTradIssue = true;
      }
      if (!hasTradIssue) traditionalPassed++;

      if (p.featuredImage && !p.featuredImageAlt) {
        issues.push("Featured Image Alt Text missing");
      } else {
        altTextsPassed++;
      }

      let hasGeoAeoIssue = false;
      if (!seoData.geo?.summary || !seoData.geo?.entities) {
        issues.push("Generative Engine Optimization (GEO) summary unassigned");
        hasGeoAeoIssue = true;
      }
      if (!seoData.aeo?.faq) {
        issues.push("Answer Engine Optimization (AEO) FAQ section missing");
        hasGeoAeoIssue = true;
      }
      if (!hasGeoAeoIssue) aeoGeoPassed++;

      if (!seoData.schema?.json) {
        issues.push("Dynamic JSON-LD Schema payload unassigned");
      } else {
        schemaPassed++;
      }

      let hasTechIssue = false;
      if (!p.canonicalUrl) {
        issues.push("Canonical URL unassigned");
        hasTechIssue = true;
      }
      if (!p.ogImage) {
        issues.push("Open Graph Share Card Image missing");
        hasTechIssue = true;
      }
      if (!hasTechIssue) technicalPassed++;

      const pageMaxScore = 8;
      const passedCount = Math.max(0, pageMaxScore - issues.length);
      const score = Math.round((passedCount / pageMaxScore) * 100);

      if (issues.length > 0) {
        pagesWithErrors++;
      } else {
        healthyPages++;
      }

      auditedPages.push({
        id: p.id,
        title: p.title || p.slug,
        slug: p.slug,
        score,
        issues,
        isPublished: p.isPublished,
        updatedAt: p.updatedAt,
      });
    }

    const overallScore = totalPages > 0 ? Math.round((healthyPages / totalPages) * 100) : 100;

    return NextResponse.json({
      summary: {
        totalPages,
        healthyPages,
        pagesWithErrors,
        overallScore,
        traditionalPassed,
        altTextsPassed,
        aeoGeoPassed,
        schemaPassed,
        technicalPassed,
        traditionalPct: totalPages > 0 ? Math.round((traditionalPassed / totalPages) * 100) : 100,
        altTextsPct: totalPages > 0 ? Math.round((altTextsPassed / totalPages) * 100) : 100,
        aeoGeoPct: totalPages > 0 ? Math.round((aeoGeoPassed / totalPages) * 100) : 100,
        schemaPct: totalPages > 0 ? Math.round((schemaPassed / totalPages) * 100) : 100,
        technicalPct: totalPages > 0 ? Math.round((technicalPassed / totalPages) * 100) : 100,
      },
      pages: auditedPages,
    });
  } catch (error: any) {
    console.error("Error in /api/sitemanager/seo/audit:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during SEO audit" },
      { status: 500 }
    );
  }
}
