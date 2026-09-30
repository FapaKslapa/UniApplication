import { CourseList } from "@/components/settings/CourseList";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

type CoursesScreenProps = { draft: CourseDraft };

export function CoursesScreen({ draft }: CoursesScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseList draft={draft} />
    </div>
  );
}
