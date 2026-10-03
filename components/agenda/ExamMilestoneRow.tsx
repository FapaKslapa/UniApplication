import { CalendarCheck, CalendarX } from "lucide-react";
import { type ExamMilestone, milestoneLabel } from "@/lib/agenda/exams";

type ExamMilestoneRowProps = {
  milestone: ExamMilestone;
};

export function ExamMilestoneRow({ milestone }: ExamMilestoneRowProps) {
  const Icon = milestone.kind === "reg_open" ? CalendarCheck : CalendarX;
  return (
    <li className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">{milestoneLabel(milestone)}</span>
    </li>
  );
}
