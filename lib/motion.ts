import type { Transition, Variants } from "framer-motion";

export const springs = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  smooth: { type: "spring", stiffness: 350, damping: 35, mass: 1 },
  gentle: { type: "spring", stiffness: 220, damping: 26, mass: 1 },
} as const satisfies Record<string, Transition>;

export const STAGGER_STEP = 0.035;
export const STAGGER_MAX_ITEMS = 8;

export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_MAX_ITEMS) * STAGGER_STEP;
}

export const slideVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -24 : 24, opacity: 0 }),
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...springs.gentle, delay: staggerDelay(index) },
  }),
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: springs.gentle },
};
