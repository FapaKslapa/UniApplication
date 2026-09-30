"use client";

import { useEffect, useState } from "react";

export function useViewport() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [showTabs, setShowTabs] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsLandscape(
        window.innerWidth > window.innerHeight && window.innerHeight < 600,
      );
      setShowTabs(window.innerHeight < 750);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isLandscape, showTabs };
}
