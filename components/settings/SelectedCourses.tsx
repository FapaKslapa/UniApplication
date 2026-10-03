import { CourseRow } from "@/components/settings/CourseRow";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

type SelectedCoursesProps = { draft: CourseDraft };

export function SelectedCourses({ draft }: SelectedCoursesProps) {
  if (draft.selectedCourses.length === 0) return null;

  return (
    <section
      aria-label="Corsi selezionati"
      className="max-h-[40%] shrink-0 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-3"
    >
      <h3 className="px-1 pt-1 text-xs font-semibold text-muted-foreground">
        Corsi selezionati ({draft.selectedCourses.length})
      </h3>
      {draft.selectedCourses.map((course) => (
        <CourseRow
          key={course.id}
          course={course}
          selected
          copied={draft.copiedKey === course.id}
          onToggle={() => draft.toggleCourse(course)}
          onCopyLink={() => draft.copyCourseLink(course)}
        />
      ))}
    </section>
  );
}
