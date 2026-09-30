"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { TimetableChange } from "@/components/home/types";
import { api } from "@/lib/api";
import { useActiveLinkIds } from "@/lib/store";

const LAST_SEEN_KEY = "last_seen_timetable_update";

export function useTimetableChanges(isClient: boolean) {
  const searchParams = useSearchParams();
  const activeLinkIds = useActiveLinkIds();
  const [changes, setChanges] = useState<TimetableChange[] | null>(null);

  useEffect(() => {
    const encoded = searchParams.get("changes");
    if (!encoded) return;
    try {
      const decoded = JSON.parse(atob(encoded)) as TimetableChange[];
      const today = new Date().toISOString().split("T")[0];
      const upcoming = decoded.filter((change) => change.date >= today);
      if (upcoming.length === 0) return;
      setChanges(upcoming);
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      console.error("Failed to parse changes:", error);
    }
  }, [searchParams]);

  const { data: latestChanges } = api.orario.getLatestChanges.useQuery(
    { linkIds: activeLinkIds },
    { enabled: isClient && activeLinkIds.length > 0 && !changes },
  );

  useEffect(() => {
    if (!latestChanges || !isClient || changes) return;
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    if (!lastSeen || parseInt(lastSeen, 10) < latestChanges.updatedAt) {
      setChanges(latestChanges.changes);
      localStorage.setItem(LAST_SEEN_KEY, latestChanges.updatedAt.toString());
    }
  }, [latestChanges, isClient, changes]);

  return { changes, dismiss: () => setChanges(null) };
}
