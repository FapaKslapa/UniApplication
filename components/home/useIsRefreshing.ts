"use client";

import { useIsFetching } from "@tanstack/react-query";

export function useIsRefreshing(): boolean {
  return useIsFetching({ queryKey: [["orario", "getOrario"]] }) > 0;
}
