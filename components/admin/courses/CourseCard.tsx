import { m } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

const statusConfigMap = {
  pending: {
    className: "bg-warning/25 text-foreground",
    label: "Attesa",
  },
  approved: {
    className: "bg-success/15 text-success",
    label: "Attivo",
  },
  rejected: {
    className: "bg-destructive/15 text-destructive",
    label: "Rifiutato",
  },
} as const;

const actionButtonColors: Record<string, string> = {
  emerald: "text-success",
  blue: "text-brand",
  amber: "text-foreground",
  red: "text-destructive",
};

function ActionButton({
  onClick,
  icon,
  color,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-9 rounded-full elevation-1",
        actionButtonColors[color],
      )}
    >
      {icon}
    </Button>
  );
}

interface CourseCardProps {
  course: Course;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  onVerify?: () => void;
  copiedCourseId: string | null;
  onCopyLink: (linkId: string, courseId: string) => void;
}

export function CourseCard({
  course,
  onApprove,
  onReject,
  onDelete,
  onVerify,
  copiedCourseId,
  onCopyLink,
}: CourseCardProps) {
  const statusConfig =
    statusConfigMap[course.status as "pending" | "approved" | "rejected"];
  const isCopied = copiedCourseId === course.id;

  return (
    <m.div
      layout
      className="group space-y-4 rounded-xl bg-card p-5 elevation-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="mb-2 truncate text-base font-bold leading-tight">
            {course.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            {course.verified && (
              <Badge className="bg-brand-soft text-brand">
                <ShieldCheck className="h-3 w-3" /> Verificato
              </Badge>
            )}
            <Badge variant="secondary">{course.year}° Anno</Badge>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onCopyLink(course.linkId, course.id)}
          aria-label={isCopied ? "Link copiato" : "Copia link"}
          className={cn(
            "size-9 shrink-0 rounded-full elevation-1 relative before:absolute before:-inset-1 before:content-['']",
            isCopied &&
              "border-transparent bg-success text-success-foreground hover:bg-success hover:text-success-foreground",
          )}
        >
          {isCopied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="rounded-md bg-muted p-3">
        <code className="block truncate text-[11px] text-muted-foreground">
          {course.linkId}
        </code>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5 text-xs text-muted-foreground">
          <p className="truncate">By {course.addedBy}</p>
          <p className="truncate">
            {new Date(course.createdAt).toLocaleDateString("it", {
              timeZone: "Europe/Rome",
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onApprove && course.status !== "approved" && (
            <ActionButton
              onClick={onApprove}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              color="emerald"
              label="Approva corso"
            />
          )}
          {onVerify && !course.verified && (
            <ActionButton
              onClick={onVerify}
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              color="blue"
              label="Verifica corso"
            />
          )}
          {onReject && course.status === "pending" && (
            <ActionButton
              onClick={onReject}
              icon={<XCircle className="w-3.5 h-3.5" />}
              color="amber"
              label="Rifiuta corso"
            />
          )}
          <ActionButton
            onClick={onDelete}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            color="red"
            label="Elimina corso"
          />
        </div>
      </div>
    </m.div>
  );
}
