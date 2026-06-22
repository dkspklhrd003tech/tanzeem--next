import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";

// Simple session management using cookies
const SESSION_COOKIE = "admin_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  // In a real app, you'd use JWT or session tokens
  return Buffer.from(JSON.stringify({ userId, createdAt: Date.now() })).toString("base64");
}

export async function getSession(request?: NextRequest): Promise<{ userId: string } | null> {
  let sessionCookie: string | undefined = undefined;

  if (request) {
    sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  }

  if (!sessionCookie) {
    try {
      const cookieStore = await cookies();
      sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
    } catch {
      // ignore errors if called in non-request contexts
    }
  }

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(Buffer.from(sessionCookie, "base64").toString());

    // Check if session is expired (24 hours)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      return null;
    }

    return { userId: session.userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
}

export async function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
}

// Helper to get current user
export async function getCurrentUser(request?: NextRequest) {
  const session = await getSession(request);

  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}
