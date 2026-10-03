"use client";

import { minutesOfDay } from "@/lib/agenda/dates";
import { pickHeroLesson } from "@/lib/agenda/lessons";
import { useNow } from "@/lib/agenda/useNow";
import { api } from "@/lib/api";
import { getDayOfWeek } from "@/lib/date-utils";
import { parseOrarioData } from "@/lib/orario-utils";

export function useProfessorStatus(name: string) {
  const now = useNow(60_000);
  const { data, isLoading } = api.orario.getOrario.useQuery({
    name: "INFORMATICA",
    location: "Tutte",
    dayOffset: 0,
    professorName: name,
  });

  if (isLoading || !data) {
    return { label: "Controllo…", tone: "muted" as const, isLoading: true };
  }

  const schedule = parseOrarioData(data);
  const today = schedule.find((entry) => entry.day === getDayOfWeek(now));
  const events = today?.events ?? [];
  const pick = pickHeroLesson(events, minutesOfDay(now), true);

  if (!pick || pick.status === "finished") {
    return { label: "Libero oggi", tone: "muted" as const, isLoading: false };
  }
  if (pick.status === "current" && pick.lesson?.aula) {
    return {
      label: `In lezione, ${pick.lesson.aula}`,
      tone: "success" as const,
      isLoading: false,
    };
  }
  if (pick.lesson) {
    const [start] = pick.lesson.time.split(" - ");
    return {
      label: `Prossima lezione alle ${start}`,
      tone: "muted" as const,
      isLoading: false,
    };
  }
  return { label: "Libero oggi", tone: "muted" as const, isLoading: false };
}
