"use client";

import { motion } from "framer-motion";

export function LoadingScreen({
  label = "Caricamento...",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black bg-nothing-grid flex flex-col items-center justify-center gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center gap-5"
      >
        {}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border border-black/8 dark:border-white/8" />
          <div
            className="absolute inset-0 rounded-full border border-transparent border-t-zinc-900 dark:border-t-white animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
          {}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="nothing-red-dot" />
          </div>
        </div>

        <p className="nth-label text-zinc-400 dark:text-zinc-600">{label}</p>
      </motion.div>
    </div>
  );
}

export function ErrorScreen({
  message,
  onRetryAction,
}: {
  message: string;
  onRetryAction?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black bg-nothing-grid flex flex-col items-center justify-center p-6 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4 text-center max-w-xs"
      >
        <div className="w-12 h-12 rounded-[16px] bg-red-50 dark:bg-red-500/8 border border-red-200 dark:border-red-500/15 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-500"
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
          <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
            Errore
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
            {message}
          </p>
        </div>
        {onRetryAction && (
          <button
            type="button"
            onClick={onRetryAction}
            className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[12px] text-[10px] font-mono font-bold uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all"
          >
            Riprova
          </button>
        )}
      </motion.div>
    </div>
  );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {SKELETON_KEYS.slice(0, rows).map((k, i) => (
        <div
          key={k}
          className="h-12 rounded-[14px] bg-zinc-100 dark:bg-white/4 border border-zinc-200 dark:border-white/6"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
