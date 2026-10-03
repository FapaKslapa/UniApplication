"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export function useNow() {
  const [now, setNow] = useState(() => DateTime.now());
  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
