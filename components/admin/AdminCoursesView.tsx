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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { fadeUpVariants } from "@/lib/motion";

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
          className="ml-4 flex-shrink-0 rounded-full bg-foreground p-2.5 text-background elevation-1 transition-transform active:scale-90"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {["sk-a", "sk-b", "sk-c", "sk-d"].map((key, index) => (
              <Skeleton
                key={key}
                className="h-48 rounded-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCourses?.map((course, index) => (
              <m.div
                key={course.id}
                custom={index}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
              >
                <CourseCard
                  course={course}
                  onApprove={() => handleAction("approve", course)}
                  onReject={() => handleAction("reject", course)}
                  onDelete={() => handleAction("delete", course)}
                  onVerify={() => handleAction("verify", course)}
                  copiedCourseId={copiedCourseId}
                  onCopyLink={handleCopyCourseLink}
                />
              </m.div>
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
