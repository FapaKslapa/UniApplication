"use client";

import { m } from "framer-motion";
import { Bookmark, MapPin, User } from "lucide-react";
import { examKindLabel, examTimeRange } from "@/lib/agenda/exams";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import type { ExamDTO } from "@/lib/exams/dto";
import { fadeUpVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ExamRowProps = {
  exam: ExamDTO;
  index: number;
  past: boolean;
  compact?: boolean;
};

export function ExamRow({ exam, index, past, compact = false }: ExamRowProps) {
  return (
    <m.li
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 rounded-md border border-foreground/20 bg-card",
        compact ? "p-2" : "p-3",
        past && "bg-muted/50",
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="num-display text-xs font-semibold text-muted-foreground">
            {examTimeRange(exam)}
          </span>
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground">
            {examKindLabel(exam.kind)}
          </span>
        </div>
        <p
          className={cn(
            "truncate font-semibold",
            compact ? "text-sm" : "text-base",
            past && "text-muted-foreground",
          )}
        >
          {formatSubjectName(exam.subject)}
        </p>
        {!compact && (exam.aula || exam.professor) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {exam.aula && (
              <>
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{exam.aula}</span>
              </>
            )}
            {exam.aula && exam.professor && <span aria-hidden>·</span>}
            {exam.professor && (
              <>
                <User className="size-3 shrink-0" />
                <span className="truncate">{exam.professor}</span>
              </>
            )}
          </div>
        )}
      </div>
      {exam.following && (
        <Bookmark
          aria-label="Esame seguito"
          role="img"
          className="size-4 shrink-0 fill-current text-foreground"
        />
      )}
    </m.li>
  );
}
