"use client";

import { useCallback } from "react";

export function useMediaTracking(entityType?: string, defaultEntityId?: string | number) {
  const trackAction = useCallback(async (actionType: "play" | "download" | "share", overrideEntityId?: string | number) => {
    const id = overrideEntityId || defaultEntityId;
    if (!entityType || !id) return;
    try {
      await fetch(`/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId: id, actionType })
      });
    } catch (e) {
      console.error(`Failed to track ${actionType}:`, e);
    }
  }, [entityType, defaultEntityId]);

  return {
    trackPlay: (id?: string | number) => trackAction("play", id),
    trackDownload: (id?: string | number) => trackAction("download", id),
    trackShare: (id?: string | number) => trackAction("share", id),
    trackAction
  };
}
