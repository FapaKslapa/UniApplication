"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDayView } from "@/components/CalendarDayView";
import type { DaySchedule } from "@/lib/orario-utils";

interface CalendarDayDialogProps {
  day: DaySchedule;
  isOpen: boolean;
  onClose: () => void;
}

const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 38,
  mass: 1,
} as const;

export function CalendarDayDialog({
  day,
  isOpen,
  onClose,
}: CalendarDayDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] overflow-hidden bg-white dark:bg-[#0D0D0D]"
            style={{
              maxHeight: "88dvh",
              boxShadow:
                "0 -8px 40px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.06)",
            }}
            role="dialog"
            aria-modal="true"
          >
            <CalendarDayView day={day} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
