import { ExamMilestoneRow } from "@/components/agenda/ExamMilestoneRow";
import type { ExamMilestone } from "@/lib/agenda/exams";

export function ExamMilestoneList({
  milestones,
}: {
  milestones: ExamMilestone[];
}) {
  return milestones.map((milestone) => (
    <ExamMilestoneRow key={milestone.key} milestone={milestone} />
  ));
}
