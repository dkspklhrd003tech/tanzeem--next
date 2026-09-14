/**
 * Production-Grade URL Redirect Engine
 * Handles path normalization, circular loop detection, duplicate suppression,
 * wildcard/prefix resolution, and query parameter preservation.
 */

export interface RedirectRuleItem {
  id?: string;
  sourcePath: string;
  destinationPath: string;
  statusCode?: number;
  status?: string;
  isActive?: boolean;
  preserveQueryString?: boolean;
  matchType?: "exact" | "wildcard" | string;
  notes?: string | null;
}

/**
 * Normalizes a URL path:
 * - Trims whitespace
 * - Handles protocol for absolute URLs (http://, https://)
 * - Ensures leading slash on relative paths
 * - Removes consecutive redundant slashes (// -> /)
 * - Normalizes trailing slashes (except root /)
 * - Converts relative paths to lowercase for uniform comparison
 */
export function normalizeRoutePath(
  rawPath: string,
  isDestination: boolean = false
): { normalized: string; isExternal: boolean; error?: string } {
  if (!rawPath || typeof rawPath !== "string") {
    return { normalized: "", isExternal: false, error: "Path cannot be empty." };
  }

  let cleaned = rawPath.trim();

  // Check for external URL
  const isExternal = /^https?:\/\//i.test(cleaned);

  if (isExternal) {
    if (!isDestination) {
      return {
        normalized: "",
        isExternal: true,
        error: "Source path must be an internal relative path, not an external URL.",
      };
    }
    try {
      const url = new URL(cleaned);
      // Valid external URL
      return { normalized: url.href, isExternal: true };
    } catch {
      return {
        normalized: "",
        isExternal: true,
        error: "Invalid external URL format.",
      };
    }
  }

  // Relative path normalization
  // Disallow dangerous schemes like javascript:, data:
  if (/^(javascript|data|mailto|tel):/i.test(cleaned)) {
    return { normalized: "", isExternal: false, error: "Invalid path scheme." };
  }

  // Ensure leading slash
  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`;
  }

  // Collapse multiple consecutive slashes (e.g. //blog///post -> /blog/post)
  cleaned = cleaned.replace(/\/+/g, "/");

  // Keep wildcard if present
  const isWildcard = cleaned.includes("*");

  // For source without wildcard, or destination without wildcard, trim trailing slash if length > 1
  if (!cleaned.endsWith("/*") && cleaned.length > 1 && cleaned.endsWith("/")) {
    cleaned = cleaned.replace(/\/+$/, "");
  }

  // Standardize lowercase for internal relative paths
  cleaned = cleaned.toLowerCase();

  return { normalized: cleaned, isExternal: false };
}

/**
 * Detects whether adding/updating this redirect rule creates a loop or chain cycle.
 * Checks both immediate self-redirects (/a -> /a) and transitive chains (/a -> /b -> /c -> /a).
 */
export function detectRedirectCycle(
  source: string,
  destination: string,
  existingRules: RedirectRuleItem[],
  currentRuleId?: string
): { hasCycle: boolean; cyclePath?: string[]; error?: string } {
  const normSource = normalizeRoutePath(source, false).normalized;
  const { normalized: normDest, isExternal } = normalizeRoutePath(destination, true);

  if (!normSource || !normDest) {
    return { hasCycle: false };
  }

  // 1. Direct Self-Redirect
  if (normSource === normDest) {
    return {
      hasCycle: true,
      cyclePath: [normSource, normDest],
      error: `Self-redirect detected: "${normSource}" cannot point directly to itself.`,
    };
  }

  // If destination is an external URL, it cannot cycle internally (unless pointing back to current host)
  if (isExternal) {
    return { hasCycle: false };
  }

  // 2. Build adjacency mapping of active rules
  const ruleMap = new Map<string, string>();

  for (const r of existingRules) {
    if (r.id && currentRuleId && r.id === currentRuleId) continue;
    if (r.isActive === false || r.status === "inactive") continue;

    const s = normalizeRoutePath(r.sourcePath, false).normalized;
    const d = normalizeRoutePath(r.destinationPath, true).normalized;
    if (s && d && !d.startsWith("http")) {
      ruleMap.set(s, d);
    }
  }

  // Add the proposed rule into the graph
  ruleMap.set(normSource, normDest);

  // 3. Trace forward starting from destination
  const visited = new Set<string>();
  const path: string[] = [normSource];
  let curr: string | undefined = normDest;

  const MAX_HOPS = 15;
  let hops = 0;

  while (curr && hops < MAX_HOPS) {
    path.push(curr);

    // If destination matches our original source, or we hit an already visited node in path
    if (curr === normSource || visited.has(curr)) {
      return {
        hasCycle: true,
        cyclePath: path,
        error: `Circular redirect chain detected: ${path.join(" → ")}`,
      };
    }

    visited.add(curr);
    curr = ruleMap.get(curr);
    hops++;
  }

  return { hasCycle: false };
}

/**
 * Checks if another active rule already has this source path.
 */
export function checkDuplicateSource(
  source: string,
  existingRules: RedirectRuleItem[],
  currentRuleId?: string
): { isDuplicate: boolean; conflictingRule?: RedirectRuleItem; error?: string } {
  const normSource = normalizeRoutePath(source, false).normalized;
  if (!normSource) return { isDuplicate: false };

  const conflict = existingRules.find((r) => {
    if (r.id && currentRuleId && r.id === currentRuleId) return false;
    if (r.isActive === false || r.status === "inactive") return false;
    const s = normalizeRoutePath(r.sourcePath, false).normalized;
    return s === normSource;
  });

  if (conflict) {
    return {
      isDuplicate: true,
      conflictingRule: conflict,
      error: `An active redirect rule for "${normSource}" already exists (points to "${conflict.destinationPath}").`,
    };
  }

  return { isDuplicate: false };
}

/**
 * Validates a redirect rule completely, returning normalized values or errors.
 */
export function validateRedirectRule(
  source: string,
  destination: string,
  existingRules: RedirectRuleItem[] = [],
  currentRuleId?: string
): {
  valid: boolean;
  normalizedSource: string;
  normalizedDestination: string;
  matchType: "exact" | "wildcard";
  error?: string;
} {
  const srcRes = normalizeRoutePath(source, false);
  if (srcRes.error) {
    return { valid: false, normalizedSource: "", normalizedDestination: "", matchType: "exact", error: srcRes.error };
  }

  const destRes = normalizeRoutePath(destination, true);
  if (destRes.error) {
    return { valid: false, normalizedSource: "", normalizedDestination: "", matchType: "exact", error: destRes.error };
  }

  // Duplicate check
  const dupCheck = checkDuplicateSource(srcRes.normalized, existingRules, currentRuleId);
  if (dupCheck.isDuplicate) {
    return {
      valid: false,
      normalizedSource: srcRes.normalized,
      normalizedDestination: destRes.normalized,
      matchType: "exact",
      error: dupCheck.error,
    };
  }

  // Cycle check
  const cycleCheck = detectRedirectCycle(srcRes.normalized, destRes.normalized, existingRules, currentRuleId);
  if (cycleCheck.hasCycle) {
    return {
      valid: false,
      normalizedSource: srcRes.normalized,
      normalizedDestination: destRes.normalized,
      matchType: "exact",
      error: cycleCheck.error,
    };
  }

  const isWildcard = srcRes.normalized.includes("*");

  return {
    valid: true,
    normalizedSource: srcRes.normalized,
    normalizedDestination: destRes.normalized,
    matchType: isWildcard ? "wildcard" : "exact",
  };
}

/**
 * Matches an incoming requested path against active redirect rules.
 * 1. Exact match takes precedence.
 * 2. Wildcard match (most specific prefix first).
 */
export function matchRedirectRule(
  requestPath: string,
  activeRules: RedirectRuleItem[]
): { rule: RedirectRuleItem; targetUrl: string } | null {
  const normReq = normalizeRoutePath(requestPath, false).normalized;
  if (!normReq) return null;

  // 1. Exact match pass
  for (const rule of activeRules) {
    if (rule.isActive === false || rule.status === "inactive") continue;
    const ruleSource = normalizeRoutePath(rule.sourcePath, false).normalized;
    if (rule.matchType !== "wildcard" && !ruleSource.includes("*")) {
      if (ruleSource === normReq) {
        return { rule, targetUrl: rule.destinationPath };
      }
    }
  }

  // 2. Wildcard match pass (sorted by prefix length descending)
  const wildcardRules = activeRules
    .filter(
      (r) =>
        r.isActive !== false &&
        r.status !== "inactive" &&
        (r.matchType === "wildcard" || r.sourcePath.includes("*"))
    )
    .sort((a, b) => b.sourcePath.length - a.sourcePath.length);

  for (const rule of wildcardRules) {
    const rawSource = rule.sourcePath.trim();
    // Pattern example: /blog/* or /categories/*
    if (rawSource.endsWith("/*")) {
      const prefix = rawSource.slice(0, -1).toLowerCase(); // "/blog/"
      if (normReq.startsWith(prefix)) {
        const remainder = normReq.slice(prefix.length);
        let target = rule.destinationPath.trim();
        if (target.endsWith("/*")) {
          target = `${target.slice(0, -1)}${remainder}`;
        } else if (target.includes("*")) {
          target = target.replace("*", remainder);
        }
        return { rule, targetUrl: target };
      }
    } else if (rawSource.endsWith("*")) {
      const prefix = rawSource.slice(0, -1).toLowerCase(); // "/blog"
      if (normReq.startsWith(prefix)) {
        const remainder = normReq.slice(prefix.length);
        let target = rule.destinationPath.trim();
        if (target.endsWith("*")) {
          target = `${target.slice(0, -1)}${remainder}`;
        }
        return { rule, targetUrl: target };
      }
    }
  }

  return null;
}

/**
 * Appends or merges incoming searchParams into destination URL if preserveQueryString is true.
 */
export function applyQueryPreservation(
  destinationUrl: string,
  incomingSearchParams?: URLSearchParams | Record<string, string | string[] | undefined> | string,
  preserveQueryString: boolean = true
): string {
  if (!preserveQueryString || !incomingSearchParams) {
    return destinationUrl;
  }

  const incomingParams = new URLSearchParams(
    typeof incomingSearchParams === "string"
      ? incomingSearchParams
      : incomingSearchParams instanceof URLSearchParams
      ? incomingSearchParams.toString()
      : Object.entries(incomingSearchParams).flatMap(([k, v]) =>
          Array.isArray(v) ? v.map((val) => [k, val]) : v !== undefined ? [[k, v]] : []
        )
  );

  const incomingString = incomingParams.toString();
  if (!incomingString) return destinationUrl;

  const hasQuery = destinationUrl.includes("?");
  const separator = hasQuery ? "&" : "?";
  return `${destinationUrl}${separator}${incomingString}`;
}
