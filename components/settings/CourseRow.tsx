import { Check, Link2 } from "lucide-react";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { SelectRow } from "@/components/settings/SelectRow";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

type CourseRowProps = {
  course: Course;
  selected: boolean;
  copied: boolean;
  onToggle: () => void;
  onCopyLink: () => void;
};

export function CourseRow({
  course,
  selected,
  copied,
  onToggle,
  onCopyLink,
}: CourseRowProps) {
  return (
    <SelectRow
      selected={selected}
      shape="checkbox"
      onSelect={onToggle}
      title={course.name}
      subtitle={course.year ? `${course.year}° anno` : undefined}
      trailingReserve={selected ? "pr-28" : "pr-14"}
      trailing={
        <>
          {selected && (
            <PushNotificationManager linkId={course.linkId} compact />
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Copia link"
            onClick={onCopyLink}
            className={cn(
              "size-11 rounded-full",
              selected
                ? "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                : "text-muted-foreground",
              copied && !selected && "text-green-600 dark:text-green-400",
            )}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Link2 className="size-4" />
            )}
          </Button>
        </>
      }
    />
  );
}
