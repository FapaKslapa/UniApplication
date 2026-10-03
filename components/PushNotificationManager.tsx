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
          "relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all active:scale-90 before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isSubscribed
            ? "border-success/40 bg-success/10 text-success hover:bg-success/20"
            : "border-border bg-muted text-muted-foreground hover:border-input hover:text-foreground",
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
          "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isSubscribed
            ? "bg-success/10 text-success border border-success/20"
            : "bg-muted text-muted-foreground hover:text-foreground",
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
