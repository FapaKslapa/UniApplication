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
import type { AgendaMode, AgendaSource } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import type { DaySchedule } from "@/lib/orario-utils";
import { useAppStore } from "@/lib/store";

export function HomeScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const { courseNames, userRole, professorName, isAdmin } = useAppStore();
  const { activeView, setActiveView } = useHomeView();
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(getCurrentItalianDateTime()),
  );
  const [agendaMode, setAgendaMode] = useState<AgendaMode>("day");
  const bootstrap = useHomeBootstrap();
  const timetableChanges = useTimetableChanges(bootstrap.isClient);

  const isProfessor = userRole === "professor";
  const openSettings = () => router.push("/settings");
  const section = isAdminView(activeView) ? "admin" : "calendar";
  const source: AgendaSource =
    isProfessor && professorName
      ? { kind: "professor", name: professorName }
      : { kind: "courses" };
  const title = getHomeTitle({
    activeView,
    isProfessor,
    professorName,
    courseNames,
  });

  if (!bootstrap.isClient) return null;

  const openDay = (day: DaySchedule) => {
    if (day.date) setSelectedDate(startOfDay(day.date));
    setAgendaMode("day");
    setActiveView("week");
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <main
        className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col overflow-hidden px-4 py-3 portrait:py-4 md:px-6 md:pb-0 lg:px-8 lg:py-6"
        style={{
          paddingBottom: "calc(72px + max(1rem, env(safe-area-inset-bottom)))",
        }}
      >
        <HomeHeader
          title={title}
          subtitle={
            section === "admin"
              ? "Accesso riservato • Gestione"
              : `Orario Insubria${isProfessor ? " • Docente" : ""}`
          }
          showTitle={activeView !== "week"}
          activeView={activeView}
          isAdmin={isAdmin}
          showRefresh={bootstrap.hasConfigured && section === "calendar"}
          onViewChange={setActiveView}
          onRefresh={() => utils.orario.getOrario.invalidate()}
          onOpenSettings={openSettings}
        />
        <HomeBody
          activeView={activeView}
          hasConfigured={bootstrap.hasConfigured}
          isProfessor={isProfessor}
          source={source}
          title={title}
          selectedDate={selectedDate}
          agendaMode={agendaMode}
          materiaColorMap={{}}
          onSelectedDateChange={setSelectedDate}
          onAgendaModeChange={setAgendaMode}
          onOpenDay={openDay}
          onViewChange={setActiveView}
          onConfigure={openSettings}
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
