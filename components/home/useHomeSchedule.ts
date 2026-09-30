"use client";

import { useMemo } from "react";
import { api } from "@/lib/api";
import { getMateriaColorMap, parseOrarioData } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

export function useHomeSchedule(weekOffset: number, enabled: boolean) {
  const { userRole, professorName, location } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const linkIds = activeLinkIds.length > 0 ? activeLinkIds : undefined;
  const professor = userRole === "professor" ? professorName : undefined;

  const {
    data: orario,
    isLoading,
    error,
  } = api.orario.getOrario.useQuery(
    {
      name: "INFORMATICA",
      location,
      dayOffset: weekOffset,
      linkIds,
      professorName: professor,
    },
    { placeholderData: (previousData) => previousData, enabled },
  );

  const { data: subjects = [] } = api.orario.getSubjects.useQuery(
    { linkIds, professorName: professor },
    { enabled },
  );

  const schedule = useMemo(
    () => (orario ? parseOrarioData(orario) : []),
    [orario],
  );
  const materiaColorMap = useMemo(
    () => getMateriaColorMap(subjects),
    [subjects],
  );

  return {
    schedule,
    materiaColorMap,
    isInitialLoading: isLoading && !orario,
    error,
  };
}
