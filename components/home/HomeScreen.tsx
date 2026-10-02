"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeBody } from "@/components/home/HomeBody";
import { HomeHeader } from "@/components/home/HomeHeader";
import { getHomeTitle, isAdminView } from "@/components/home/homeTitle";
import { NotificationChangeDialog } from "@/components/home/NotificationChangeDialog";
import { useHomeBootstrap } from "@/components/home/useHomeBootstrap";
import { useHomeView } from "@/components/home/useHomeView";
import { useTimetableChanges } from "@/components/home/useTimetableChanges";
import { NotificationsIntroDialog } from "@/components/NotificationsIntroDialog";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { shiftDays, startOfDay } from "@/lib/agenda/dates";
import type { AgendaMode } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const OWN_HEADER_VIEWS = new Set(["week", "docenti"]);

export function HomeScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const { courseNames, isAdmin } = useAppStore();
  const { activeView, setActiveView } = useHomeView();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(getCurrentItalianDateTime()),
  );
  const [agendaMode, setAgendaMode] = useState<AgendaMode>("day");
  const bootstrap = useHomeBootstrap();
  const timetableChanges = useTimetableChanges(bootstrap.isClient);

  const openSettings = () => router.push("/settings");
  const section = isAdminView(activeView) ? "admin" : "calendar";
  const hasOwnHeader = OWN_HEADER_VIEWS.has(activeView);
  const refresh = () => utils.orario.getOrario.invalidate();
  const title = getHomeTitle({ activeView, courseNames });

  if (!bootstrap.isClient) return null;

  return (
    <div className="fixed inset-0 flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col overflow-hidden px-4 py-3 portrait:py-4 md:px-6 md:pb-0 lg:px-8 lg:py-6",
          section === "admin"
            ? "max-w-screen-2xl"
            : "max-w-screen-2xl md:max-w-md",
        )}
        style={{
          paddingBottom: "calc(72px + max(1rem, env(safe-area-inset-bottom)))",
        }}
      >
        <HomeHeader
          title={title}
          subtitle={
            section === "admin"
              ? "Accesso riservato • Gestione"
              : "Orario Insubria"
          }
          showTitle={!hasOwnHeader}
          activeView={activeView}
          isAdmin={isAdmin}
          showRefresh={
            bootstrap.hasConfigured && section === "calendar" && !hasOwnHeader
          }
          onViewChange={setActiveView}
          onRefresh={refresh}
          onOpenSettings={openSettings}
        />
        <HomeBody
          activeView={activeView}
          hasConfigured={bootstrap.hasConfigured}
          title={title}
          selectedDate={selectedDate}
          agendaMode={agendaMode}
          onSelectedDateChange={setSelectedDate}
          onAgendaModeChange={setAgendaMode}
          onViewChange={setActiveView}
          onConfigure={openSettings}
          onRefresh={refresh}
        />
      </main>

      <WelcomeDialog
        isOpen={bootstrap.isWelcomeOpen}
        onComplete={bootstrap.completeWelcome}
      />
      <NotificationsIntroDialog
        isOpen={bootstrap.isNotifIntroOpen}
        onClose={() => bootstrap.completeNotifIntro(false)}
        onConfigure={() => bootstrap.completeNotifIntro(true)}
      />
      <NotificationChangeDialog
        changes={timetableChanges.changes}
        onClose={timetableChanges.dismiss}
        onNavigate={(offset) => {
          setSelectedDate(shiftDays(getCurrentItalianDateTime(), offset));
          setAgendaMode("day");
          setActiveView("week");
          timetableChanges.dismiss();
        }}
      />
      <BottomNav
        activeView={activeView}
        activeSection={section}
        onViewChange={setActiveView}
        onSettings={openSettings}
      />
    </div>
  );
}
