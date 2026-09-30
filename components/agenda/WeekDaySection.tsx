"use client";

import { m } from "framer-motion";
import type { DateTime } from "luxon";
import { LessonRow } from "@/components/agenda/LessonRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { minutesOfDay } from "@/lib/agenda/dates";
import { lessonState, overlapFlags } from "@/lib/agenda/lessons";
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
};

export function WeekDaySection({
  date,
  events,
  now,
  isToday,
  colorFor,
  onSelectDay,
}: WeekDaySectionProps) {
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
          "sticky top-0 z-10 h-auto min-h-11 w-full justify-start gap-2 rounded-md bg-background/80 px-2 py-2 glass",
          isToday && "text-foreground",
        )}
      >
        <span className="text-sm font-bold capitalize">
          {date.setLocale("it").toFormat("cccc d")}
        </span>
        <Badge variant={isToday ? "default" : "secondary"}>
          {events.length}
        </Badge>
      </Button>

      <ul className="space-y-1.5">
        {events.length === 0 ? (
          <li className="rounded-md bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground">
            Libero
          </li>
        ) : (
          events.map((event, index) => (
            <LessonRow
              key={`${event.time}-${event.materia}`}
              event={event}
              index={index}
              color={colorFor(event.materia)}
              overlapping={flags[index]}
              state={isToday ? lessonState(event.time, nowMinutes) : "upcoming"}
              compact
              showProfessor={false}
            />
          ))
        )}
      </ul>
    </m.section>
  );
}
