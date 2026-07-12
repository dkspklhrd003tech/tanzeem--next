import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formSubmissions } from "@/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/validations/api";
import { ApiError, ApiSuccess } from "@/lib/api-response";

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

    return ApiSuccess({ submissions, total: totalResult[0].count });
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}

// POST - Submit a form (public)
export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(request, "MODERATE", "contact");
    if (!rateLimit.success) {
      return ApiError("Too many form submissions. Please try again later.", 429);
    }

    const body = await request.json();
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiError("Invalid form data provided", 400);
    }

    const data = validationResult.data;
    const submissionId = crypto.randomUUID();

    await db.insert(formSubmissions).values({
      id: submissionId,
      formType: data.formType,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
    });

    return ApiSuccess({ id: submissionId }, 201);
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}
