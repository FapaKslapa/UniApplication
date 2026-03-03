"use client";

import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  Plus,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { AcademicYearPicker } from "@/components/ui/academic-year-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Course } from "@/lib/courses";
import { extractCalendarId } from "@/lib/orario-utils";
import { cn } from "@/lib/utils";

type FilterType = "all" | "pending" | "approved" | "rejected";

export function AdminCoursesView() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "delete" | "verify" | null;
    course: Course | null;
  }>({
    open: false,
    action: null,
    course: null,
  });
  const [addCourseDialog, setAddCourseDialog] = useState(false);
  const [newCourse, setNewCourse] = useState<{
    name: string;
    calendarUrl: string;
    year: number | "";
    academicYear: string;
  }>({
    name: "",
    calendarUrl: "",
    year: "",
    academicYear: "",
  });

  const utils = api.useUtils();

  const { data: courses, isLoading } = api.courses.getAllForAdmin.useQuery();

  const approveMutation = api.courses.approve.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setConfirmDialog({ open: false, action: null, course: null });
    },
  });
  const rejectMutation = api.courses.reject.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setConfirmDialog({ open: false, action: null, course: null });
    },
  });
  const deleteMutation = api.courses.delete.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setConfirmDialog({ open: false, action: null, course: null });
    },
  });
  const verifyMutation = api.courses.verify.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setConfirmDialog({ open: false, action: null, course: null });
    },
  });

  const addCourseMutation = api.courses.add.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setAddCourseDialog(false);
      setNewCourse({ name: "", calendarUrl: "", year: "", academicYear: "" });
    },
    onError: (e) => alert(e.message),
  });

  const handleCopyCourseLink = async (linkId: string, courseId: string) => {
    try {
      await navigator.clipboard.writeText(linkId);
      setCopiedCourseId(courseId);
      setTimeout(() => setCopiedCourseId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = (
    action: "approve" | "reject" | "delete" | "verify",
    course: Course,
  ) => setConfirmDialog({ open: true, action, course });

  const executeAction = () => {
    if (!confirmDialog.course) return;
    const cid = confirmDialog.course.id;
    if (confirmDialog.action === "approve")
      approveMutation.mutate({ courseId: cid });
    if (confirmDialog.action === "reject")
      rejectMutation.mutate({ courseId: cid });
    if (confirmDialog.action === "delete")
      deleteMutation.mutate({ courseId: cid });
    if (confirmDialog.action === "verify")
      verifyMutation.mutate({ courseId: cid });
  };

  const handleAddCourse = () => {
    if (
      !newCourse.name.trim() ||
      !newCourse.calendarUrl.trim() ||
      newCourse.year === ""
    )
      return alert("Campi obbligatori mancanti");
    const linkId = extractCalendarId(newCourse.calendarUrl);
    if (!linkId) return alert("Link non valido");
    addCourseMutation.mutate({
      name: newCourse.name,
      linkId,
      year: newCourse.year as number,
      academicYear: newCourse.academicYear || undefined,
      addedBy: "admin",
    });
  };

  const pendingCourses = courses?.filter((c) => c.status === "pending") || [];
  const approvedCourses = courses?.filter((c) => c.status === "approved") || [];
  const rejectedCourses = courses?.filter((c) => c.status === "rejected") || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 no-scrollbar text-nowrap">
          {(
            [
              {
                id: "all",
                label: "Tutti",
                count: courses?.length || 0,
              },
              {
                id: "pending",
                label: "Attesa",
                count: pendingCourses.length,
              },
              {
                id: "approved",
                label: "Approvati",
                count: approvedCourses.length,
              },
              {
                id: "rejected",
                label: "Rifiutati",
                count: rejectedCourses.length,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-bold uppercase tracking-widest font-mono",
                filter === f.id
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-md scale-105"
                  : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300",
              )}
            >
              {f.label}
              <span className="opacity-50">{f.count}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAddCourseDialog(true)}
          className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl transition-all active:scale-90 shadow-md flex-shrink-0 ml-4"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-30">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {courses
              ?.filter((c) => filter === "all" || c.status === filter)
              .map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onApprove={() => handleAction("approve", course)}
                  onReject={() => handleAction("reject", course)}
                  onDelete={() => handleAction("delete", course)}
                  onVerify={() => handleAction("verify", course)}
                  copiedCourseId={copiedCourseId}
                  onCopyLink={handleCopyCourseLink}
                />
              ))}
          </div>
        )}
      </div>

      <Dialog open={addCourseDialog} onOpenChange={setAddCourseDialog}>
        <DialogContent className="max-w-lg rounded-[2.5rem] p-0 border-none bg-white dark:bg-zinc-900 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 lg:p-10 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="font-serif text-2xl">
              Aggiungi Corso
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mt-2">
              Nuova configurazione sistema
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 lg:p-10 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="admin-course-name"
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
              >
                Nome Corso
              </label>
              <input
                id="admin-course-name"
                type="text"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                placeholder="Es: Informatica - Vare"
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="admin-course-url"
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
              >
                Cineca URL
              </label>
              <input
                id="admin-course-url"
                type="text"
                value={newCourse.calendarUrl}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, calendarUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="admin-course-year"
                  className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Anno
                </label>
                <Select
                  value={newCourse.year === "" ? "" : String(newCourse.year)}
                  onValueChange={(v) =>
                    setNewCourse({ ...newCourse, year: Number(v) })
                  }
                >
                  <SelectTrigger
                    id="admin-course-year"
                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800"
                  >
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <SelectItem
                        key={y}
                        value={String(y)}
                        className="rounded-xl"
                      >
                        {y}° Anno
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="admin-academic-year"
                  className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Accademico
                </label>
                <AcademicYearPicker
                  id="admin-academic-year"
                  value={newCourse.academicYear}
                  onChange={(v) =>
                    setNewCourse({ ...newCourse, academicYear: v })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 gap-3">
            <button
              type="button"
              onClick={() => setAddCourseDialog(false)}
              className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleAddCourse}
              disabled={addCourseMutation.isPending}
              className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              Salva
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(o) =>
          !o && setConfirmDialog({ open: false, action: null, course: null })
        }
      >
        <DialogContent className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border-none shadow-2xl">
          <DialogHeader className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              {confirmDialog.action === "delete" ? (
                <Trash2 className="text-red-500" />
              ) : (
                <ShieldCheck className="text-blue-500" />
              )}
            </div>
            <DialogTitle className="font-serif text-xl">
              Conferma Operazione
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-zinc-500 font-medium leading-relaxed">
              Stai per{" "}
              {confirmDialog.action === "approve"
                ? "approvare"
                : confirmDialog.action === "reject"
                  ? "rifiutare"
                  : confirmDialog.action === "delete"
                    ? "eliminare"
                    : "verificare"}{" "}
              il corso{" "}
              <span className="text-zinc-900 dark:text-white font-bold">
                {confirmDialog.course?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmDialog({ open: false, action: null, course: null })
              }
              className="flex-1 py-3 font-bold text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={executeAction}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg",
                confirmDialog.action === "delete"
                  ? "bg-red-500 shadow-red-500/20"
                  : "bg-zinc-900 dark:bg-white dark:text-black shadow-zinc-900/20",
              )}
            >
              Conferma
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
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

function CourseCard({
  course,
  onApprove,
  onReject,
  onDelete,
  onVerify,
  copiedCourseId,
  onCopyLink,
}: CourseCardProps) {
  const statusConfig = {
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
  }[course.status as "pending" | "approved" | "rejected"];

  return (
    <motion.div
      layout
      className="group bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all"
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
          className={cn(
            "p-2.5 rounded-xl transition-all shadow-sm active:scale-90 border",
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
            <span>{new Date(course.createdAt).toLocaleDateString("it")}</span>
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
    </motion.div>
  );
}

function ActionButton({
  onClick,
  icon,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
}) {
  const cMap: Record<string, string> = {
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-100 dark:border-emerald-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-500 hover:text-white border-blue-100 dark:border-blue-800",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-100 dark:border-amber-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-500 hover:text-white border-red-100 dark:border-red-800",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-xl border transition-all active:scale-90 shadow-sm",
        cMap[color],
      )}
    >
      {icon}
    </button>
  );
}
