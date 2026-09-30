"use client";

import type { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
import { weekDays, weekOffsetDays } from "@/lib/agenda/dates";
import { isVisibleLesson, sortByStart } from "@/lib/agenda/lessons";
import type { AgendaSource, DayEntry } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import { getDayOfWeek } from "@/lib/date-utils";
import { getMateriaColorMap, parseOrarioData } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

const FALLBACK_COLOR = "#71717a";

function normalizeSubject(materia: string): string {
  return materia.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
}

export function useAgendaData(
  selectedDate: DateTime,
  today: DateTime,
  source: AgendaSource,
) {
  const { location, hiddenSubjects } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const professorName = source.kind === "professor" ? source.name : undefined;
  const linkIds =
    source.kind === "courses" && activeLinkIds.length > 0
      ? activeLinkIds
      : undefined;
  const enabled =
    source.kind === "professor" ? !!professorName : activeLinkIds.length > 0;

  const orario = api.orario.getOrario.useQuery(
    {
      name: "INFORMATICA",
      location,
      dayOffset: weekOffsetDays(selectedDate, today),
      linkIds,
      professorName,
    },
    { placeholderData: (previous) => previous, enabled },
  );

  const subjects = api.orario.getSubjects.useQuery(
    { linkIds, professorName },
    { enabled },
  );

  const colorMap = useMemo(
    () => getMateriaColorMap(subjects.data ?? []),
    [subjects.data],
  );

  const colorFor = useCallback(
    (materia: string) => colorMap[normalizeSubject(materia)] ?? FALLBACK_COLOR,
    [colorMap],
  );

  const isPlaceholder = orario.isPlaceholderData;
  const schedule = useMemo(
    () => (orario.data && !isPlaceholder ? parseOrarioData(orario.data) : []),
    [orario.data, isPlaceholder],
  );

  const weekDates = useMemo(() => weekDays(selectedDate), [selectedDate]);

  const days = useMemo<DayEntry[]>(
    () =>
      weekDates.map((date) => {
        const dayData = schedule.find(
          (entry) => entry.day === getDayOfWeek(date),
        );
        const events = sortByStart(
          (dayData?.events ?? []).filter((event) =>
            isVisibleLesson(event, hiddenSubjects),
          ),
        );
        return { date, events };
      }),
    [weekDates, schedule, hiddenSubjects],
  );

  const weekSubjects = useMemo(
    () =>
      Array.from(
        new Set(
          schedule.flatMap((entry) => entry.events.map((e) => e.materia)),
        ),
      ).sort(),
    [schedule],
  );

  return {
    days,
    weekSubjects,
    colorFor,
    isPending: orario.isLoading || isPlaceholder,
    error: orario.error,
    refetch: orario.refetch,
  };
}
