"use client";

import { useSubjectFilters } from "@/lib/agenda/useSubjectFilters";
import { api } from "@/lib/api";
import { useActiveLinkIds } from "@/lib/store";

export function useSubjectVisibility() {
  const { hiddenSubjects, toggleSubject } = useSubjectFilters();
  const activeLinkIds = useActiveLinkIds();
  const linkIds = activeLinkIds.length > 0 ? activeLinkIds : undefined;

  const { data: subjects, isLoading } = api.orario.getSubjects.useQuery(
    { linkIds },
    { enabled: !!linkIds },
  );

  const visibleCount = subjects
    ? subjects.filter((subject) => !hiddenSubjects.includes(subject)).length
    : 0;

  return { subjects, isLoading, hiddenSubjects, toggleSubject, visibleCount };
}

export type SubjectVisibility = ReturnType<typeof useSubjectVisibility>;
