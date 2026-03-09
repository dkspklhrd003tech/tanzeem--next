import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formSubmissions } from "@/db/schema";
import { desc, eq, and, count } from "drizzle-orm";

// GET - List form submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get("formType");
    const isRead = searchParams.get("isRead");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions: any[] = [];

    if (formType) conditions.push(eq(formSubmissions.formType, formType));
    if (isRead === "true") conditions.push(eq(formSubmissions.isRead, true));
    if (isRead === "false") conditions.push(eq(formSubmissions.isRead, false));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [submissions, totalResult] = await Promise.all([
      db.query.formSubmissions.findMany({
        where: whereClause,
        orderBy: [desc(formSubmissions.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(formSubmissions).where(whereClause),
    ]);

    return NextResponse.json({ submissions, total: totalResult[0].count });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Submit a form (public)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.formType) {
      return NextResponse.json(
        { error: "Form type is required" },
        { status: 400 }
      );
    }

    const submissionId = crypto.randomUUID();

    await db.insert(formSubmissions).values({
      id: submissionId,
      formType: data.formType,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    return NextResponse.json(
      { success: true, id: submissionId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
