"use client";

/**
 * useSettings — single source of truth for site settings on the client.
 *
 * Header, Footer, MainLayout and PageBanner all need the same `/api/settings`
 * payload (flattened into a `Record<string,string>`). Rather than each component
 * firing its own fetch, this hook caches the result via SWR so the data is loaded
 * once and shared across every consumer on the page.
 */
import useSWR from "swr";
import { useMemo } from "react";

export interface SettingsGroups {
  [group: string]: Record<string, string>;
}

const fetcher = async (url: string): Promise<SettingsGroups> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load settings");
  const data = await res.json();
  return (data.settings ?? {}) as SettingsGroups;
};

/**
 * Flatten the grouped settings object into a single `Record<string,string>`
 * keyed by setting key. Later groups overwrite earlier ones — acceptable since
 * setting keys are globally unique.
 */
function flatten(groups: SettingsGroups | undefined): Record<string, string> {
  if (!groups) return {};
  const flat: Record<string, string> = {};
  for (const group of Object.values(groups)) {
    for (const [k, v] of Object.entries(group)) {
      flat[k] = v;
    }
  }
  return flat;
}

export function useSettings() {
  const { data, error, isLoading } = useSWR<SettingsGroups>("/api/settings", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 min — settings rarely change
  });

  // Memoize so consumers get a stable object reference across re-renders.
  // Without this, `flatten()` returns a new object every call, causing any
  // useEffect that depends on `settings` to fire in an infinite loop.
  const settings = useMemo(() => flatten(data), [data]);

  return {
    settings,
    groups: data ?? {},
    isLoading,
    error,
  };
}

/**
 * Convenience accessor for a single group (e.g. `useSettingsGroup("global_banner")`).
 */
export function useSettingsGroup(group: string): Record<string, string> {
  const { groups } = useSettings();
  return groups[group] ?? {};
}
