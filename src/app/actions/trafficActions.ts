"use server";

import { db } from "@/db";
import { routeRedirects, error404Logs } from "@/db/schema";
import { eq, and, isNull, desc, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safe no-op outside Next.js request lifecycle
  }
}

export interface RedirectFilterParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface Error404FilterParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ─── REDIRECTS CRUD ──────────────────────────────────────────────────────────

export async function getRedirects(params: RedirectFilterParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [isNull(routeRedirects.deletedAt)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(routeRedirects.status, params.status));
  }

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(routeRedirects.sourcePath, term),
        like(routeRedirects.destinationPath, term),
        like(routeRedirects.notes, term)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [totalRes, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(routeRedirects)
      .where(whereClause),
    db
      .select()
      .from(routeRedirects)
      .where(whereClause)
      .orderBy(desc(routeRedirects.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalRes[0]?.count || 0);

  return {
    redirects: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

import { validateRedirectRule } from "@/lib/redirect-engine";

export async function createRedirect(data: {
  sourcePath: string;
  destinationPath: string;
  statusCode?: number;
  notes?: string;
  status?: string;
  isActive?: boolean;
  preserveQueryString?: boolean;
  matchType?: "exact" | "wildcard";
}) {
  const existingRules = await db
    .select({
      id: routeRedirects.id,
      sourcePath: routeRedirects.sourcePath,
      destinationPath: routeRedirects.destinationPath,
      status: routeRedirects.status,
      isActive: routeRedirects.isActive,
    })
    .from(routeRedirects)
    .where(isNull(routeRedirects.deletedAt));

  const validation = validateRedirectRule(
    data.sourcePath,
    data.destinationPath,
    existingRules
  );

  if (!validation.valid) {
    throw new Error(validation.error || "Invalid redirect rule configuration.");
  }

  const id = crypto.randomUUID();
  const statusCode = data.statusCode === 302 ? 302 : 301;
  const status = data.status || "active";
  const isActive = data.isActive !== undefined ? data.isActive : status === "active";
  const preserveQueryString = data.preserveQueryString !== undefined ? data.preserveQueryString : true;
  const matchType = data.matchType || validation.matchType;

  await db.insert(routeRedirects).values({
    id,
    sourcePath: validation.normalizedSource,
    destinationPath: validation.normalizedDestination,
    statusCode,
    hitCount: 0,
    status,
    isActive,
    preserveQueryString,
    matchType,
    notes: data.notes?.trim() || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true, id };
}

export async function updateRedirect(
  id: string,
  data: {
    sourcePath?: string;
    destinationPath?: string;
    statusCode?: number;
    notes?: string;
    status?: string;
    isActive?: boolean;
    preserveQueryString?: boolean;
    matchType?: "exact" | "wildcard";
  }
) {
  const [current] = await db
    .select()
    .from(routeRedirects)
    .where(and(eq(routeRedirects.id, id), isNull(routeRedirects.deletedAt)));

  if (!current) {
    throw new Error("Redirect rule not found");
  }

  const newSource = data.sourcePath !== undefined ? data.sourcePath : current.sourcePath;
  const newDest = data.destinationPath !== undefined ? data.destinationPath : current.destinationPath;

  if (data.sourcePath !== undefined || data.destinationPath !== undefined) {
    const existingRules = await db
      .select({
        id: routeRedirects.id,
        sourcePath: routeRedirects.sourcePath,
        destinationPath: routeRedirects.destinationPath,
        status: routeRedirects.status,
        isActive: routeRedirects.isActive,
      })
      .from(routeRedirects)
      .where(isNull(routeRedirects.deletedAt));

    const validation = validateRedirectRule(newSource, newDest, existingRules, id);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid redirect rule configuration.");
    }
  }

  const updatePayload: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.sourcePath !== undefined) {
    updatePayload.sourcePath = data.sourcePath.trim();
    if (data.matchType === undefined) {
      updatePayload.matchType = data.sourcePath.includes("*") ? "wildcard" : "exact";
    }
  }

  if (data.destinationPath !== undefined) {
    updatePayload.destinationPath = data.destinationPath.trim();
  }

  if (data.statusCode !== undefined) {
    updatePayload.statusCode = data.statusCode === 302 ? 302 : 301;
  }

  if (data.notes !== undefined) {
    updatePayload.notes = data.notes ? data.notes.trim() : null;
  }

  if (data.preserveQueryString !== undefined) {
    updatePayload.preserveQueryString = data.preserveQueryString;
  }

  if (data.matchType !== undefined) {
    updatePayload.matchType = data.matchType;
  }

  if (data.status !== undefined) {
    updatePayload.status = data.status;
    if (data.isActive === undefined) {
      updatePayload.isActive = data.status === "active";
    }
  }

  if (data.isActive !== undefined) {
    updatePayload.isActive = data.isActive;
    if (data.status === undefined) {
      updatePayload.status = data.isActive ? "active" : "inactive";
    }
  }

  await db
    .update(routeRedirects)
    .set(updatePayload)
    .where(and(eq(routeRedirects.id, id), isNull(routeRedirects.deletedAt)));

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true };
}

export async function deleteRedirect(id: string) {
  await db
    .update(routeRedirects)
    .set({
      deletedAt: new Date(),
      status: "inactive",
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(routeRedirects.id, id));

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true };
}

// ─── 404 LOGS CRUD ────────────────────────────────────────────────────────────

export async function get404Logs(params: Error404FilterParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [isNull(error404Logs.deletedAt)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(error404Logs.status, params.status));
  }

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(error404Logs.path, term),
        like(error404Logs.referer, term),
        like(error404Logs.ipAddress, term)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [totalRes, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(error404Logs)
      .where(whereClause),
    db
      .select()
      .from(error404Logs)
      .where(whereClause)
      .orderBy(desc(error404Logs.updatedAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalRes[0]?.count || 0);

  return {
    logs: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function resolve404Log(id: string, status: "resolved" | "unresolved" | "ignored" = "resolved") {
  await db
    .update(error404Logs)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(error404Logs.id, id));

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true };
}

export async function delete404Log(id: string) {
  await db
    .update(error404Logs)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(error404Logs.id, id));

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true };
}

