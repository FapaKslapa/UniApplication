"use client";

import type { DateTime } from "luxon";
import { type ReactNode, useMemo, useState } from "react";
import { LessonDetailSheet } from "@/components/agenda/LessonDetailSheet";
import {
  type LessonDetail,
  LessonDetailContext,
} from "@/lib/agenda/useLessonDetail";

type LessonDetailProviderProps = {
  date: DateTime;
  children: ReactNode;
};

export function LessonDetailProvider({
  date,
  children,
}: LessonDetailProviderProps) {
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [open, setOpen] = useState(false);

  const api = useMemo(
    () => ({
      open: (next: LessonDetail) => {
        setDetail(next);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <LessonDetailContext.Provider value={api}>
      {children}
      <LessonDetailSheet
        detail={detail}
        date={date}
        open={open}
        onOpenChange={setOpen}
      />
    </LessonDetailContext.Provider>
  );
}
