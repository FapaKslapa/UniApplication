import { m } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

const statusConfigMap = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    label: "Attesa",
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Attivo",
  },
  rejected: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    label: "Rifiutato",
  },
} as const;

const actionButtonColors: Record<string, string> = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-100 dark:border-emerald-800",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-500 hover:text-white border-blue-100 dark:border-blue-800",
  amber:
    "bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-100 dark:border-amber-800",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-500 hover:text-white border-red-100 dark:border-red-800",
};

function ActionButton({
  onClick,
  icon,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-xl border transition-[color,background-color,transform] active:scale-90 shadow-sm",
        actionButtonColors[color],
      )}
    >
      {icon}
    </button>
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

  return (
    <m.div
      layout
      className="group bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white mb-2 leading-tight truncate">
            {course.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold font-mono uppercase border",
                statusConfig.bg,
                statusConfig.border,
                statusConfig.text,
              )}
            >
              {statusConfig.label}
            </span>
            {course.verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 text-[9px] font-bold font-mono uppercase">
                <ShieldCheck className="h-3 w-3" /> Verificato
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-500 text-[9px] font-bold font-mono uppercase">
              {course.year}° Anno
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopyLink(course.linkId, course.id)}
          aria-label={
            copiedCourseId === course.id ? "Link copiato" : "Copia link"
          }
          className={cn(
            "p-2.5 rounded-xl transition-[color,background-color,border-color,transform] shadow-sm active:scale-90 border",
            copiedCourseId === course.id
              ? "bg-emerald-500 text-white border-transparent"
              : "bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700",
          )}
        >
          {copiedCourseId === course.id ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <code className="text-[10px] font-mono text-zinc-400 block truncate">
            {course.linkId}
          </code>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
            <span>By {course.addedBy}</span>
            <div className="w-1 h-1 rounded-full bg-zinc-300" />
            <span>
              {new Date(course.createdAt).toLocaleDateString("it", {
                timeZone: "Europe/Rome",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onApprove && course.status !== "approved" && (
              <ActionButton
                onClick={onApprove}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                color="emerald"
              />
            )}
            {onVerify && !course.verified && (
              <ActionButton
                onClick={onVerify}
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                color="blue"
              />
            )}
            {onReject && course.status === "pending" && (
              <ActionButton
                onClick={onReject}
                icon={<XCircle className="w-3.5 h-3.5" />}
                color="amber"
              />
            )}
            <ActionButton
              onClick={onDelete}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              color="red"
            />
          </div>
        </div>
      </div>
    </m.div>
  );
}