export async function convert404ToRedirect(data: {
  logId: string;
  destinationPath: string;
  statusCode?: number;
  notes?: string;
  preserveQueryString?: boolean;
}) {
  const [log] = await db
    .select()
    .from(error404Logs)
    .where(and(eq(error404Logs.id, data.logId), isNull(error404Logs.deletedAt)));

  if (!log) {
    throw new Error("404 log entry not found");
  }

  const existingRules = await db
    .select({
      id: routeRedirects.id,
      sourcePath: routeRedirects.sourcePath,
      destinationPath: routeRedirects.destinationPath,
      status: routeRedirects.status,
      isActive: routeRedirects.isActive,
    })
    .from(routeRedirects)
    .where(isNull(routeRedirects.deletedAt));

  const validation = validateRedirectRule(
    log.path,
    data.destinationPath,
    existingRules
  );

  if (!validation.valid) {
    throw new Error(validation.error || "Invalid redirect destination.");
  }

  const statusCode = data.statusCode === 302 ? 302 : 301;
  const redirectId = crypto.randomUUID();
  const preserveQueryString = data.preserveQueryString !== undefined ? data.preserveQueryString : true;

  // Create redirect
  await db.insert(routeRedirects).values({
    id: redirectId,
    sourcePath: validation.normalizedSource,
    destinationPath: validation.normalizedDestination,
    statusCode,
    hitCount: log.hitCount || 0,
    status: "active",
    isActive: true,
    preserveQueryString,
    matchType: validation.matchType,
    notes: data.notes?.trim() || `Converted from 404 log (${log.path})`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  // Mark 404 log as redirected
  await db
    .update(error404Logs)
    .set({
      status: "redirected",
      redirectTo: validation.normalizedDestination,
      updatedAt: new Date(),
    })
    .where(eq(error404Logs.id, data.logId));

  safeRevalidate("/sitemanager/redirects");
  safeRevalidate("/admin/redirects");
  return { success: true, redirectId };
}

// ─── TELEMETRY & STATS ────────────────────────────────────────────────────────

export async function getTrafficStats() {
  const [
    totalRedirectsRes,
    activeRedirectsRes,
    inactiveRedirectsRes,
    redirectHitsRes,
    total404Res,
    unresolved404Res,
    resolved404Res,
    redirected404Res,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(routeRedirects)
      .where(isNull(routeRedirects.deletedAt)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(routeRedirects)
      .where(and(isNull(routeRedirects.deletedAt), eq(routeRedirects.status, "active"), eq(routeRedirects.isActive, true))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(routeRedirects)
      .where(and(isNull(routeRedirects.deletedAt), or(eq(routeRedirects.status, "inactive"), eq(routeRedirects.isActive, false)))),
    db
      .select({ sum: sql<number>`coalesce(sum(${routeRedirects.hitCount}), 0)` })
      .from(routeRedirects)
      .where(isNull(routeRedirects.deletedAt)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(error404Logs)
      .where(isNull(error404Logs.deletedAt)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(error404Logs)
      .where(and(isNull(error404Logs.deletedAt), eq(error404Logs.status, "unresolved"))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(error404Logs)
      .where(and(isNull(error404Logs.deletedAt), eq(error404Logs.status, "resolved"))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(error404Logs)
      .where(and(isNull(error404Logs.deletedAt), eq(error404Logs.status, "redirected"))),
  ]);

  const totalRedirects = Number(totalRedirectsRes[0]?.count || 0);
  const activeRedirects = Number(activeRedirectsRes[0]?.count || 0);
  const inactiveRedirects = Number(inactiveRedirectsRes[0]?.count || 0);
  const redirectHits = Number(redirectHitsRes[0]?.sum || 0);

  const total404 = Number(total404Res[0]?.count || 0);
  const unresolved404 = Number(unresolved404Res[0]?.count || 0);
  const resolved404 = Number(resolved404Res[0]?.count || 0);
  const redirected404 = Number(redirected404Res[0]?.count || 0);

  const combinedDenominator = Math.max(1, activeRedirects + resolved404 + unresolved404);
  const activeRedirectsPct = Math.round((activeRedirects / combinedDenominator) * 100);
  const resolved404Pct = Math.round((resolved404 / combinedDenominator) * 100);
  const unresolved404Pct = Math.max(0, 100 - activeRedirectsPct - resolved404Pct);

  return {
    redirects: {
      total: totalRedirects,
      active: activeRedirects,
      inactive: inactiveRedirects,
      totalHits: redirectHits,
    },
    errors404: {
      total: total404,
      unresolved: unresolved404,
      resolved: resolved404,
      redirected: redirected404,
    },
    healthBreakdown: {
      activeRedirectsPct,
      resolved404Pct,
      unresolved404Pct,
    },
  };
}

// ─── LOGGING HELPER ───────────────────────────────────────────────────────────

export async function log404Detection(payload: {
  path: string;
  referer?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    let cleanPath = payload.path.trim();
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;

    // Check if path already exists in unresolved or general active log
    const [existing] = await db
      .select()
      .from(error404Logs)
      .where(and(eq(error404Logs.path, cleanPath), isNull(error404Logs.deletedAt)))
      .limit(1);

    if (existing) {
      await db
        .update(error404Logs)
        .set({
          hitCount: sql`${error404Logs.hitCount} + 1`,
          referer: payload.referer || existing.referer,
          userAgent: payload.userAgent || existing.userAgent,
          ipAddress: payload.ipAddress || existing.ipAddress,
          updatedAt: new Date(),
        })
        .where(eq(error404Logs.id, existing.id));
      return { success: true, updated: true, id: existing.id };
    } else {
      const id = crypto.randomUUID();
      await db.insert(error404Logs).values({
        id,
        path: cleanPath,
        referer: payload.referer || null,
        userAgent: payload.userAgent || null,
        ipAddress: payload.ipAddress || null,
        hitCount: 1,
        status: "unresolved",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      return { success: true, created: true, id };
    }
  } catch (error) {
    console.error("Failed to log 404 detection:", error);
    return { success: false };
  }
}
