"use client";

import { useState } from "react";
import { SkeletonList } from "@/components/LoadingScreen";
import { CourseRow } from "@/components/settings/CourseRow";
import { EmptyNote } from "@/components/settings/EmptyNote";
import { SearchInput } from "@/components/settings/SearchInput";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

type CourseListProps = { draft: CourseDraft };

export function CourseList({ draft }: CourseListProps) {
  const [query, setQuery] = useState("");
  const normalized = query.toLowerCase();
  const courses = draft.allCourses.filter((course) =>
    course.name.toLowerCase().includes(normalized),
  );
  const isLoading = draft.allCourses.length === 0 && query === "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pb-2">
        <SearchInput
          value={query}
          placeholder="Cerca corso..."
          onChange={setQuery}
        />
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-4">
        {isLoading && <SkeletonList rows={5} />}
        {!isLoading && courses.length === 0 && (
          <EmptyNote>Nessun corso trovato.</EmptyNote>
        )}
        {courses.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            selected={draft.selectedCourses.some((c) => c.id === course.id)}
            copied={draft.copiedKey === course.id}
            onToggle={() => draft.toggleCourse(course)}
            onCopyLink={() => draft.copyCourseLink(course)}
          />
        ))}
      </div>
    </div>
  );
}
