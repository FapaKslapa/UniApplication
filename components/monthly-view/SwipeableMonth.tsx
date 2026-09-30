"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  monthVariants,
  SPRING_CONFIG,
  swipeStep,
} from "@/components/monthly-view/monthGrid";

type SwipeableMonthProps = {
  direction: number;
  className?: string;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function SwipeableMonth({
  direction,
  className,
  onPrev,
  onNext,
  children,
}: SwipeableMonthProps) {
  return (
    <motion.div
      custom={direction}
      variants={monthVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={SPRING_CONFIG}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      dragDirectionLock
      onDragEnd={(_e, { offset, velocity }) => {
        const step = swipeStep(offset.x, velocity.x);
        if (step > 0) onNext();
        else if (step < 0) onPrev();
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
