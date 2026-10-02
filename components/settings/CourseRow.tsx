import { Check, Link2 } from "lucide-react";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
    <div className="flex min-h-14 items-center gap-3 rounded-md bg-card px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{course.name}</p>
        {course.year && (
          <p className="text-xs text-muted-foreground">{course.year}° anno</p>
        )}
      </div>
      {selected && <PushNotificationManager linkId={course.linkId} compact />}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Copia link"
        onClick={onCopyLink}
        className={cn(
          "size-9 shrink-0 rounded-full text-muted-foreground",
          copied && "text-green-600 dark:text-green-400",
        )}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </Button>
      <Switch
        checked={selected}
        onCheckedChange={onToggle}
        aria-label={`Seleziona ${course.name}`}
      />
    </div>
  );
}
