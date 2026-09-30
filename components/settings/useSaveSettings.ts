"use client";

import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { useAppStore } from "@/lib/store";

type Options = {
  draft: CourseDraft;
  setError: (message: string | null) => void;
  onSaved: () => void;
};

export function useSaveSettings({ draft, setError, onSaved }: Options) {
  const { setCalendarIds, setCourseNames, setCourseIds, setHiddenSubjects } =
    useAppStore();

  return () => {
    const courses = draft.selectedCourses;
    if (courses.length === 0) {
      setError("Seleziona almeno un corso.");
      return;
    }
    setCalendarIds(courses.map((course) => course.linkId));
    setCourseNames(courses.map((course) => course.name));
    setCourseIds(courses.map((course) => course.id));
    setHiddenSubjects([]);
    onSaved();
  };
}
