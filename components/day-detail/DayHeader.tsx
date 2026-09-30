import { X } from "lucide-react";
import type { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDayName } from "@/lib/orario-utils";

type DayHeaderProps = {
  day: number;
  date?: DateTime;
  lessonCount: number;
  onClose?: () => void;
};

export function DayHeader({ day, date, lessonCount, onClose }: DayHeaderProps) {
  const dateLabel = date?.setLocale("it").toFormat("d MMMM");

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-6 pb-4 pt-2">
      <div className="min-w-0">
        <h2 className="truncate text-3xl font-bold leading-none">
          {getDayName(day)}
        </h2>
        <div className="mt-3 flex items-center gap-2">
          {dateLabel && (
            <span className="text-sm capitalize text-muted-foreground">
              {dateLabel}
            </span>
          )}
          <Badge variant="secondary">
            {lessonCount} {lessonCount === 1 ? "lezione" : "lezioni"}
          </Badge>
        </div>
      </div>
      {onClose && (
        <Button
          variant="secondary"
          size="icon"
          aria-label="Chiudi"
          onClick={onClose}
          className="rounded-full"
        >
          <X className="size-5" />
        </Button>
      )}
    </header>
  );
}
