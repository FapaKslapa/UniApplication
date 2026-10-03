"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationsOff } from "@/components/exams/useNotificationsOff";

export function NotificationsHint() {
  const router = useRouter();
  const off = useNotificationsOff();
  if (!off) return null;

  return (
    <button
      type="button"
      onClick={() => router.push("/settings")}
      className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bell className="size-4 shrink-0" aria-hidden />
      <span className="underline underline-offset-2">
        Attiva le notifiche per ricevere i promemoria
      </span>
    </button>
  );
}
