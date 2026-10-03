import type { DateTime } from "luxon";
import {
  getRegState,
  REG_STATE_LABEL,
  regRangeText,
} from "@/components/exams/examFormat";
import type { ExamDTO } from "@/lib/exams/dto";
import { cn } from "@/lib/utils";

const ESTIMATE_HINT = "Date stimate: non ancora confermate dall'ateneo";

export function ExamRegistration({
  exam,
  now,
}: {
  exam: ExamDTO;
  now: DateTime;
}) {
  const state = getRegState(exam, now);
  if (!state) return null;
  const estimated = !exam.regConfirmed;

  return (
    <p
      className="text-xs text-muted-foreground"
      title={estimated ? ESTIMATE_HINT : undefined}
    >
      {regRangeText(exam)}
      {estimated && (
        <>
          {" "}
          <span>(previste)</span>
          <span className="sr-only">. {ESTIMATE_HINT}</span>
        </>
      )}
      <span aria-hidden> · </span>
      <span className="sr-only">. </span>
      <span
        className={cn(
          "font-semibold",
          state === "open" ? "text-success" : "text-foreground",
        )}
      >
        {REG_STATE_LABEL[state]}
      </span>
    </p>
  );
}
