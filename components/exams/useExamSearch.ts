"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const DEBOUNCE_MS = 250;

export function useExamSearch(rawQuery: string) {
  const [debounced, setDebounced] = useState(rawQuery.trim());

  useEffect(() => {
    const id = setTimeout(() => setDebounced(rawQuery.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const query = api.exams.search.useInfiniteQuery(
    { query: debounced || undefined, limit: 30 },
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      placeholderData: (previous) => previous,
    },
  );

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    items,
    term: debounced,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
