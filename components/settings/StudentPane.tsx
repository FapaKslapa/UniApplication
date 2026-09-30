"use client";

import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { AddCourseForm } from "@/components/settings/AddCourseForm";
import { CourseList } from "@/components/settings/CourseList";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/settings/SegmentedControl";
import type { CoursesTab } from "@/components/settings/types";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

const TAB_OPTIONS: SegmentedOption<CoursesTab>[] = [
  { value: "select", label: "Seleziona corso", icon: BookOpen },
  { value: "add", label: "Aggiungi nuovo", icon: Plus },
];

type StudentPaneProps = { draft: CourseDraft };

export function StudentPane({ draft }: StudentPaneProps) {
  const [tab, setTab] = useState<CoursesTab>("select");

  return (
    <>
      <div className="shrink-0 px-4 pb-3">
        <SegmentedControl options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </div>
      {tab === "select" ? (
        <CourseList draft={draft} />
      ) : (
        <AddCourseForm draft={draft} />
      )}
    </>
  );
}
