"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, User, Video } from "lucide-react";
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
    <motion.li
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
              <span className="size-1.5 rounded-full bg-foreground pulse-dot" />
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
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
            <AlertTriangle className="size-3" strokeWidth={2.5} />
            {!compact && "Sovrapposizione"}
          </span>
        )}
      </div>
    </motion.li>
  );
}
