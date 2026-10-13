"use client";

import { DateTime } from "luxon";

type StaleBannerProps = {
  updatedAt: number;
  onRetry: () => void;
};

export function StaleBanner({ updatedAt, onRetry }: StaleBannerProps) {
  const time = updatedAt
    ? DateTime.fromMillis(updatedAt).toFormat("HH:mm")
    : null;
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
      <span>Offline{time ? ` · dati aggiornati alle ${time}` : ""}</span>
      <button
        type="button"
        onClick={onRetry}
        className="-my-2 min-h-11 px-2 font-medium text-foreground underline underline-offset-2"
      >
        Riprova
      </button>
    </div>
  );
}
