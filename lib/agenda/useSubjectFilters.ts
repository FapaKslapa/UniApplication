"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

function syncNotificationFilters(
  next: string[],
  mutate: (input: { filters: string[] }) => void,
) {
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    mutate({ filters: next });
  }
}

export function useSubjectFilters() {
  const { hiddenSubjects, setHiddenSubjects } = useAppStore();
  const { mutate } = api.notifications.updateAllFilters.useMutation();

  const toggleSubject = useCallback(
    (materia: string) => {
      const next = hiddenSubjects.includes(materia)
        ? hiddenSubjects.filter((subject) => subject !== materia)
        : [...hiddenSubjects, materia];
      setHiddenSubjects(next);
      syncNotificationFilters(next, mutate);
    },
    [hiddenSubjects, setHiddenSubjects, mutate],
  );

  const resetFilters = useCallback(() => {
    setHiddenSubjects([]);
    syncNotificationFilters([], mutate);
  }, [setHiddenSubjects, mutate]);

  return { hiddenSubjects, toggleSubject, resetFilters };
}
