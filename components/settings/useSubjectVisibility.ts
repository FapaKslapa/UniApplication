"use client";

import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { useSubjectFilters } from "@/lib/agenda/useSubjectFilters";
import { api } from "@/lib/api";

export function useSubjectVisibility(draft: CourseDraft) {
  const { hiddenSubjects, toggleSubject } = useSubjectFilters();
  const isStudent = draft.role === "student";
  const linkIds =
    isStudent && draft.previewIds.length > 0 ? draft.previewIds : undefined;
  const professorName = isStudent ? undefined : draft.professorName;

  const { data: subjects, isLoading } = api.orario.getSubjects.useQuery(
    { linkIds, professorName },
    { enabled: isStudent ? !!linkIds : !!draft.professorName },
  );

  const visibleCount = subjects
    ? subjects.filter((subject) => !hiddenSubjects.includes(subject)).length
    : 0;

  return { subjects, isLoading, hiddenSubjects, toggleSubject, visibleCount };
}

export type SubjectVisibility = ReturnType<typeof useSubjectVisibility>;
