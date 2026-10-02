import { Switch } from "@/components/ui/switch";
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
          "flex-1 truncate text-sm font-medium capitalize",
          hidden && "text-muted-foreground",
        )}
      >
        {subject.toLowerCase()}
      </span>
      <Switch
        checked={!hidden}
        onCheckedChange={onToggle}
        aria-label={`Mostra ${subject}`}
      />
    </div>
  );
}
