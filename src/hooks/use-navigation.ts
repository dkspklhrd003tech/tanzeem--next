"use client";

/**
 * useNavigation — fetch a hierarchical menu tree from the API.
 *
 * Returns `{ items, isLoading }` where `items` is the nested tree as served by
 * `/api/menus`. Consumers map `label`/`url`/`children` themselves. No hardcoded
 * fallback: if the menu is empty the nav simply renders nothing (after Phase 2,
 * the DB is seeded via `scripts/seed-navigation.ts`).
 */
import useSWR from "swr";

export interface MenuNode {
  id: string;
  label: string;
  url: string | null;
  parentId: string | null;
  order: number;
  isOpenInNew: boolean;
  isVisible: boolean;
  menuType: string;
  children?: MenuNode[];
}

interface MenusResponse {
  menus: MenuNode[];
}

const fetcher = async (url: string): Promise<MenuNode[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load navigation");
  const data: MenusResponse = await res.json();
  return data.menus ?? [];
};

export function useNavigation(menuType: "main" | "footer" = "main", visibleOnly = true) {
  const params = new URLSearchParams({
    menuType,
    hierarchy: "true",
  });
  if (visibleOnly) params.set("visibleOnly", "true");

  const { data, error, isLoading } = useSWR<MenuNode[]>(
    `/api/menus?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5 * 60 * 1000 },
  );

  return {
    items: data ?? [],
    isLoading,
    error,
  };
}
