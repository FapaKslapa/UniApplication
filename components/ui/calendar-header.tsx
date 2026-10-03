"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";

export type CalendarView = "days" | "months" | "years";

const NAV_BUTTON =
  "absolute inset-y-0 my-auto size-8 p-0 bg-transparent z-10 rounded-full before:absolute before:-inset-1.5 before:content-['']";

type CalendarHeaderProps = {
  view: CalendarView;
  date: Date;
  onView: (view: CalendarView) => void;
  onShift: (delta: number) => void;
};

export function CalendarHeader({
  view,
  date,
  onView,
  onShift,
}: CalendarHeaderProps) {
  return (
    <div className="relative mb-3 flex min-h-11 items-center justify-center">
      {view === "days" && (
        <>
          <Button
            variant="outline"
            aria-label="Mese precedente"
            className={`${NAV_BUTTON} left-0`}
            onClick={() => onShift(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            aria-label="Mese successivo"
            className={`${NAV_BUTTON} right-0`}
            onClick={() => onShift(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {view === "years" && (
        <Button
          variant="outline"
          aria-label="Torna ai giorni"
          className={`${NAV_BUTTON} left-0`}
          onClick={() => onView("days")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {view === "months" && (
        <Button
          variant="ghost"
          aria-label="Scegli anno"
          className="absolute left-0 top-0 z-10 h-11 w-auto p-2 text-sm font-normal"
          onClick={() => onView("years")}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {date.getFullYear()}
        </Button>
      )}

      <div className="text-sm font-medium">
        {view === "days" && (
          <Button
            variant="ghost"
            aria-label="Scegli anno e mese"
            className="h-11 px-3 py-1 font-medium capitalize"
            onClick={() => onView("years")}
          >
            {DateTime.fromJSDate(date).setLocale("it").toFormat("LLLL yyyy")}
          </Button>
        )}
        {view === "years" && "Seleziona Anno"}
        {view === "months" && "Seleziona Mese"}
      </div>
    </div>
  );
}
