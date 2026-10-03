"use client";

import { useEffect, useState } from "react";
import { getCurrentItalianDateTime } from "@/lib/date-utils";

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => getCurrentItalianDateTime());

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        setNow(getCurrentItalianDateTime());
      }
    };
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);

  return now;
}
