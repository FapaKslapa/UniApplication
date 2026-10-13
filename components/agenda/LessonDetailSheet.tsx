"use client";

import { CalendarPlus, Check, Copy, MapPin, User, Video } from "lucide-react";
import type { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { buildIcs, downloadIcs, lessonFilename } from "@/lib/agenda/ics";
import { lessonEnd, lessonStart } from "@/lib/agenda/lessons";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import type { LessonDetail } from "@/lib/agenda/useLessonDetail";

type LessonDetailSheetProps = {
  detail: LessonDetail | null;
  date: DateTime;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LessonDetailSheet({
  detail,
  date,
  open,
  onOpenChange,
}: LessonDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const event = detail?.event;
  const end = event ? lessonEnd(event.time) : null;
  const range = event
    ? end
      ? `${lessonStart(event.time)} – ${end}`
      : lessonStart(event.time)
    : "";

  const copyAula = async () => {
    if (!event?.aula) return;
    try {
      await navigator.clipboard.writeText(event.aula);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const addToCalendar = () => {
    if (!event) return;
    const ics = buildIcs([{ ...event, date }]);
    if (ics) downloadIcs(ics, lessonFilename(event.materia, date));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {event && detail && (
          <>
            <DrawerHeader className="gap-1 text-left">
              <span
                className="mb-1 h-1 w-10 rounded-full"
                style={{ backgroundColor: detail.color }}
              />
              <DrawerTitle className="text-xl leading-tight">
                {formatSubjectName(event.materia)}
              </DrawerTitle>
              <DrawerDescription className="num-display capitalize">
                {date.setLocale("it").toFormat("cccc d LLLL")} · {range}
              </DrawerDescription>
            </DrawerHeader>

            <dl className="space-y-3 px-4 pb-2 text-sm">
              {event.aula && (
                <div className="flex items-center gap-2">
                  {event.isVideo ? (
                    <Video className="size-4 shrink-0 text-brand" aria-hidden />
                  ) : (
                    <MapPin
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                  <dt className="sr-only">Aula</dt>
                  <dd className="min-w-0 flex-1 truncate">{event.aula}</dd>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAula}
                    aria-label="Copia aula"
                  >
                    {copied ? <Check /> : <Copy />}
                    {copied ? "Copiata" : "Copia"}
                  </Button>
                </div>
              )}
              {event.docente && (
                <div className="flex items-center gap-2">
                  <User
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <dt className="sr-only">Docente</dt>
                  <dd className="min-w-0 flex-1">{event.docente}</dd>
                </div>
              )}
            </dl>

            <DrawerFooter>
              <Button onClick={addToCalendar}>
                <CalendarPlus />
                Aggiungi al calendario
              </Button>
            </DrawerFooter>
            <span className="sr-only" role="status">
              {copied ? "Aula copiata" : ""}
            </span>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
