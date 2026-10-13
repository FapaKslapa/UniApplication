"use client";

import { useEffect, useRef } from "react";

export function useRefetchOnOnline(refetch: () => unknown) {
  const ref = useRef(refetch);
  ref.current = refetch;
  useEffect(() => {
    const handle = () => {
      ref.current();
    };
    window.addEventListener("online", handle);
    return () => window.removeEventListener("online", handle);
  }, []);
}
