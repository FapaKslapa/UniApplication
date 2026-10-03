"use client";

import { useState } from "react";
import { ExamCalendarTab } from "@/components/exams/ExamCalendarTab";
import { MyExamsTab } from "@/components/exams/MyExamsTab";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/settings/SegmentedControl";

type ExamSegment = "calendar" | "mine";

const OPTIONS: readonly SegmentedOption<ExamSegment>[] = [
  { value: "calendar", label: "Calendario" },
  { value: "mine", label: "I miei esami" },
];

export function ExamsScreen() {
  const [segment, setSegment] = useState<ExamSegment>("calendar");

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 px-1">
      <h1 className="px-3 pt-1 text-lg font-bold leading-none">Esami</h1>
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-3">
        <SegmentedControl
          options={OPTIONS}
          value={segment}
          onChange={setSegment}
          label="Sezione esami"
          className="shrink-0 md:max-w-sm"
        />
        {segment === "calendar" ? (
          <ExamCalendarTab />
        ) : (
          <MyExamsTab onGoToCalendar={() => setSegment("calendar")} />
        )}
      </div>
    </div>
  );
}
