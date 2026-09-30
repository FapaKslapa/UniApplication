"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import type { UserRole } from "@/components/settings/types";
import { useCopyFeedback } from "@/components/settings/useCopyFeedback";
import { api } from "@/lib/api";
import type { Course } from "@/lib/courses";
import { extractCalendarId } from "@/lib/orario-utils";
import { useAppStore } from "@/lib/store";

export const LINK_COPY_KEY = "calendar-link";

type Options = { userId: string; onEdit: () => void };

export function useCourseDraft({ userId, onEdit }: Options) {
  const {
    calendarIds,
    setCalendarIds,
    calendarId,
    calendarUrlStore,
    courseIds,
    storedCourseId,
    userRole: savedRole,
    professorName: savedProfessorName,
  } = useAppStore();

  const [role, setRole] = useState<UserRole>(savedRole);
  const [professorName, setProfessorName] = useState(savedProfessorName);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [previewIds, setPreviewIds] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseYear, setNewCourseYear] = useState<number | "">("");
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const clipboard = useCopyFeedback();

  const { data: allCourses = [], refetch: refetchCourses } =
    api.courses.getAll.useQuery({ userId });
  const { data: professors = [], isLoading: isLoadingProfessors } =
    api.orario.getProfessors.useQuery({}, { enabled: role === "professor" });

  useEffect(() => {
    if (calendarIds.length === 0 && calendarId) setCalendarIds([calendarId]);
    if (calendarUrlStore) {
      setCalendarUrl(calendarUrlStore);
      const extracted = extractCalendarId(calendarUrlStore);
      if (extracted) setPreviewIds([extracted]);
    } else if (calendarIds.length > 0) {
      setPreviewIds(calendarIds);
    } else if (calendarId) {
      setPreviewIds([calendarId]);
    }
  }, [calendarId, calendarIds, calendarUrlStore, setCalendarIds]);

  useEffect(() => {
    if (allCourses.length === 0 || selectedCourses.length > 0) return;
    const ids =
      courseIds.length > 0 ? courseIds : storedCourseId ? [storedCourseId] : [];
    const matched = allCourses.filter((course) => ids.includes(course.id));
    if (matched.length === 0) return;
    setSelectedCourses(matched);
    setPreviewIds(matched.map((course) => course.linkId));
  }, [allCourses, courseIds, selectedCourses.length, storedCourseId]);

  const changeCalendarUrl = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setCalendarUrl(url);
    onEdit();
    clipboard.reset();
    if (!url.trim()) {
      setPreviewIds(
        calendarIds.length > 0 ? calendarIds : calendarId ? [calendarId] : [],
      );
      return;
    }
    const extracted = extractCalendarId(url);
    setPreviewIds(extracted ? [extracted] : []);
  };

  const toggleCourse = (course: Course) => {
    const updated = selectedCourses.some((c) => c.id === course.id)
      ? selectedCourses.filter((c) => c.id !== course.id)
      : [...selectedCourses, course];
    setSelectedCourses(updated);
    setPreviewIds(updated.map((c) => c.linkId));
    onEdit();
  };

  const copyLink = () => {
    const link = calendarUrl || previewIds[0] || "";
    if (link) clipboard.copy(link, LINK_COPY_KEY);
  };

  const copyCourseLink = (course: Course) =>
    clipboard.copy(course.linkId, course.id);

  const changeRole = (next: UserRole) => {
    setRole(next);
    onEdit();
  };

  const hasConfig =
    (role === "student" &&
      (selectedCourses.length > 0 || previewIds.length > 0)) ||
    (role === "professor" && !!professorName);

  return {
    role,
    changeRole,
    professorName,
    setProfessorName,
    calendarUrl,
    changeCalendarUrl,
    previewIds,
    selectedCourses,
    toggleCourse,
    allCourses,
    refetchCourses,
    professors,
    isLoadingProfessors,
    newCourse: {
      name: newCourseName,
      setName: setNewCourseName,
      year: newCourseYear,
      setYear: setNewCourseYear,
      academicYear: newAcademicYear,
      setAcademicYear: setNewAcademicYear,
    },
    copiedKey: clipboard.copiedKey,
    copyLink,
    copyCourseLink,
    hasConfig,
  };
}

export type CourseDraft = ReturnType<typeof useCourseDraft>;
