import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, settings, emailLogs } from "@/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/validations/api";
import { ApiError, ApiSuccess } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

    // Fetch email configurations and template
    const emailSettings = await db.select().from(settings).where(
      inArray(settings.group, ["form_email", "contact"])
    );

    const config = emailSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (config.sendToEmail && config.email_template_html) {
      let emailHtml = config.email_template_html;
      emailHtml = emailHtml.replace(/\[name\]/g, data.name);
      emailHtml = emailHtml.replace(/\[email\]/g, data.email);
      
      if (data.phone && data.phone.trim() !== "") {
        emailHtml = emailHtml.replace(/\[phone\]/g, data.phone);
      } else {
        // Remove the entire <tr> containing [phone]
        emailHtml = emailHtml.replace(/<tr[^>]*>[\s\S]*?\[phone\][\s\S]*?<\/tr>/gi, "");
      }
      
      emailHtml = emailHtml.replace(/\[subject\]/g, data.subject);
      emailHtml = emailHtml.replace(/\[msg\]/g, data.message);

      // Build subject: resolve [subject] smart tag if present
      let emailSubjectLine = config.emailSubject || `New Contact Submission: ${data.subject}`;
      emailSubjectLine = emailSubjectLine.replace(/\[subject\]/g, data.subject);
      emailSubjectLine = emailSubjectLine.replace(/\[name\]/g, data.name);

      // Build from display name if configured
      const fromDisplay = config.fromName && config.fromEmail
        ? `"${config.fromName}" <${config.fromEmail}>`
        : config.fromEmail || undefined;

      let adminStatus = "FAILED";
      let userStatus = "FAILED";
      let adminDetails = "";
      let userDetails = "";

      // 1. Notify admin
      try {
        const adminRes = await sendEmail({
          to: config.sendToEmail,
          subject: emailSubjectLine,
          html: emailHtml,
          replyTo: data.email,
          from: fromDisplay,
        });
        
        if (adminRes && adminRes.success === false) {
          adminDetails = adminRes.error || "Failed to send via SMTP";
        } else {
          adminStatus = "SUCCESS";
          adminDetails = "Delivered via SMTP";
        }
      } catch (e: any) {
        adminDetails = e.message || "Unknown error";
      }

      await db.insert(emailLogs).values({
        id: crypto.randomUUID(),
        formId: submissionId,
        sentTo: config.sendToEmail,
        status: adminStatus,
        details: `Admin Notification: ${adminDetails}`,
      });

      // 2. Send confirmation copy to the user's entered email
      try {
        const userRes = await sendEmail({
          to: data.email,
          subject: `We received your message: ${data.subject}`,
          html: emailHtml,
          replyTo: config.replyTo || config.sendToEmail,
          from: fromDisplay,
        });
        
        if (userRes && userRes.success === false) {
          userStatus = "FAILED";
          userDetails = userRes.error || "Failed to send via SMTP";
        } else {
          userStatus = "SUCCESS";
          userDetails = "Delivered via SMTP";
        }
      } catch (e: any) {
        userDetails = e.message || "Unknown error";
      }

      await db.insert(emailLogs).values({
        id: crypto.randomUUID(),
        formId: submissionId,
        sentTo: data.email,
        status: userStatus,
        details: `User Confirmation: ${userDetails}`,
      });
    }

    return ApiSuccess({ id: submissionId }, 201);
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}

// PUT - Update a submission (e.g. mark as read)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id || typeof isRead !== "boolean") {
      return ApiError("Invalid payload", 400);
    }

    await db.update(formSubmissions).set({ isRead }).where(eq(formSubmissions.id, id));

    return ApiSuccess({ id, isRead });
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}
