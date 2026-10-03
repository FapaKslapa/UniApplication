"use client";

import { m } from "framer-motion";
import type { DateTime } from "luxon";
import { ExamMilestoneList } from "@/components/agenda/ExamMilestoneList";
import { ExamRow } from "@/components/agenda/ExamRow";
import { LessonRow } from "@/components/agenda/LessonRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { minutesOfDay } from "@/lib/agenda/dates";
import { type DayExams, EMPTY_DAY_EXAMS } from "@/lib/agenda/exams";
import { lessonState, overlapFlags } from "@/lib/agenda/lessons";
import { interleaveTimeline, isExamPast } from "@/lib/agenda/timeline";
import { fadeUpVariants } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";
import { cn } from "@/lib/utils";

type WeekDaySectionProps = {
  date: DateTime;
  events: ParsedEvent[];
  now: DateTime;
  isToday: boolean;
  colorFor: (materia: string) => string;
  onSelectDay: (date: DateTime) => void;
  dayExams?: DayExams;
};

export function WeekDaySection({
  date,
  events,
  now,
  isToday,
  colorFor,
  onSelectDay,
  dayExams = EMPTY_DAY_EXAMS,
}: WeekDaySectionProps) {
  const items = interleaveTimeline(events, dayExams.exams);
  const flags = overlapFlags(events);
  const nowMinutes = minutesOfDay(now);

  return (
    <m.section
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-1.5"
    >
      <Button
        variant="ghost"
        onClick={() => onSelectDay(date)}
        className={cn(
          "sticky top-0 z-10 h-auto min-h-11 w-full justify-start gap-2 rounded-md bg-card px-2 py-2 elevation-1 hover:bg-accent",
          isToday && "text-foreground",
        )}
      >
        <span className="text-sm font-bold capitalize">
          {date.setLocale("it").toFormat("cccc d")}
        </span>
        <Badge variant={isToday ? "default" : "secondary"}>
          {events.length + dayExams.exams.length}
        </Badge>
      </Button>

      <ul className="space-y-1.5">
        <ExamMilestoneList milestones={dayExams.milestones} />
        {items.length === 0 ? (
          <li className="rounded-md bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground">
            Libero
          </li>
        ) : (
          items.map((item, position) =>
            item.type === "exam" ? (
              <ExamRow
                key={item.exam.id}
                exam={item.exam}
                index={position}
                past={isToday && isExamPast(item.exam, now.toMillis())}
                compact
              />
            ) : (
              <LessonRow
                key={`${item.event.time}-${item.event.materia}`}
                event={item.event}
                index={item.index}
                color={colorFor(item.event.materia)}
                overlapping={flags[item.index]}
                state={
                  isToday
                    ? lessonState(item.event.time, nowMinutes)
                    : "upcoming"
                }
                compact
                showProfessor={false}
              />
            ),
          )
        )}
      </ul>
    </m.section>
  );
}
