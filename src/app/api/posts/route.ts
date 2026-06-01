import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, postCategories } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get('category');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 10;

        const conditions = [eq(posts.isPublished, true)];

        if (categorySlug) {
            // First find category id by slug
            const catResult = await db.select().from(postCategories).where(eq(postCategories.slug, categorySlug)).limit(1);
            if (catResult && catResult.length > 0) {
                conditions.push(eq(posts.categoryId, catResult[0].id));
            } else {
                return NextResponse.json({ items: [] });
            }
        }

        const results = await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            featuredImage: posts.featuredImage,
            publishedAt: posts.publishedAt,
            category: postCategories.name,
        })
        .from(posts)
        .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
        .where(and(...conditions))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

        return NextResponse.json({ items: results });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
