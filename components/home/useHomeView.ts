"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { type HomeView, isHomeView } from "@/components/home/types";

function readInitialView(): HomeView {
  if (typeof window === "undefined") return "week";
  const param = new URLSearchParams(window.location.search).get("view");
  return isHomeView(param) ? param : "week";
}

function syncViewParam(view: HomeView) {
  const url = new URL(window.location.href);
  if (view === "week") url.searchParams.delete("view");
  else url.searchParams.set("view", view);
  window.history.replaceState(window.history.state, "", url);
}

export function useHomeView() {
  const searchParams = useSearchParams();
  const [activeView, setView] = useState<HomeView>(readInitialView);

  useEffect(() => {
    const param = searchParams.get("view");
    setView(isHomeView(param) ? param : "week");
  }, [searchParams]);

  const setActiveView = useCallback((view: HomeView) => {
    setView(view);
    syncViewParam(view);
  }, []);

  return { activeView, setActiveView };
}
