"use client";

import type { DateTime } from "luxon";
import { useMemo } from "react";
import { monthGridDays, startOfDay } from "@/lib/agenda/dates";
import {
  type DayExams,
  type ExamMilestoneKind,
  romeDayKey,
} from "@/lib/agenda/exams";
import type { AgendaSource } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import type { ExamDTO } from "@/lib/exams/dto";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

const STALE_TIME = 5 * 60 * 1000;

function dayOf(map: Map<string, DayExams>, key: string): DayExams {
  const existing = map.get(key);
  if (existing) return existing;
  const created: DayExams = { exams: [], milestones: [] };
  map.set(key, created);
  return created;
}

function addMilestone(
  map: Map<string, DayExams>,
  exam: ExamDTO,
  kind: ExamMilestoneKind,
  iso: string | null,
  from: string,
  to: string,
) {
  if (!iso) return;
  const key = romeDayKey(iso);
  if (!key || key < from || key > to) return;
  dayOf(map, key).milestones.push({
    key: `${exam.id}-${kind}`,
    kind,
    subject: exam.subject,
    regConfirmed: exam.regConfirmed,
  });
}

export function useAgendaExams(selectedDate: DateTime, source: AgendaSource) {
  const hiddenSubjects = useAppStore((state) => state.hiddenSubjects);
  const linkIds = useActiveLinkIds();
  const enabled = source.kind === "courses" && linkIds.length > 0;

  const grid = monthGridDays(selectedDate);
  const fromDay = grid[0];
  const toDay = grid[grid.length - 1];
  const fromKey = fromDay.toISODate() ?? "";
  const toKey = toDay.toISODate() ?? "";
  const from = startOfDay(fromDay).toUTC().toISO() ?? "";
  const to = startOfDay(toDay).endOf("day").toUTC().toISO() ?? "";

  const query = api.exams.forAgenda.useQuery(
    { linkIds, from, to },
    { enabled, staleTime: STALE_TIME, placeholderData: (previous) => previous },
  );

  const examsByDay = useMemo(() => {
    const map = new Map<string, DayExams>();
    if (!enabled) return map;
    for (const exam of query.data ?? []) {
      if (!exam.following && hiddenSubjects.includes(exam.subject)) continue;
      const key = romeDayKey(exam.startsAt);
      if (key) dayOf(map, key).exams.push(exam);
      if (!exam.following) continue;
      addMilestone(map, exam, "reg_open", exam.regOpensAt, fromKey, toKey);
      addMilestone(map, exam, "reg_close", exam.regClosesAt, fromKey, toKey);
    }
    for (const day of map.values()) {
      day.exams.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    return map;
  }, [enabled, query.data, hiddenSubjects, fromKey, toKey]);

  return { examsByDay };
}
