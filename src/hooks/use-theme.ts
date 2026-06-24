"use client";

import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "sm_admin_theme";

export type AdminTheme = "dark" | "light";

/**
 * Hook that manages dark/light theme for the admin panel.
 * State is persisted to localStorage and the className is driven
 * directly by the React render (in layout.tsx), so no manual DOM
 * class manipulation is needed here.
 */
export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>("dark");

  // Read persisted preference on mount (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as AdminTheme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
    } catch {
      // localStorage not available (SSR / private mode)
    }
  }, []);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
