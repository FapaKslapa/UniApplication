import type { DateTime } from "luxon";
import { ExamRegistration } from "@/components/exams/ExamRegistration";
import { formatExamDay, formatExamTime } from "@/components/exams/examFormat";
import { FollowButton } from "@/components/exams/FollowButton";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import type { ExamDTO } from "@/lib/exams/dto";
import { cn } from "@/lib/utils";

type ExamCardProps = {
  exam: ExamDTO;
  now: DateTime;
  emphasized?: boolean;
  children?: React.ReactNode;
};

export function ExamCard({ exam, now, emphasized, children }: ExamCardProps) {
  const place = [
    exam.aula && (/^aula\b/i.test(exam.aula) ? exam.aula : `Aula ${exam.aula}`),
    exam.professor,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn(
        "space-y-2 rounded-md bg-card p-3 elevation-1",
        emphasized && "ring-1 ring-brand/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {emphasized && (
            <p className="text-xs font-semibold text-brand">Prossimo</p>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {formatSubjectName(exam.subject)}
          </h3>
          {exam.courseName && (
            <p className="truncate text-xs text-muted-foreground">
              {exam.courseName}
            </p>
          )}
        </div>
        <FollowButton
          examId={exam.id}
          subject={formatSubjectName(exam.subject)}
          following={exam.following}
        />
      </div>

      <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-semibold capitalize">
          {formatExamDay(exam.startsAt)}
        </span>
        <span aria-hidden className="-mx-1 text-muted-foreground">
          ·
        </span>
        <span className="num-display font-semibold">
          {formatExamTime(exam.startsAt)}
        </span>
        {exam.kind && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Esame · {exam.kind}
          </span>
        )}
      </p>

      {place && <p className="text-xs text-muted-foreground">{place}</p>}
      <ExamRegistration exam={exam} now={now} />
      {children}
    </article>
  );
}
