"use client";

import { AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarMonthIcon,
  LayoutGrid,
  Settings,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDayDialog } from "@/components/CalendarDayDialog";
import { CalendarView } from "@/components/CalendarView";
import { DayView } from "@/components/DayView";
import { ErrorScreen, LoadingScreen } from "@/components/LoadingScreen";
import { MonthlyView } from "@/components/MonthlyView";
import NextLessonCard from "@/components/NextLessonCard";
import { NotificationsIntroDialog } from "@/components/NotificationsIntroDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { api } from "@/lib/api";
import type { DaySchedule } from "@/lib/orario-utils";
import { getMateriaColorMap, parseOrarioData } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const _router = useRouter();
  const searchParams = useSearchParams();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [activeView, setActiveView] = useState<"week" | "month">(() => {
    if (typeof window === "undefined") return "week";
    const p = new URLSearchParams(window.location.search).get("view");
    return p === "month" ? "month" : "week";
  });

  const {
    courseNames,
    hasSeenWelcome,
    setHasSeenWelcome,
    hasSeenNotifIntro,
    setHasSeenNotifIntro,
    userRole,
    professorName,
    ensureUserId,
  } = useAppStore();
  const activeLinkIds = useActiveLinkIds();

  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isNotifIntroOpen, setIsNotifIntroOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Garantisce userId al mount
  useEffect(() => {
    ensureUserId();
  }, [ensureUserId]);

  // Leggi ?view= dal query string (arriva da BottomNav in settings)
  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "month" || v === "week") setActiveView(v);
  }, [searchParams]);

  useEffect(() => {
    setIsClient(true);
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const hasConfigured =
    (userRole === "student" && activeLinkIds.length > 0) ||
    (userRole === "professor" && !!professorName);

  const routerPush = _router.push;

  useEffect(() => {
    if (isClient) {
      if (!hasSeenWelcome) {
        setIsWelcomeOpen(true);
      } else if (!hasSeenNotifIntro) {
        setIsNotifIntroOpen(true);
      } else if (!hasConfigured) {
        routerPush("/settings?setup=true");
      }
    }
  }, [isClient, hasConfigured, hasSeenWelcome, hasSeenNotifIntro, routerPush]);

  const handleWelcomeComplete = () => {
    setHasSeenWelcome(true);
    setHasSeenNotifIntro(true);
    setIsWelcomeOpen(false);
    if (!hasConfigured) {
      setTimeout(() => {
        _router.push("/settings?setup=true");
      }, 300);
    }
  };

  const handleNotifIntroComplete = (openSettings = false) => {
    setHasSeenNotifIntro(true);
    setIsNotifIntroOpen(false);
    if (openSettings) {
      setTimeout(() => _router.push("/settings"), 300);
    }
  };

  const {
    data: orario,
    isLoading,
    error,
  } = api.orario.getOrario.useQuery(
    {
      name: "INFORMATICA",
      location: "Varese",
      dayOffset: weekOffset,
      linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
      professorName: userRole === "professor" ? professorName : undefined,
    },
    {
      placeholderData: (previousData) => previousData,
      enabled: hasConfigured,
    },
  );

  const { data: allSubjects = [] } = api.orario.getSubjects.useQuery(
    {
      linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
      professorName: userRole === "professor" ? professorName : undefined,
    },
    {
      enabled: hasConfigured,
    },
  );

  const schedule = orario ? parseOrarioData(orario) : [];
  const materiaColorMap = getMateriaColorMap(allSubjects);

  const handleNextWeek = () => setWeekOffset((prev) => prev + 7);
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 7);
  const handleReset = () => setWeekOffset(0);

  if (!isClient) {
    return null;
  }

  if (isLoading && !orario && hasConfigured) {
    return <LoadingScreen label="Caricamento orario..." />;
  }

  if (error && hasConfigured) {
    return (
      <ErrorScreen
        message={error.message}
        onRetryAction={() => _router.push("/settings")}
      />
    );
  }

  const displayTitle =
    userRole === "professor" && professorName
      ? `Doc. ${professorName}`
      : courseNames.length > 0
        ? courseNames.length > 1
          ? `${courseNames[0]} (+${courseNames.length - 1})`
          : courseNames[0]
        : "Orario Insubria";

  return (
    <div className="h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col overflow-hidden fixed inset-0">
      <main
        className="w-full px-4 py-3 portrait:py-4 md:px-6 lg:px-8 lg:py-6 flex-1 max-w-screen-2xl mx-auto flex flex-col overflow-hidden md:pb-0"
        style={{
          paddingBottom: "calc(72px + max(1rem, env(safe-area-inset-bottom)))",
        }}
      >
        <header className="flex items-center justify-between mb-4 lg:mb-8 flex-shrink-0 gap-4">
          {/* Titolo */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-white font-serif tracking-tight truncate leading-none">
              {displayTitle}
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1 truncate">
              Orario Insubria {userRole === "professor" && "• Docente"}
            </p>
          </div>

          {/* Controlli vista + theme + settings — solo desktop */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-1 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setActiveView("week")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeView === "week"
                    ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Settimana</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("month")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeView === "month"
                    ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                )}
              >
                <CalendarMonthIcon className="w-3.5 h-3.5" />
                <span>Mese</span>
              </button>
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => _router.push("/settings")}
              className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {hasConfigured ? (
          <div className="flex flex-col flex-1 min-h-0">
            {activeView === "week" ? (
              <div className="flex flex-col md:grid md:grid-cols-12 gap-3 lg:gap-6 xl:gap-8 flex-1 min-h-0">
                <section className="w-full md:col-span-4 lg:col-span-3 xl:col-span-3 flex-shrink-0 min-w-0 flex flex-col">
                  <NextLessonCard schedule={schedule} />
                </section>

                <section className="w-full flex-1 min-h-0 flex flex-col md:col-span-8 lg:col-span-4 xl:col-span-4">
                  <CalendarView
                    schedule={schedule}
                    weekOffset={weekOffset}
                    onNextWeek={handleNextWeek}
                    onPrevWeek={handlePrevWeek}
                    onReset={handleReset}
                    onSetOffset={setWeekOffset}
                    onDaySelect={setSelectedDay}
                    selectedDay={selectedDay}
                    materiaColorMap={materiaColorMap}
                  />
                </section>

                <section className="hidden lg:flex flex-col lg:col-span-5 xl:col-span-5 min-w-0 min-h-0">
                  <DayView
                    day={selectedDay}
                    materiaColorMap={materiaColorMap}
                  />
                </section>
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-12 gap-3 lg:gap-6 xl:gap-8 flex-1 min-h-0 h-full">
                <section className="flex-1 min-h-0 flex flex-col md:col-span-12 lg:col-span-7 xl:col-span-8 h-full">
                  <MonthlyView
                    onDaySelect={setSelectedDay}
                    materiaColorMap={materiaColorMap}
                  />
                </section>
                <section className="hidden lg:block lg:col-span-5 xl:col-span-4 min-h-0 h-full">
                  <DayView
                    day={selectedDay}
                    materiaColorMap={materiaColorMap}
                  />
                </section>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm animate-in zoom-in duration-500">
              <CalendarIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
            </div>
            <div className="max-w-xs space-y-3">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-serif">
                {userRole === "professor"
                  ? "Seleziona Docente"
                  : "Nessun calendario"}
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                {userRole === "professor"
                  ? "Configura il tuo nome e i corsi che insegni per visualizzare il tuo orario personalizzato."
                  : "Configura i tuoi corsi di studi per iniziare a visualizzare l'orario delle lezioni."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => _router.push("/settings")}
              className="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition-all active:scale-95"
            >
              Configura Ora
            </button>
          </div>
        )}
      </main>

      <WelcomeDialog
        isOpen={isWelcomeOpen}
        onComplete={handleWelcomeComplete}
      />

      <NotificationsIntroDialog
        isOpen={isNotifIntroOpen}
        onClose={() => handleNotifIntroComplete(false)}
        onConfigure={() => handleNotifIntroComplete(true)}
      />

      {/* Floating bottom nav — solo mobile */}
      <BottomNav
        activeView={activeView}
        onViewChange={setActiveView}
        onSettings={() => _router.push("/settings")}
      />

      <AnimatePresence>
        {selectedDay && !isDesktop && (
          <CalendarDayDialog
            day={selectedDay}
            isOpen={true}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <title>Calendario</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
