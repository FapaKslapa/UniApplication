"use client";

import { Bell, BellRing } from "lucide-react";
import { usePushSubscription } from "@/components/usePushSubscription";
import { cn } from "@/lib/utils";

function PushStatusIcon({
  loading,
  isSubscribed,
  className,
}: {
  loading: boolean;
  isSubscribed: boolean;
  className: string;
}) {
  if (loading) {
    return (
      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );
  }
  return isSubscribed ? (
    <BellRing className={className} />
  ) : (
    <Bell className={className} />
  );
}

export function PushNotificationManager({
  linkId,
  compact = false,
}: {
  linkId: string;
  compact?: boolean;
}) {
  const { isSubscribed, loading, isSupported, subscribe, unsubscribe } =
    usePushSubscription(linkId);

  if (!isSupported) {
    return null;
  }

  const onClick = isSubscribed ? unsubscribe : subscribe;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        title={isSubscribed ? "Disattiva notifiche" : "Attiva notifiche"}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-xl border transition-all active:scale-90",
          isSubscribed
            ? "border-green-300 dark:border-green-500/40 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300",
        )}
      >
        <PushStatusIcon
          loading={loading}
          isSubscribed={isSubscribed}
          className="w-3.5 h-3.5"
        />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
          isSubscribed
            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
        )}
      >
        <PushStatusIcon
          loading={loading}
          isSubscribed={isSubscribed}
          className="w-3.5 h-3.5"
        />
        {isSubscribed ? "Notifiche On" : "Attiva Notifiche"}
      </button>
    </div>
  );
}
