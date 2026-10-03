import type { DateTime } from "luxon";
import { ExamCard } from "@/components/exams/ExamCard";
import { monthKey, monthLabel } from "@/components/exams/examFormat";
import type { ExamDTO } from "@/lib/exams/dto";

type Group = { key: string; label: string; exams: ExamDTO[] };

function groupByMonth(exams: ExamDTO[]) {
  const groups: Group[] = [];
  for (const exam of exams) {
    const key = monthKey(exam.startsAt);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.exams.push(exam);
    else groups.push({ key, label: monthLabel(exam.startsAt), exams: [exam] });
  }
  return groups;
}

export function ExamMonthList({
  exams,
  now,
}: {
  exams: ExamDTO[];
  now: DateTime;
}) {
  return (
    <>
      {groupByMonth(exams).map((group) => (
        <section key={group.key} className="space-y-1.5">
          <h2 className="px-1 text-xs font-semibold text-muted-foreground">
            {group.label}
          </h2>
          <div className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0">
            {group.exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} now={now} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
