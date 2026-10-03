import {
  ArrowRightLeft,
  Calendar,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { ChangeDetailRow } from "@/components/home/ChangeDetailRow";
import {
  formatChangeDate,
  getChangeHeadline,
} from "@/components/home/changeCopy";
import { DiffValue } from "@/components/home/DiffValue";
import type { ChangeType, TimetableChange } from "@/components/home/types";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import { cn } from "@/lib/utils";

const CHANGE_STYLES: Record<
  ChangeType,
  { icon: typeof CircleX; card: string; headline: string }
> = {
  CANCELED: {
    icon: CircleX,
    card: "bg-destructive/10",
    headline: "text-destructive",
  },
  ADDED: {
    icon: CircleCheck,
    card: "bg-success/10",
    headline: "text-success",
  },
  MODIFIED: {
    icon: ArrowRightLeft,
    card: "bg-muted/60",
    headline: "text-foreground",
  },
};

type DiffRowProps = {
  icon: typeof Clock;
  diff?: { old: string; new: string };
  value: string;
};

function DiffRow({ icon, diff, value }: DiffRowProps) {
  return (
    <ChangeDetailRow icon={icon}>
      {diff ? <DiffValue previous={diff.old} current={diff.new} /> : value}
    </ChangeDetailRow>
  );
}

export function ChangeCard({ change }: { change: TimetableChange }) {
  const styles = CHANGE_STYLES[change.type];
  const HeadlineIcon = styles.icon;
  const isCanceled = change.type === "CANCELED";
  const showProfessor = change.professor && change.professor !== "N/A";

  return (
    <div className={cn("space-y-4 rounded-lg p-5", styles.card)}>
      <div className="space-y-1">
        <p
          className={cn(
            "flex items-center gap-2 text-sm font-bold",
            styles.headline,
          )}
        >
          <HeadlineIcon className="size-4 shrink-0" aria-hidden />
          {getChangeHeadline(change)}
        </p>
        <h4
          className={cn(
            "text-base font-semibold leading-snug",
            isCanceled && "text-muted-foreground line-through",
          )}
        >
          {formatSubjectName(change.title)}
        </h4>
      </div>

      <div className="grid gap-3">
        <ChangeDetailRow icon={Calendar}>
          <span className="capitalize">{formatChangeDate(change.date)}</span>
        </ChangeDetailRow>
        <DiffRow icon={Clock} diff={change.diffs?.time} value={change.time} />
        <DiffRow
          icon={MapPin}
          diff={change.diffs?.location}
          value={change.location}
        />
        {showProfessor && (
          <DiffRow
            icon={User}
            diff={change.diffs?.professor}
            value={change.professor}
          />
        )}
      </div>
    </div>
  );
}
