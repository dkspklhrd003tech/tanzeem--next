import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages, pageSections } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug: slugArray } = await params;
        const slug = Array.isArray(slugArray) ? slugArray.join('/') : slugArray;

        if (!slug) {
            return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
        }

        // Fetch the page. Try both matching the full path, and prefixing with organization/ if missing
        const candidates = [slug];
        if (!slug.startsWith("organization/")) {
            candidates.push(`organization/${slug}`);
        }
        if (slug.includes("/")) {
            candidates.push(slug.replace(/^[^/]+\//, ""));
        }

        let page: any = null;
        for (const candidate of candidates) {
            const pageResult = await db.select().from(pages).where(eq(pages.slug, candidate)).limit(1);
            if (pageResult && pageResult.length > 0) {
                page = pageResult[0];
                break;
            }
        }

        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Fetch its sections
        const sectionsResult = await db.select()
            .from(pageSections)
            .where(eq(pageSections.pageId, page.id))
            .orderBy(pageSections.order);

        return NextResponse.json({
            ...page,
            sections: sectionsResult,
        });
    } catch (error) {
        console.error("Error fetching page:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
