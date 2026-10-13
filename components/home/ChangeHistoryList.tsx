import { ChangeCard } from "@/components/home/ChangeCard";
import type { HistoryGroup } from "@/components/home/changeHistoryGroups";
import { isUpdateSeen } from "@/components/home/changesSeen";
import { Badge } from "@/components/ui/badge";

export function ChangeHistoryList({ groups }: { groups: HistoryGroup[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          {group.entries.map((entry) => (
            <div key={entry.linkId} className="space-y-3">
              {!isUpdateSeen(entry.linkId, entry.updatedAt) && (
                <Badge variant="secondary">Da vedere</Badge>
              )}
              {entry.changes.map((change) => (
                <ChangeCard
                  key={`${entry.linkId}-${change.type}-${change.date}-${change.time}-${change.title}`}
                  change={change}
                />
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
