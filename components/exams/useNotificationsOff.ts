"use client";

import { useEffect, useState } from "react";

export function useNotificationsOff() {
  const [off, setOff] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setOff(true);
        return;
      }
      if (Notification.permission !== "granted") {
        setOff(true);
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (active) setOff(!subscription);
      } catch {
        if (active) setOff(true);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, []);

  return off;
}
