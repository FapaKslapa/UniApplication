"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveLinkIds, useAppStore } from "@/lib/store";

const SETTINGS_REDIRECT_DELAY_MS = 300;

export function useHomeBootstrap() {
  const router = useRouter();
  const {
    hasSeenWelcome,
    setHasSeenWelcome,
    hasSeenNotifIntro,
    setHasSeenNotifIntro,
    userRole,
    professorName,
    ensureUserId,
  } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const [isClient, setIsClient] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isNotifIntroOpen, setIsNotifIntroOpen] = useState(false);

  const hasConfigured =
    (userRole === "student" && activeLinkIds.length > 0) ||
    (userRole === "professor" && !!professorName);

  useEffect(() => {
    ensureUserId();
  }, [ensureUserId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const routerPush = router.push;

  useEffect(() => {
    if (!isClient) return;
    if (!hasSeenWelcome) setIsWelcomeOpen(true);
    else if (!hasConfigured) routerPush("/settings?setup=true");
    else if (!hasSeenNotifIntro) setIsNotifIntroOpen(true);
  }, [isClient, hasConfigured, hasSeenWelcome, hasSeenNotifIntro, routerPush]);

  const completeWelcome = () => {
    setHasSeenWelcome(true);
    setIsWelcomeOpen(false);
  };

  const completeNotifIntro = (openSettings: boolean) => {
    setHasSeenNotifIntro(true);
    setIsNotifIntroOpen(false);
    if (openSettings) {
      setTimeout(() => router.push("/settings"), SETTINGS_REDIRECT_DELAY_MS);
    }
  };

  return {
    isClient,
    hasConfigured,
    isWelcomeOpen,
    isNotifIntroOpen,
    completeWelcome,
    completeNotifIntro,
  };
}
