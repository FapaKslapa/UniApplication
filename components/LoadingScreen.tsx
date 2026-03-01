"use client";

import { motion } from "framer-motion";

/** Schermata di caricamento full-page */
export function LoadingScreen({
  label = "Caricamento...",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo / icona pulsante */}
        <div className="relative w-14 h-14">
          {/* anello esterno che ruota */}
          <div className="absolute inset-0 rounded-full border-2 border-zinc-100 dark:border-zinc-900" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white animate-spin" />
          {/* cerchio interno */}
          <div className="absolute inset-2 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
          </div>
        </div>

        <p className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
          {label}
        </p>
      </motion.div>
    </div>
  );
}

/** Schermata di errore full-page */
export function ErrorScreen({
  message,
  onRetryAction,
}: {
  message: string;
  onRetryAction?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center p-6 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-4 text-center max-w-xs"
      >
        <div className="w-14 h-14 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
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
          <p className="text-sm font-bold font-serif text-zinc-900 dark:text-white mb-1">
            Errore di caricamento
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic leading-relaxed">
            {message}
          </p>
        </div>

        {onRetryAction && (
          <button
            type="button"
            onClick={onRetryAction}
            className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold font-mono uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all"
          >
            Riprova
          </button>
        )}
      </motion.div>
    </div>
  );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Skeleton bar — usato per placeholder liste */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {SKELETON_KEYS.slice(0, rows).map((k, i) => (
        <div
          key={k}
          className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
