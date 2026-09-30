import { Calendar, Clock, MapPin, User } from "lucide-react";
import { ChangeDetailRow } from "@/components/home/ChangeDetailRow";
import { DiffValue } from "@/components/home/DiffValue";
import type { ChangeType, TimetableChange } from "@/components/home/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CHANGE_STYLES: Record<
  ChangeType,
  { label: string; card: string; badge: string }
> = {
  CANCELED: {
    label: "Annullata",
    card: "bg-destructive/10",
    badge: "bg-destructive/15 text-destructive",
  },
  ADDED: {
    label: "Nuova",
    card: "bg-green-500/10",
    badge: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  MODIFIED: {
    label: "Modificata",
    card: "bg-muted/60",
    badge: "bg-secondary text-secondary-foreground",
  },
};

export function ChangeCard({ change }: { change: TimetableChange }) {
  const styles = CHANGE_STYLES[change.type];
  const isCanceled = change.type === "CANCELED";
  const showProfessor = change.professor && change.professor !== "N/A";

  return (
    <div className={cn("space-y-4 rounded-lg p-5", styles.card)}>
      <div className="flex items-start justify-between gap-4">
        <h4
          className={cn(
            "text-sm font-semibold leading-snug",
            isCanceled && "text-destructive line-through",
          )}
        >
          {change.title}
        </h4>
        <Badge className={styles.badge}>{styles.label}</Badge>
      </div>

      <div className="grid gap-3">
        <ChangeDetailRow icon={Calendar}>{change.date}</ChangeDetailRow>
        <ChangeDetailRow icon={Clock}>
          {change.diffs?.time ? (
            <DiffValue
              previous={change.diffs.time.old}
              current={change.diffs.time.new}
            />
          ) : (
            change.time
          )}
        </ChangeDetailRow>
        <ChangeDetailRow icon={MapPin}>
          {change.diffs?.location ? (
            <DiffValue
              previous={change.diffs.location.old}
              current={change.diffs.location.new}
            />
          ) : (
            change.location
          )}
        </ChangeDetailRow>
        {showProfessor && (
          <ChangeDetailRow icon={User}>{change.professor}</ChangeDetailRow>
        )}
      </div>
    </div>
  );
}
