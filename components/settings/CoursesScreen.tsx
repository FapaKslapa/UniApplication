"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, UserCircle } from "lucide-react";
import { ProfessorList } from "@/components/settings/ProfessorList";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/settings/SegmentedControl";
import { StudentPane } from "@/components/settings/StudentPane";
import type { UserRole } from "@/components/settings/types";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

const ROLE_OPTIONS: SegmentedOption<UserRole>[] = [
  { value: "student", label: "Studente", icon: GraduationCap },
  { value: "professor", label: "Docente", icon: UserCircle },
];

type CoursesScreenProps = { draft: CourseDraft };

export function CoursesScreen({ draft }: CoursesScreenProps) {
  const isStudent = draft.role === "student";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pt-4 pb-3">
        <SegmentedControl
          options={ROLE_OPTIONS}
          value={draft.role}
          onChange={draft.changeRole}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={draft.role}
          initial={{ opacity: 0, x: isStudent ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isStudent ? 12 : -12 }}
          transition={{ duration: 0.15 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {isStudent ? (
            <StudentPane draft={draft} />
          ) : (
            <ProfessorList draft={draft} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
