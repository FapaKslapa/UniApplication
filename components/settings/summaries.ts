import type { UserRole } from "@/components/settings/types";
import type { CourseDraft } from "@/components/settings/useCourseDraft";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";

export function getConfigSummary(
  savedUserRole: UserRole,
  savedProfessorName: string,
  selectedCourses: CourseDraft["selectedCourses"],
): string {
  if (savedUserRole === "professor") {
    return savedProfessorName || "Non configurato";
  }
  if (selectedCourses.length === 0) return "Non configurato";
  if (selectedCourses.length === 1) return selectedCourses[0].name;
  return `${selectedCourses.length} corsi selezionati`;
}

export function getSubjectsSummary(
  visibility: SubjectVisibility,
  hasConfig: boolean,
): string {
  if (!visibility.subjects || visibility.subjects.length === 0) {
    return hasConfig ? "Caricamento..." : "Configura prima un corso";
  }
  return `${visibility.visibleCount} / ${visibility.subjects.length} visibili`;
}
