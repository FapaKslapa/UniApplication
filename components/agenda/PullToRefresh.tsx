"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePullGesture } from "@/components/agenda/usePullGesture";
import { cn } from "@/lib/utils";

const HOLD_OFFSET = 52;
const MIN_SPIN_MS = 300;
const MAX_SPIN_MS = 1500;

type PullToRefreshProps = {
  children: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  disabled?: boolean;
  className?: string;
};

export function PullToRefresh({
  children,
  refreshing,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [holding, setHolding] = useState(false);
  const { pull, dragging, threshold } = usePullGesture({
    ref,
    disabled: disabled || holding,
    onTrigger: () => {
      setHolding(true);
      onRefresh();
    },
  });

  useEffect(() => {
    if (!holding) return;
    const cap = window.setTimeout(() => setHolding(false), MAX_SPIN_MS);
    return () => window.clearTimeout(cap);
  }, [holding]);

  useEffect(() => {
    if (!holding || refreshing) return;
    const timer = window.setTimeout(() => setHolding(false), MIN_SPIN_MS);
    return () => window.clearTimeout(timer);
  }, [holding, refreshing]);

  const spinning = holding;
  const progress = Math.min(1, pull / threshold);
  const armed = progress >= 1 || spinning;
  const offset = spinning ? HOLD_OFFSET : pull;
  const settle = dragging
    ? undefined
    : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-y-clip",
        className,
      )}
    >
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
        style={{
          transform: `translateY(${offset / 2 - 18}px) scale(${spinning ? 1 : 0.6 + progress * 0.4})`,
          opacity: spinning ? 1 : progress,
          transition: settle
            ? `${settle}, opacity 240ms cubic-bezier(0.22, 1, 0.36, 1)`
            : undefined,
        }}
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full border transition-colors duration-200",
            armed
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground elevation-1",
          )}
        >
          {spinning ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <RefreshCw
              className="size-4"
              style={{ transform: `rotate(${progress * 270}deg)` }}
            />
          )}
        </span>
        <span className="sr-only">{spinning ? "Aggiornamento…" : ""}</span>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col motion-reduce:!transition-none"
        style={{
          transform: offset > 0 ? `translateY(${offset}px)` : undefined,
          transition: settle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
