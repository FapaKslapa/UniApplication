"use client";

import { m } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddCourseDrawer } from "@/components/admin/courses/AddCourseDrawer";
import { ConfirmActionDrawer } from "@/components/admin/courses/ConfirmActionDrawer";
import { CourseCard } from "@/components/admin/courses/CourseCard";
import {
  CourseFilterTabs,
  type FilterType,
} from "@/components/admin/courses/CourseFilterTabs";
import { useCourseAdminMutations } from "@/components/admin/courses/useCourseAdminMutations";
import { api } from "@/lib/api";

export function AdminCoursesView() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);

  const { data: courses, isLoading } = api.courses.getAllForAdmin.useQuery();

  const {
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
  } = useCourseAdminMutations();

  const handleCopyCourseLink = async (linkId: string, courseId: string) => {
    try {
      await navigator.clipboard.writeText(linkId);
      setCopiedCourseId(courseId);
      setTimeout(() => setCopiedCourseId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCourses = courses?.filter((c) => c.status === "pending") || [];
  const approvedCourses = courses?.filter((c) => c.status === "approved") || [];
  const rejectedCourses = courses?.filter((c) => c.status === "rejected") || [];
  const filteredCourses = courses?.filter(
    (c) => filter === "all" || c.status === filter,
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <CourseFilterTabs
          filter={filter}
          onFilterChange={setFilter}
          totalCount={courses?.length || 0}
          pendingCount={pendingCourses.length}
          approvedCount={approvedCourses.length}
          rejectedCount={rejectedCourses.length}
        />
        <button
          type="button"
          onClick={() => setAddCourseDialog(true)}
          aria-label="Aggiungi corso"
          className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl transition-transform active:scale-90 shadow-md flex-shrink-0 ml-4"
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
            {filteredCourses?.map((course) => (
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

      <AddCourseDrawer
        open={addCourseDialog}
        onOpenChange={setAddCourseDialog}
        newCourse={newCourse}
        onChange={setNewCourse}
        onSave={handleAddCourse}
        isSaving={addCourseMutation.isPending}
      />

      <ConfirmActionDrawer
        open={confirmDialog.open}
        action={confirmDialog.action}
        course={confirmDialog.course}
        onClose={closeConfirmDialog}
        onConfirm={executeAction}
      />
    </m.div>
  );
}
