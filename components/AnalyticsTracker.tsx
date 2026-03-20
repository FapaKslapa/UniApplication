"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const ensureUserId = useAppStore((s) => s.ensureUserId);
  const trackVisit = api.stats.trackVisit.useMutation();
  const mutateRef = useRef(trackVisit.mutate);
  mutateRef.current = trackVisit.mutate;

  useEffect(() => {
    const clientId = ensureUserId();
    mutateRef.current({
      path: pathname,
      referer: typeof document !== "undefined" ? document.referrer : undefined,
      clientId,
    });
  }, [pathname, ensureUserId]);

  return null;
}
