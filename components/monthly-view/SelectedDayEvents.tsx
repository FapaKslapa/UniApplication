"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, MapPin, Video } from "lucide-react";
import type { DateTime } from "luxon";
import type { MonthEvent } from "@/components/monthly-view/types";
import { parseEventTitle } from "@/lib/orario-utils";

type SelectedDayEventsProps = {
  date: DateTime;
  events: MonthEvent[];
  colorFor: (materia: string) => string;
  onOpen: () => void;
};

export function SelectedDayEvents({
  date,
  events,
  colorFor,
  onOpen,
}: SelectedDayEventsProps) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="pb-4 text-lg font-bold capitalize leading-none">
        {date.toFormat("cccc d MMMM")}
      </h3>
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((e) => {
            const parsed = parseEventTitle(e.title);
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`${e.date}-${e.time}-${parsed.materia}`}
                type="button"
                onClick={onOpen}
                className="flex w-full items-start gap-4 rounded-lg bg-muted/50 p-4 text-left elevation-1 transition-transform active:scale-[0.98]"
              >
                <div
                  className="h-12 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(parsed.materia) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {e.time}
                    </span>
                  </div>
                  <h4 className="mb-1.5 line-clamp-2 text-sm font-semibold">
                    {parsed.materia}
                  </h4>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    {e.isVideo ? (
                      <Video className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                    ) : (
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    )}
                    <span className="whitespace-normal leading-tight">
                      {e.location}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
          <CalendarIcon className="mb-2 size-10" strokeWidth={1} />
          <p className="text-sm">Nessuna lezione per oggi</p>
        </div>
      )}
    </div>
  );
}
