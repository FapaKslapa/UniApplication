"use client";

import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

type Options = {
  draft: CourseDraft;
  userId: string;
  setError: (message: string | null) => void;
  onSaved: () => void;
};

export function useSaveSettings({ draft, userId, setError, onSaved }: Options) {
  const {
    setCalendarIds,
    setCourseNames,
    setCourseIds,
    setCalendarId,
    setCourseName,
    setStoredCourseId,
    setCalendarUrlStore,
    setHiddenSubjects,
    setUserRole,
    setProfessorName,
  } = useAppStore();

  const addCourse = api.courses.add.useMutation({
    onSuccess: () => {
      draft.refetchCourses();
      setError(null);
    },
    onError: (error) =>
      setError(error.message || "Errore durante l'aggiunta del corso"),
  });

  const clearLegacySelection = () => {
    setCalendarId("");
    setCourseName("");
    setStoredCourseId("");
  };

  const applyStudent = (linkIds: string[], names: string[], ids: string[]) => {
    setUserRole("student");
    setProfessorName("");
    setCalendarIds(linkIds);
    setCourseNames(names);
    setCourseIds(ids);
    setHiddenSubjects([]);
    clearLegacySelection();
  };

  const saveProfessor = () => {
    if (!draft.professorName) {
      setError("Seleziona il tuo nome docente.");
      return;
    }
    setUserRole("professor");
    setProfessorName(draft.professorName);
    setCalendarIds([]);
    setCourseNames([]);
    setCourseIds([]);
    clearLegacySelection();
    setCalendarUrlStore("");
    setHiddenSubjects([]);
    onSaved();
  };

  const saveNewCourse = () => {
    const { year, academicYear } = draft.newCourse;
    if (year === "") {
      setError("Specifica l'anno del corso.");
      return;
    }
    const name = draft.newCourse.name.trim();
    const [linkId] = draft.previewIds;
    addCourse.mutate(
      {
        name,
        linkId,
        year,
        academicYear: academicYear || undefined,
        userId,
        addedBy: "user",
      },
      {
        onSuccess: (created) => {
          applyStudent([linkId], [name], [created.id]);
          setCalendarUrlStore(
            draft.calendarUrl.includes("http") ? draft.calendarUrl : "",
          );
          onSaved();
        },
      },
    );
  };

  const saveSelectedCourses = () => {
    const courses = draft.selectedCourses;
    if (courses.length === 0) {
      setError("Seleziona almeno un corso.");
      return;
    }
    applyStudent(
      courses.map((course) => course.linkId),
      courses.map((course) => course.name),
      courses.map((course) => course.id),
    );
    onSaved();
  };

  return () => {
    if (draft.role === "professor") return saveProfessor();
    if (draft.newCourse.name.trim() && draft.previewIds.length > 0) {
      return saveNewCourse();
    }
    return saveSelectedCourses();
  };
}
