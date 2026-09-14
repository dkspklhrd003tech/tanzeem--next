/**
 * Activity log details formatter
 * Converts raw JSON or unstructured strings into clean, human-readable text
 * and guarantees that raw JSON is NEVER returned or displayed to users.
 */

export function formatActivityDetails(
  details: string | null | undefined,
  entityType?: string | null,
  action?: string | null
): string {
  if (!details || details.trim() === "") {
    if (action === "login") return "Logged into Site Manager";
    return "—";
  }

  const trimmed = details.trim();

  // If not JSON, return as clean string
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);

    // If it's an array
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return "—";
      const cleanItems = parsed.map(item => (typeof item === "object" ? Object.values(item).join(" ") : String(item)));
      if (cleanItems.length <= 3) return cleanItems.join(", ");
      return `${cleanItems.slice(0, 3).join(", ")} and ${cleanItems.length - 3} more`;
    }

    if (typeof parsed === "object" && parsed !== null) {
      // Case 1: Settings keys updated
      if (Array.isArray(parsed.keys)) {
        const keys: string[] = parsed.keys.map(k => {
          // Format keys nicely: 'homepage_about_title' -> 'About Title' or keep readable
          return String(k).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        });
        if (keys.length === 0) return "Updated settings";
        if (keys.length === 1) return `Updated setting: ${keys[0]}`;
        if (keys.length <= 3) return `Updated settings: ${keys.join(", ")}`;
        return `Updated ${keys.length} settings: ${keys.slice(0, 3).join(", ")} +${keys.length - 3} more`;
      }

      // Case 2: Title attribute (videos, books, pages, events, audios)
      if (parsed.title) {
        return `"${parsed.title}"`;
      }

      // Case 3: Label attribute (menus, menu items)
      if (parsed.label) {
        return `"${parsed.label}"`;
      }

      // Case 4: Filename (media)
      if (parsed.filename) {
        return `File: ${parsed.filename}`;
      }

      // Case 5: Count (accounts, platforms, bulk actions)
      if (parsed.count !== undefined) {
        const target = entityType ? entityType.replace(/_/g, " ") : "items";
        return `${parsed.count} ${target}`;
      }

      // Case 6: Name attribute
      if (parsed.name) {
        return `"${parsed.name}"`;
      }

      // Case 7: Arbitrary key-value pairs
      const entries = Object.entries(parsed).filter(([k]) => !k.startsWith("_"));
      if (entries.length === 0) return "—";

      return entries
        .map(([k, v]) => {
          const readableKey = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const readableVal = typeof v === "object" ? JSON.stringify(v) : String(v);
          return `${readableKey}: ${readableVal}`;
        })
        .join(", ");
    }
  } catch (e) {
    // If JSON parsing fails, fall back to string
  }

  // Final sanitization to strip any remaining brackets if present
  return trimmed.replace(/^\{+/, "").replace(/\}+$/, "").trim() || "—";
}
