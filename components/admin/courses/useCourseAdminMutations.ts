import { useState } from "react";
import { api } from "@/lib/api";
import type { Course } from "@/lib/courses";
import { extractCalendarId } from "@/lib/orario-utils";

type ActionType = "approve" | "reject" | "delete" | "verify";

export function useCourseAdminMutations() {
  const utils = api.useUtils();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ActionType | null;
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

  const onMutationSuccess = () => {
    utils.courses.getAllForAdmin.invalidate();
    setConfirmDialog({ open: false, action: null, course: null });
  };

  const approveMutation = api.courses.approve.useMutation({
    onSuccess: onMutationSuccess,
  });
  const rejectMutation = api.courses.reject.useMutation({
    onSuccess: onMutationSuccess,
  });
  const deleteMutation = api.courses.delete.useMutation({
    onSuccess: onMutationSuccess,
  });
  const verifyMutation = api.courses.verify.useMutation({
    onSuccess: onMutationSuccess,
  });

  const addCourseMutation = api.courses.add.useMutation({
    onSuccess: () => {
      utils.courses.getAllForAdmin.invalidate();
      setAddCourseDialog(false);
      setNewCourse({ name: "", calendarUrl: "", year: "", academicYear: "" });
    },
    onError: (e) => alert(e.message),
  });

  const handleAction = (action: ActionType, course: Course) =>
    setConfirmDialog({ open: true, action, course });

  const closeConfirmDialog = () =>
    setConfirmDialog({ open: false, action: null, course: null });

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

  return {
    confirmDialog,
    handleAction,
    closeConfirmDialog,
    executeAction,
    addCourseDialog,
    setAddCourseDialog,
    newCourse,
    setNewCourse,
    handleAddCourse,
    addCourseMutation,
  };
}
