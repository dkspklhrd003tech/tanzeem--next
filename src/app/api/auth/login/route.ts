import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/api";
import { ApiError, ApiSuccess } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(request, "STRICT", "login");
    if (!rateLimit.success) {
      return ApiError("Too many login attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiError("Invalid email or password format", 400);
    }

    const { email, password, recaptchaToken } = validationResult.data;

    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken, "admin_login");
      if (!recaptchaResult.success) {
        return ApiError(`ReCAPTCHA failed: ${recaptchaResult.error}`, 403);
      }
    } else {
      // If token is missing entirely, we can enforce it if the env is set
      if (process.env.RECAPTCHA_SECRET_KEY) {
        return ApiError("ReCAPTCHA verification is required.", 403);
      }
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("DEBUG LOGIN: Searching for email:", email, "Found user:", user ? "YES" : "NO");

    if (!user) {
      return ApiError("Invalid credentials", 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    console.log("DEBUG LOGIN: Password valid:", isValid);

    if (!isValid) {
      return ApiError("Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return ApiError("Account is deactivated", 403);
    }

    // Create session
    const token = await createSession(user.id);

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Log activity
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
    });

    // Create response with session cookie
    const response = ApiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    await setSessionCookie(response, token);

    return response;
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}
