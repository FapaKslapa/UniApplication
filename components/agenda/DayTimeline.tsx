import type { DateTime } from "luxon";
import { Fragment } from "react";
import { ExamMilestoneList } from "@/components/agenda/ExamMilestoneList";
import { ExamRow } from "@/components/agenda/ExamRow";
import { LessonRow } from "@/components/agenda/LessonRow";
import { minutesOfDay } from "@/lib/agenda/dates";
import { type DayExams, EMPTY_DAY_EXAMS } from "@/lib/agenda/exams";
import { formatGap } from "@/lib/agenda/format";
import { lessonState } from "@/lib/agenda/lessons";
import { interleaveTimeline, isExamPast } from "@/lib/agenda/timeline";
import type { ParsedEvent } from "@/lib/orario-utils";

type DayTimelineProps = {
  events: ParsedEvent[];
  overlapping: boolean[];
  gaps?: (number | null)[];
  now: DateTime;
  isToday: boolean;
  colorFor: (materia: string) => string;
  showProfessor?: boolean;
  dayExams?: DayExams;
};

export function DayTimeline({
  events,
  overlapping,
  gaps = [],
  now,
  isToday,
  colorFor,
  showProfessor = true,
  dayExams = EMPTY_DAY_EXAMS,
}: DayTimelineProps) {
  const nowMinutes = minutesOfDay(now);
  const items = interleaveTimeline(events, dayExams.exams);

  return (
    <ul
      className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-1 py-1"
      style={{ touchAction: "pan-y" }}
    >
      <ExamMilestoneList milestones={dayExams.milestones} />
      {items.map((item, position) => {
        if (item.type === "exam") {
          return (
            <ExamRow
              key={item.exam.id}
              exam={item.exam}
              index={position}
              past={isToday && isExamPast(item.exam, now.toMillis())}
            />
          );
        }
        const { event, index } = item;
        return (
          <Fragment key={`${event.time}-${event.materia}`}>
            {gaps[index] != null && (
              <li className="num-display px-4 pt-1 text-[11px] font-medium text-muted-foreground">
                {formatGap(gaps[index])}
              </li>
            )}
            <LessonRow
              event={event}
              index={index}
              color={colorFor(event.materia)}
              overlapping={overlapping[index]}
              state={isToday ? lessonState(event.time, nowMinutes) : "upcoming"}
              showProfessor={showProfessor}
            />
          </Fragment>
        );
      })}
    </ul>
  );
}
