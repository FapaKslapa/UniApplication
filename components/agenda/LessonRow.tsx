"use client";

import { m } from "framer-motion";
import { MapPin, User, Video } from "lucide-react";
import { OverlapMark } from "@/components/agenda/OverlapMark";
import { Badge } from "@/components/ui/badge";
import type { LessonState } from "@/lib/agenda/lessons";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import { fadeUpVariants } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";
import { cn } from "@/lib/utils";

type LessonRowProps = {
  event: ParsedEvent;
  index: number;
  color: string;
  overlapping: boolean;
  state: LessonState;
  compact?: boolean;
  showProfessor?: boolean;
};

export function LessonRow({
  event,
  index,
  color,
  overlapping,
  state,
  compact = false,
  showProfessor = true,
}: LessonRowProps) {
  return (
    <m.li
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex min-h-14 items-stretch gap-3 rounded-md bg-card",
        compact ? "p-2" : "p-3",
        state === "past" && "bg-muted/50",
      )}
      style={
        state === "current"
          ? {
              boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 40%, transparent)`,
            }
          : undefined
      }
    >
      <span
        className={cn(
          "w-1 shrink-0 self-stretch rounded-full",
          state === "past" && "opacity-35",
        )}
        style={{ backgroundColor: color }}
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="num-display text-xs font-semibold text-muted-foreground">
              {event.time}
            </span>
            {state === "current" && (
              <Badge className="h-5 px-1.5 text-[11px] leading-none">
                In corso
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "truncate font-semibold",
              compact ? "text-sm" : "text-base",
              state === "past" && "text-muted-foreground",
            )}
          >
            {formatSubjectName(event.materia)}
          </p>
          {event.aula && !compact && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {event.isVideo ? (
                <Video className="size-3 shrink-0 text-brand" />
              ) : (
                <MapPin className="size-3 shrink-0" />
              )}
              <span className="truncate">{event.aula}</span>
              {showProfessor && event.docente && (
                <>
                  <span aria-hidden>·</span>
                  <User className="size-3 shrink-0" />
                  <span className="truncate">{event.docente}</span>
                </>
              )}
            </div>
          )}
        </div>
        {overlapping && <OverlapMark className="size-6" />}
      </div>
    </m.li>
  );
}
