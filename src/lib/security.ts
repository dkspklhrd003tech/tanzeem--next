/**
 * security.ts — URL sanitization & slug integrity utilities.
 *
 * Used by navigation rendering (Header/Footer), the menus API, and page slug
 * create/edit to keep URLs safe and slugs stable + collision-free.
 *
 * Design: isomorphic (works in server components, API routes, and the browser).
 * No DOM APIs, no Node built-ins beyond URL parsing.
 */

// ─── External link allowlist ─────────────────────────────────────────────────
// Domains we trust for menu items / footer links. Unknown externals are still
// rendered (so admins can add new partners) but flagged via `isAllowedExternal`.
const ALLOWED_EXTERNAL_DOMAINS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "facebook.com",
  "www.facebook.com",
  "twitter.com",
  "x.com",
  "wa.me",
  "drisrar.com",
  "www.drisrar.com",
  "lms.quranacademy.com",
  "quranacademy.com",
  "app.dhtr.org",
  "dhtr.org",
]);

/** Schemes that are never safe to render as an href (XSS vectors). */
const BLOCKED_SCHEMES = /^(javascript|data|vbscript|file|about):/i;

// ─── URL handling ────────────────────────────────────────────────────────────

/** True for absolute http(s) URLs (incl. protocol-relative //host). */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

/** Extract the registrable host from a URL, lower-cased without `www.`. */
export function getHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    // Protocol-relative URLs need a scheme for the URL parser.
    const u = new URL(url.startsWith("//") ? `https:${url}` : url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return null;
  }
}

/** True if an external URL points to a domain in the trust allowlist. */
export function isAllowedExternal(url: string | null | undefined): boolean {
  const host = getHostname(url);
  if (!host) return false;
  return ALLOWED_EXTERNAL_DOMAINS.has(host);
}

/**
 * Sanitize a user-supplied href for safe rendering.
 *
 * - Rejects `javascript:`, `data:`, etc. → returns `null` (caller renders nothing).
 * - Accepts internal paths (`/`, `/organization`, `#anchor`, `mailto:`, `tel:`).
 * - Accepts external http(s) URLs.
 *
 * Returns the cleaned URL string or `null` when the URL must be dropped.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Block dangerous schemes.
  if (BLOCKED_SCHEMES.test(trimmed)) return null;

  // Anchors, internal paths, and mailto/tel are safe as-is.
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }

  // Protocol-relative → normalize to https.
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  // Absolute http(s).
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      // Re-parse to drop any embedded cruft; keep the normalized form.
      return new URL(trimmed).toString();
    } catch {
      return null;
    }
  }

  // Anything else (bare words, spaces, weird tokens) is not a valid href.
  return null;
}

/**
 * Resolve a menu-item-style URL into something renderable, returning the safe
 * href plus metadata the UI needs (external? new-tab? allowed?).
 */
export interface ResolvedLink {
  href: string | null;
  isExternal: boolean;
  isOpenInNew: boolean;
  isAllowed: boolean;
}

export function resolveMenuLink(
  url: string | null | undefined,
  isOpenInNew: boolean = false,
): ResolvedLink {
  const href = sanitizeUrl(url);
  if (!href) {
    return { href: null, isExternal: false, isOpenInNew: false, isAllowed: false };
  }
  const isExternal = isExternalUrl(href);
  return {
    href,
    isExternal,
    // Only external links ever open in a new tab.
    isOpenInNew: isExternal ? isOpenInNew : false,
    isAllowed: isExternal ? isAllowedExternal(href) : true,
  };
}

// ─── Anchor rel for external links ───────────────────────────────────────────

/** The `rel` attribute to apply to every external `<a>`. */
export const EXTERNAL_LINK_REL = "noopener noreferrer";

// ─── Slug integrity ──────────────────────────────────────────────────────────

/**
 * Validate a slug. Slugs are URL path segments joined by `/` (supports nested
 * pages like `organization/our-ideology/basic-belief`).
 *
 * Rules: lowercase, alphanumerics + hyphens + forward slashes, no leading/trailing
 * slash, no consecutive slashes or hyphens.
 */
const SLUG_RE = /^(?!\/)[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*(?!\/)$/;

export interface SlugValidation {
  ok: boolean;
  reason?: string;
}

export function validateSlug(slug: string | null | undefined): SlugValidation {
  if (!slug) return { ok: false, reason: "Slug is required" };
  const s = slug.trim().toLowerCase();
  if (!s) return { ok: false, reason: "Slug is required" };
  if (s.length > 191) return { ok: false, reason: "Slug must be 191 characters or fewer" };
  if (!SLUG_RE.test(s)) {
    return {
      ok: false,
      reason: "Slug must be lowercase, using letters, numbers, hyphens and single slashes (e.g. 'about-us' or 'org/history')",
    };
  }
  return { ok: true };
}

/**
 * Generate a URL-safe slug from an arbitrary title.
 * Transliterates common Urdu/Arabic accents away, collapses spaces/punctuation
 * to hyphens. Does NOT guarantee uniqueness — pair with `ensureUniqueSlug`.
 */
export function generateSlug(title: string | null | undefined): string {
  if (!title) return "";
  return title
    .toString()
    // Normalize diacritics (é → e, ñ → n) before stripping non-ascii.
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    // Strip Arabic/Urdu diacritics (tashkeel, hamza variants).
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "");
}

/**
 * Append `-2`, `-3`, … to a base slug until it doesn't collide with `existing`.
 * `existing` is a Set of slugs already taken (caller queries the table first).
 */
export function ensureUniqueSlug(baseSlug: string, existing: Set<string>): string {
  if (!existing.has(baseSlug)) return baseSlug;
  let n = 2;
  // If the base already ends in -N, keep incrementing from there.
  const trailing = baseSlug.match(/^(.*?)-(\d+)$/);
  if (trailing) {
    baseSlug = trailing[1];
    n = parseInt(trailing[2], 10) + 1;
  }
  let candidate = `${baseSlug}-${n}`;
  while (existing.has(candidate)) {
    n += 1;
    candidate = `${baseSlug}-${n}`;
  }
  return candidate;
}
