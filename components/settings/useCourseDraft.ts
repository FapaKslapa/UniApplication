"use client";

import { useEffect, useState } from "react";
import { useCopyFeedback } from "@/components/settings/useCopyFeedback";
import { api } from "@/lib/api";
import type { Course } from "@/lib/courses";
import { useAppStore } from "@/lib/store";

type Options = { userId: string; onEdit: () => void };

export function useCourseDraft({ userId, onEdit }: Options) {
  const { courseIds, storedCourseId } = useAppStore();
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const clipboard = useCopyFeedback();

  const { data: allCoursesData, refetch: refetchCourses } =
    api.courses.getAll.useQuery({ userId });
  const allCourses = allCoursesData ?? [];

  useEffect(() => {
    if (allCourses.length === 0 || selectedCourses.length > 0) return;
    const ids =
      courseIds.length > 0 ? courseIds : storedCourseId ? [storedCourseId] : [];
    const matched = allCourses.filter((course) => ids.includes(course.id));
    if (matched.length === 0) return;
    setSelectedCourses(matched);
  }, [allCourses, courseIds, selectedCourses.length, storedCourseId]);

  const toggleCourse = (course: Course) => {
    const updated = selectedCourses.some((c) => c.id === course.id)
      ? selectedCourses.filter((c) => c.id !== course.id)
      : [...selectedCourses, course];
    setSelectedCourses(updated);
    onEdit();
  };

  const copyCourseLink = (course: Course) =>
    clipboard.copy(course.linkId, course.id);

  const hasConfig = selectedCourses.length > 0;

  return {
    selectedCourses,
    toggleCourse,
    allCourses,
    refetchCourses,
    copiedKey: clipboard.copiedKey,
    copyCourseLink,
    hasConfig,
  };
}

export type CourseDraft = ReturnType<typeof useCourseDraft>;
