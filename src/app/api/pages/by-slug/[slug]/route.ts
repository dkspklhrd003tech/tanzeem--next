import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages, pageSections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch the page
        const pageResult = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);

        if (!pageResult || pageResult.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const page = pageResult[0];

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
