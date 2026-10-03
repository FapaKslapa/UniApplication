import { m } from "framer-motion";
import type { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { dayDotSubjects } from "@/lib/agenda/lessons";
import { springs, staggerDelay } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";
import { cn } from "@/lib/utils";

type MonthDayCellProps = {
  date: DateTime;
  events: ParsedEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  colorFor: (materia: string) => string;
  onSelect: (date: DateTime) => void;
};

export function MonthDayCell({
  date,
  events,
  isCurrentMonth,
  isToday,
  isSelected,
  colorFor,
  onSelect,
}: MonthDayCellProps) {
  const dotSubjects = dayDotSubjects(events);

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(date)}
      aria-current={isToday ? "date" : undefined}
      aria-label={`${date.setLocale("it").toFormat("cccc d MMMM")}, ${events.length} lezioni`}
      className={cn(
        "relative h-full w-full flex-col items-center justify-center gap-1 rounded-md px-0 py-1 focus-visible:ring-inset focus-visible:ring-offset-0",
        !isCurrentMonth && "pointer-events-none opacity-0",
        isToday && !isSelected && "ring-1 ring-inset ring-foreground/30",
        isSelected && "bg-foreground",
      )}
    >
      <span
        className={cn(
          "num-display text-sm font-bold",
          isSelected && "text-background",
        )}
      >
        {date.day}
      </span>
      <span className="flex h-1.5 items-center gap-0.5">
        {dotSubjects.map((materia, dotIndex) => (
          <m.span
            key={materia}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springs.gentle, delay: staggerDelay(dotIndex) }}
            className="size-1 rounded-full"
            style={{ backgroundColor: colorFor(materia) }}
          />
        ))}
      </span>
    </Button>
  );
}
