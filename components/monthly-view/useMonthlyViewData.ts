"use client";

import type { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
import type { MonthEvent } from "@/components/monthly-view/types";
import { useSubjectFilters } from "@/lib/agenda/useSubjectFilters";
import { api } from "@/lib/api";
import { getMateriaColorMap, parseEventTitle } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

const FALLBACK_COLOR = "#666666";

export function useMonthlyViewData(
  currentDate: DateTime,
  materiaColorMap: Record<string, string>,
) {
  const { professorName, userRole, location } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const { hiddenSubjects, toggleSubject } = useSubjectFilters();

  const { data: monthlyEvents = [], isFetching } =
    api.orario.getMonthlyOrario.useQuery(
      {
        year: currentDate.year,
        month: currentDate.month,
        linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
        location,
        professorName: userRole === "professor" ? professorName : undefined,
      },
      {
        enabled:
          activeLinkIds.length > 0 ||
          (userRole === "professor" && !!professorName),
        placeholderData: (previousData) => previousData,
      },
    );

  const materie = useMemo(
    () =>
      Array.from(
        new Set(monthlyEvents.map((e) => parseEventTitle(e.title).materia)),
      ).sort(),
    [monthlyEvents],
  );

  const internalColorMap = useMemo(
    () => getMateriaColorMap(materie),
    [materie],
  );

  const colorFor = useCallback(
    (materia: string) => {
      const normalized = materia
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toUpperCase();
      return (
        internalColorMap[normalized] ??
        materiaColorMap[normalized] ??
        FALLBACK_COLOR
      );
    },
    [internalColorMap, materiaColorMap],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, MonthEvent[]>();
    for (const event of monthlyEvents) {
      if (!event.date) continue;
      if (hiddenSubjects.includes(parseEventTitle(event.title).materia)) {
        continue;
      }
      map.set(event.date, [...(map.get(event.date) ?? []), event]);
    }
    return map;
  }, [monthlyEvents, hiddenSubjects]);

  return {
    eventCount: monthlyEvents.length,
    isFetching,
    materie,
    hiddenSubjects,
    colorFor,
    eventsByDate,
    toggleSubject,
  };
}
