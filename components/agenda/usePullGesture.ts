"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

const THRESHOLD = 72;
const MAX_PULL = 120;
const LOCK_DISTANCE = 8;

function resist(distance: number): number {
  return Math.min(MAX_PULL, distance * 0.5);
}

function isScrolledAncestor(
  target: EventTarget | null,
  root: HTMLElement,
): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== root.parentElement) {
    if (node.scrollTop > 0) return true;
    node = node.parentElement;
  }
  return false;
}

type Options = {
  ref: RefObject<HTMLElement | null>;
  disabled: boolean;
  onTrigger: () => void;
};

export function usePullGesture({ ref, disabled, onTrigger }: Options) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const triggerRef = useRef(onTrigger);
  triggerRef.current = onTrigger;

  useEffect(() => {
    const root = ref.current;
    if (!root || disabled) return;
    let startX = 0;
    let startY = 0;
    let axis: "none" | "pull" | "other" = "none";
    let tracking = false;
    let current = 0;

    const reset = () => {
      tracking = false;
      axis = "none";
      current = 0;
      setPull(0);
      setDragging(false);
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      tracking = !isScrolledAncestor(event.target, root);
      axis = "none";
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || axis === "other") return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (axis === "none") {
        if (Math.abs(dx) < LOCK_DISTANCE && Math.abs(dy) < LOCK_DISTANCE)
          return;
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
          axis = "other";
          return;
        }
        axis = "pull";
      }
      if (event.cancelable) event.preventDefault();
      current = resist(Math.max(0, dy - LOCK_DISTANCE));
      setDragging(true);
      setPull(current);
    };

    const onEnd = () => {
      const reached = axis === "pull" && current >= THRESHOLD * 0.5;
      reset();
      if (reached) triggerRef.current();
    };

    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: false });
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", reset, { passive: true });
    return () => {
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", reset);
    };
  }, [ref, disabled]);

  return { pull, dragging, threshold: THRESHOLD / 2 };
}
