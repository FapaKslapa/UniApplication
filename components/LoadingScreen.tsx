"use client";

import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ErrorScreen({
  message,
  onRetryAction,
}: {
  message: string;
  onRetryAction?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center p-6 gap-6">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-4 text-center max-w-xs"
      >
        <div className="w-14 h-14 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Errore</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
            Errore di caricamento
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>

        {onRetryAction && (
          <Button onClick={onRetryAction} size="sm">
            Riprova
          </Button>
        )}
      </m.div>
    </div>
  );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {SKELETON_KEYS.slice(0, rows).map((k, i) => (
        <Skeleton
          key={k}
          className="h-12 rounded-lg"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
