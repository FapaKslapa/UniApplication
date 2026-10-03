"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  baselineCourses,
  collectUnseenChanges,
  markChangesViewed,
} from "@/components/home/changesSeen";
import type { TimetableChange } from "@/components/home/types";
import { api } from "@/lib/api";
import { useActiveLinkIds } from "@/lib/store";

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
      markChangesViewed();
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      console.error("Failed to parse changes:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isClient) baselineCourses(activeLinkIds);
  }, [isClient, activeLinkIds]);

  const { data: latestChanges } = api.orario.getLatestChanges.useQuery(
    { linkIds: activeLinkIds },
    { enabled: isClient && activeLinkIds.length > 0 && !changes },
  );

  useEffect(() => {
    if (!latestChanges || !isClient || changes) return;
    const fresh = collectUnseenChanges(latestChanges.perLink ?? []);
    if (fresh.length > 0) setChanges(fresh);
  }, [latestChanges, isClient, changes]);

  return { changes, dismiss: () => setChanges(null) };
}
