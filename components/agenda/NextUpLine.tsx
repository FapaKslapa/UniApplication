import type { DateTime } from "luxon";
import { lessonStart } from "@/lib/agenda/lessons";
import type { NextUp } from "@/lib/agenda/nextUp";
import { formatSubjectName } from "@/lib/agenda/subjectName";

type NextUpLineProps = {
  nextUp: NextUp;
  now: DateTime;
  colorFor: (materia: string) => string;
};

function dayLabel(date: DateTime, now: DateTime): string {
  if (date.hasSame(now.plus({ days: 1 }), "day")) return "domani";
  return date.setLocale("it").toFormat("cccc");
}

export function NextUpLine({ nextUp, now, colorFor }: NextUpLineProps) {
  const { date, lesson } = nextUp;

  return (
    <div className="flex items-stretch gap-2.5">
      <span
        aria-hidden
        className="w-1 shrink-0 rounded-full"
        style={{ backgroundColor: colorFor(lesson.materia) }}
      />
      <p className="min-w-0 text-sm text-muted-foreground">
        Si riparte {dayLabel(date, now)} alle{" "}
        <span className="num-display font-semibold text-foreground">
          {lessonStart(lesson.time)}
        </span>{" "}
        con{" "}
        <span className="line-clamp-2 font-semibold text-foreground">
          {formatSubjectName(lesson.materia)}
        </span>
      </p>
    </div>
  );
}
