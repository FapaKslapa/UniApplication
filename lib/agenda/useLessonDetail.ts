import { createContext, useContext } from "react";
import type { ParsedEvent } from "@/lib/orario-utils";

export type LessonDetail = {
  event: ParsedEvent;
  color: string;
};

export type LessonDetailApi = {
  open: (detail: LessonDetail) => void;
};

export const LessonDetailContext = createContext<LessonDetailApi | null>(null);

export function useLessonDetail(): LessonDetailApi | null {
  return useContext(LessonDetailContext);
}
