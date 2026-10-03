"use client";

import { m } from "framer-motion";
import { useState } from "react";
import { SkeletonList } from "@/components/LoadingScreen";
import { CourseRow } from "@/components/settings/CourseRow";
import { EmptyNote } from "@/components/settings/EmptyNote";
import { SearchInput } from "@/components/settings/SearchInput";
import { SelectedCourses } from "@/components/settings/SelectedCourses";
import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { fadeUpVariants } from "@/lib/motion";

type CourseListProps = { draft: CourseDraft };

export function CourseList({ draft }: CourseListProps) {
  const [query, setQuery] = useState("");
  const normalized = query.toLowerCase();
  const selectedIds = new Set(draft.selectedCourses.map((c) => c.id));
  const courses = draft.allCourses.filter(
    (course) =>
      !selectedIds.has(course.id) &&
      course.name.toLowerCase().includes(normalized),
  );
  const hasMatch = draft.allCourses.some((course) =>
    course.name.toLowerCase().includes(normalized),
  );
  const isLoading = draft.allCourses.length === 0 && query === "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pb-2">
        <SearchInput
          value={query}
          placeholder="Cerca il tuo corso di laurea…"
          onChange={setQuery}
        />
      </div>
      <SelectedCourses draft={draft} />
      <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-4">
        {draft.hasConfig && courses.length > 0 && (
          <h3 className="px-1 pt-1 text-xs font-semibold text-muted-foreground">
            Tutti i corsi
          </h3>
        )}
        {isLoading && <SkeletonList rows={5} />}
        {!isLoading && query !== "" && !hasMatch && (
          <EmptyNote
            hint="Controlla come hai scritto il nome o prova con meno parole."
            action={{ label: "Cancella ricerca", onClick: () => setQuery("") }}
          >
            Nessun corso trovato per «{query}»
          </EmptyNote>
        )}
        {courses.map((course, index) => (
          <m.div
            key={course.id}
            custom={index}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <CourseRow
              course={course}
              selected={false}
              copied={draft.copiedKey === course.id}
              onToggle={() => draft.toggleCourse(course)}
              onCopyLink={() => draft.copyCourseLink(course)}
            />
          </m.div>
        ))}
      </div>
    </div>
  );
}
