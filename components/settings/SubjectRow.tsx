import { Switch } from "@/components/ui/switch";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import { cn } from "@/lib/utils";

type SubjectRowProps = {
  subject: string;
  hidden: boolean;
  onToggle: () => void;
};

export function SubjectRow({ subject, hidden, onToggle }: SubjectRowProps) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-md bg-card px-3">
      <span
        className={cn(
          "flex-1 truncate text-sm font-medium",
          hidden && "text-muted-foreground",
        )}
      >
        {formatSubjectName(subject)}
      </span>
      <Switch
        checked={!hidden}
        onCheckedChange={onToggle}
        aria-label={`Mostra ${formatSubjectName(subject)} nell'orario`}
      />
    </div>
  );
}
