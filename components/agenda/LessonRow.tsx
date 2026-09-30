"use client";

import { m } from "framer-motion";
import { AlertTriangle, MapPin, User, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LessonState } from "@/lib/agenda/lessons";
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
        state === "past" && "opacity-55",
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
        className="w-1 shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {event.time}
            </span>
            {state === "current" && (
              <Badge className="h-4 px-1.5 text-[9px] leading-none">
                In corso
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "truncate font-semibold",
              compact ? "text-sm" : "text-base",
            )}
          >
            {event.materia}
          </p>
          {event.aula && !compact && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {event.isVideo ? (
                <Video className="size-3 shrink-0 text-blue-500" />
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
        {overlapping && (
          <span
            role="img"
            aria-label="Sovrapposizione oraria"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning"
          >
            <AlertTriangle className="size-3.5" strokeWidth={2.5} />
          </span>
        )}
      </div>
    </m.li>
  );
}
