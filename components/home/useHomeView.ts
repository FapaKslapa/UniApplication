"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type HomeView, isHomeView } from "@/components/home/types";

function readInitialView(): HomeView {
  if (typeof window === "undefined") return "week";
  const param = new URLSearchParams(window.location.search).get("view");
  return isHomeView(param) ? param : "week";
}

export function useHomeView() {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<HomeView>(readInitialView);

  useEffect(() => {
    const param = searchParams.get("view");
    if (param === "month" || param === "week") setActiveView(param);
  }, [searchParams]);

  return { activeView, setActiveView };
}
