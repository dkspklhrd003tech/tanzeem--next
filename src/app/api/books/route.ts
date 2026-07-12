import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { books, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, or, like, desc, count, and } from "drizzle-orm";

// GET - List all books
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const categoryId = searchParams.get("categoryId");
    const language = searchParams.get("language");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions: any[] = [];

    if (published === "true") conditions.push(eq(books.isPublished, true));
    if (published === "false") conditions.push(eq(books.isPublished, false));
    if (categoryId) conditions.push(eq(books.categoryId, categoryId));
    if (language) conditions.push(eq(books.language, language));
    if (featured === "true") conditions.push(eq(books.isFeatured, true));
    if (search) {
      conditions.push(
        or(
          like(books.title, `%${search}%`),
          like(books.description, `%${search}%`),
          like(books.authorName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [booksData, totalResult] = await Promise.all([
      db.query.books.findMany({
        where: whereClause,
        with: {
          category: true,
          author: { columns: { id: true, name: true } },
        },
        orderBy: [books.order, desc(books.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(books).where(whereClause),
    ]);

    return NextResponse.json({ books: booksData, total: totalResult[0].count });
  } catch (error) {
    console.error("Get books error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create book
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const bookId = crypto.randomUUID();

    await db.insert(books).values({
      id: bookId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      coverImage: data.coverImage,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      pages: data.pages,
      language: data.language || "urdu",
      categoryId: data.categoryId,
      authorName: data.authorName,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      buttonText: data.buttonText,
      buttonUrl: data.buttonUrl,
      authorId: user.id,
      publishedAt: data.isPublished ? new Date() : null,
    });

    const newBook = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: { category: true },
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "create",
      entityType: "book",
      entityId: bookId,
      details: JSON.stringify({ title: data.title }),
    });

    return NextResponse.json({ book: newBook }, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { orders } = body; // Expected: [{ id: string, order: number }, ...]

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
        }

        // Multiple updates in a transaction
        await db.transaction(async (tx) => {
            for (const item of orders) {
                await tx.update(books).set({ order: item.order }).where(eq(books.id, item.id));
            }
        });

        return NextResponse.json({ success: true, message: "Books reordered successfully" });
    } catch (error) {
        console.error("Patch books error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
