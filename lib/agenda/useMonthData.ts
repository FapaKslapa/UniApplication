"use client";

import type { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
import { isVisibleLesson } from "@/lib/agenda/lessons";
import type { AgendaSource } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import {
  getMateriaColorMap,
  type ParsedEvent,
  parseEventTitle,
} from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

const FALLBACK_COLOR = "#71717a";

function normalizeSubject(materia: string): string {
  return materia.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
}

export function useMonthData(
  currentDate: DateTime,
  source: AgendaSource,
  active: boolean,
) {
  const { location, hiddenSubjects } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const professorName = source.kind === "professor" ? source.name : undefined;
  const linkIds =
    source.kind === "courses" && activeLinkIds.length > 0
      ? activeLinkIds
      : undefined;
  const enabled =
    active &&
    (source.kind === "professor" ? !!professorName : activeLinkIds.length > 0);

  const monthly = api.orario.getMonthlyOrario.useQuery(
    {
      year: currentDate.year,
      month: currentDate.month,
      linkIds,
      professorName,
      location,
    },
    { enabled, placeholderData: (previous) => previous },
  );

  const events = useMemo(() => monthly.data ?? [], [monthly.data]);

  const colorMap = useMemo(
    () =>
      getMateriaColorMap(
        events.map((event) => parseEventTitle(event.title).materia),
      ),
    [events],
  );

  const colorFor = useCallback(
    (materia: string) => colorMap[normalizeSubject(materia)] ?? FALLBACK_COLOR,
    [colorMap],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ParsedEvent[]>();
    for (const event of events) {
      if (!event.date) continue;
      const parsed = parseEventTitle(event.title);
      const parsedEvent: ParsedEvent = {
        time: event.time,
        materia: parsed.materia,
        aula: event.location,
        docente: event.professor,
        tipo: parsed.tipo,
        isVideo: event.isVideo,
        fullDate: event.date,
      };
      if (!isVisibleLesson(parsedEvent, hiddenSubjects)) continue;
      map.set(event.date, [...(map.get(event.date) ?? []), parsedEvent]);
    }
    return map;
  }, [events, hiddenSubjects]);

  const monthSubjects = useMemo(
    () =>
      Array.from(
        new Set(events.map((event) => parseEventTitle(event.title).materia)),
      ).sort(),
    [events],
  );

  return {
    eventsByDate,
    monthSubjects,
    colorFor,
    isPending: monthly.isLoading || monthly.isPlaceholderData,
    error: monthly.error,
    refetch: monthly.refetch,
  };
}
