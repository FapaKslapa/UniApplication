"use client";

import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Calendar,
  Calendar as CalendarMonthIcon,
  Clock,
  LayoutGrid,
  MapPin,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdminCoursesView } from "@/components/admin/AdminCoursesView";
import { AdminStatsView } from "@/components/admin/AdminStatsView";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDayDialog } from "@/components/CalendarDayDialog";
import { CalendarView } from "@/components/CalendarView";
import { DayView } from "@/components/DayView";
import { ErrorScreen, LoadingScreen } from "@/components/LoadingScreen";
import { MonthlyView } from "@/components/MonthlyView";
import NextLessonCard from "@/components/NextLessonCard";
import { NotificationsIntroDialog } from "@/components/NotificationsIntroDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { api } from "@/lib/api";
import type { DaySchedule } from "@/lib/orario-utils";
import { getMateriaColorMap, parseOrarioData } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type TimetableChange = {
  type: "ADDED" | "CANCELED" | "MODIFIED";
  title: string;
  date: string;
  time: string;
  location: string;
  professor: string;
  diffs?: {
    time?: { old: string; new: string };
    location?: { old: string; new: string };
    professor?: { old: string; new: string };
  };
};

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
  const [activeView, setActiveView] = useState<
    "week" | "month" | "stats" | "admin-courses"
  >(() => {
    if (typeof window === "undefined") return "week";
    const p = new URLSearchParams(window.location.search).get("view");
    if (
      p &&
      ["week", "month", "stats", "admin-courses"].includes(
        p as "week" | "month" | "stats" | "admin-courses",
      )
    )
      return p as "week" | "month" | "stats" | "admin-courses";
    return "week";
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
    isAdmin,
  } = useAppStore();
  const activeLinkIds = useActiveLinkIds();

  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isNotifIntroOpen, setIsNotifIntroOpen] = useState(false);
  const [notificationChanges, setNotificationChanges] = useState<
    TimetableChange[] | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    ensureUserId();
  }, [ensureUserId]);

  useEffect(() => {
    const changesParam = searchParams.get("changes");
    if (changesParam) {
      try {
        const decoded = JSON.parse(atob(changesParam));
        setNotificationChanges(decoded);

        // Segniamo come visto l'aggiornamento corrente se arriviamo da una notifica
        localStorage.setItem(
          "last_seen_timetable_update",
          Date.now().toString(),
        );

        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } catch (e) {
        console.error("Failed to parse changes:", e);
      }
    }
  }, [searchParams]);

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

  const { data: latestChanges } = api.orario.getLatestChanges.useQuery(
    {
      linkIds: activeLinkIds,
    },
    {
      enabled: isClient && activeLinkIds.length > 0 && !notificationChanges,
    },
  );

  useEffect(() => {
    if (latestChanges && isClient && !notificationChanges) {
      const lastSeenUpdate = localStorage.getItem("last_seen_timetable_update");
      if (
        !lastSeenUpdate ||
        parseInt(lastSeenUpdate, 10) < latestChanges.updatedAt
      ) {
        setNotificationChanges(latestChanges.changes);
        // Salviamo subito che le abbiamo viste per non ri-mostrarle se l'app ricarica
        localStorage.setItem(
          "last_seen_timetable_update",
          latestChanges.updatedAt.toString(),
        );
      }
    }
  }, [latestChanges, isClient, notificationChanges]);

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
    activeView === "stats"
      ? "Statistiche Sistema"
      : activeView === "admin-courses"
        ? "Gestione Corsi"
        : userRole === "professor" && professorName
          ? `Doc. ${professorName}`
          : courseNames.length > 0
            ? courseNames.length > 1
              ? `${courseNames[0]} (+${courseNames.length - 1})`
              : courseNames[0]
            : "Orario Insubria";

  const activeSection =
    activeView === "stats" || activeView === "admin-courses"
      ? "admin"
      : "calendar";

  return (
    <div className="h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col overflow-hidden fixed inset-0">
      <main
        className="w-full px-4 py-3 portrait:py-4 md:px-6 lg:px-8 lg:py-6 flex-1 max-w-screen-2xl mx-auto flex flex-col overflow-hidden md:pb-0"
        style={{
          paddingBottom: "calc(72px + max(1rem, env(safe-area-inset-bottom)))",
        }}
      >
        <header className="flex items-center justify-between mb-4 lg:mb-8 flex-shrink-0 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold text-zinc-900 dark:text-white font-serif tracking-tight truncate leading-none">
              {displayTitle}
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1 truncate">
              {activeSection === "admin"
                ? "Accesso Riservato • Gestione"
                : `Orario Insubria ${userRole === "professor" ? "• Docente" : ""}`}
            </p>
          </div>

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
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveView("stats")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeView === "stats"
                        ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                    )}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Stats</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("admin-courses")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeView === "admin-courses"
                        ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                    )}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Corsi</span>
                  </button>
                </>
              )}
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

        {activeView === "stats" ? (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AdminStatsView />
          </div>
        ) : activeView === "admin-courses" ? (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AdminCoursesView />
          </div>
        ) : hasConfigured ? (
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

      <NotificationChangeDialog
        changes={notificationChanges}
        onClose={() => setNotificationChanges(null)}
      />

      <BottomNav
        activeView={activeView}
        activeSection={activeSection}
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

function NotificationChangeDialog({
  changes,
  onClose,
}: {
  changes: TimetableChange[] | null;
  onClose: () => void;
}) {
  if (!changes) return null;

  return (
    <Dialog open={!!changes} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[88vw] md:max-w-[400px] rounded-[2.5rem] p-0 border-none bg-white dark:bg-zinc-900 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-zinc-50/50 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-zinc-900/10 dark:shadow-none">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="font-serif text-xl text-zinc-900 dark:text-white">
                Aggiornamenti
              </DialogTitle>
              <DialogDescription className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
                {changes.length}{" "}
                {changes.length === 1
                  ? "Variazione Rilevata"
                  : "Variazioni Rilevate"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 max-h-[55dvh] overflow-y-auto custom-scrollbar space-y-4 bg-white dark:bg-zinc-900">
          {changes.map((change, i) => {
            const isCanceled = change.type === "CANCELED";
            const isAdded = change.type === "ADDED";
            const isModified = change.type === "MODIFIED";

            return (
              <div
                key={`${change.title}-${change.date}-${i}`}
                className={cn(
                  "p-5 rounded-[2rem] border transition-all duration-300",
                  isCanceled
                    ? "bg-red-50/40 dark:bg-red-950/10 border-red-100 dark:border-red-900/20"
                    : isAdded
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20"
                      : "bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800/80",
                )}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h4
                      className={cn(
                        "text-sm font-bold font-serif leading-snug",
                        isCanceled
                          ? "text-red-700 dark:text-red-400 line-through"
                          : "text-zinc-900 dark:text-white",
                      )}
                    >
                      {change.title}
                    </h4>
                    <span
                      className={cn(
                        "shrink-0 px-2.5 py-1 rounded-full text-[8px] font-black font-mono uppercase tracking-widest border",
                        isCanceled
                          ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                          : isAdded
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700",
                      )}
                    >
                      {isCanceled ? "Canc" : isAdded ? "New" : "Mod"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {change.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {isModified && change.diffs?.time ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs text-zinc-400 line-through shrink-0">
                            {change.diffs.time.old}
                          </span>
                          <ArrowRight className="w-3 h-3 text-zinc-900 dark:text-white shrink-0" />
                          <span className="text-xs font-bold text-zinc-900 dark:text-white shrink-0">
                            {change.diffs.time.new}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          {change.time}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      {isModified && change.diffs?.location ? (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-zinc-400 line-through truncate">
                            {change.diffs.location.old}
                          </span>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-zinc-900 dark:text-white shrink-0" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                              {change.diffs.location.new}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                          {change.location}
                        </span>
                      )}
                    </div>

                    {change.professor && change.professor !== "N/A" && (
                      <div className="flex items-center gap-3">
                        <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                          {change.professor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="p-5 bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] hover:opacity-90 shadow-xl"
          >
            Ho Capito
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
