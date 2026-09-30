import { SelectIndicator } from "@/components/settings/SelectIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubjectRowProps = {
  subject: string;
  hidden: boolean;
  onToggle: () => void;
};

export function SubjectRow({ subject, hidden, onToggle }: SubjectRowProps) {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      className={cn(
        "h-auto w-full justify-start gap-3 rounded-md px-4 py-3.5 text-left",
        hidden && "text-muted-foreground",
      )}
    >
      <SelectIndicator selected={!hidden} shape="checkbox" />
      <span
        className={cn(
          "flex-1 truncate text-sm font-semibold capitalize",
          hidden && "line-through opacity-60",
        )}
      >
        {subject.toLowerCase()}
      </span>
      {hidden && <Badge variant="secondary">Nascosta</Badge>}
    </Button>
  );
}
