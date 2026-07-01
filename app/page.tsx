"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Calendar,
  Calendar as CalendarMonthIcon,
  Clock,
  LayoutGrid,
  MapPin,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sliders,
  User,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AdminCoursesView } from "@/components/admin/AdminCoursesView";
import { AdminStatsView } from "@/components/admin/AdminStatsView";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDayDialog } from "@/components/CalendarDayDialog";
import { CalendarView } from "@/components/CalendarView";
import { DayView } from "@/components/DayView";
import { GrainOverlay } from "@/components/GrainOverlay";
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

const SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1,
} as const;

function BentoMiniCards({ schedule }: { schedule: DaySchedule[] }) {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const todayData = schedule[todayIdx];
  const todayCount = todayData?.events?.length ?? 0;
  const weekTotal = schedule.reduce((s, d) => s + (d?.events?.length ?? 0), 0);

  const cards = [
    { label: "OGGI", value: todayCount.toString(), sub: "lezioni" },
    { label: "SETT.", value: weekTotal.toString(), sub: "totale" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08 + i * 0.06,
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-[20px] overflow-hidden p-4 bg-zinc-100 dark:bg-[#0D0D0D]"
          style={{
            boxShadow:
              "0 8px 0 rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
            transform: "perspective(600px) rotateX(1.5deg)",
            transformOrigin: "top center",
          }}
        >
          <GrainOverlay opacity={0.06} blendMode="soft-light" />
          <p className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] relative z-10">
            {c.label}
          </p>
          <p
            className="font-mono font-black text-zinc-900 dark:text-white relative z-10 mt-1 leading-none tabular-nums"
            style={{ fontSize: "2.2rem", letterSpacing: "-0.04em" }}
          >
            {c.value}
          </p>
          <p className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5 relative z-10">
            {c.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [activeView, setActiveView] = useState<
    "week" | "month" | "stats" | "admin-courses"
  >(() => {
    if (typeof window === "undefined") return "week";
    const p = new URLSearchParams(window.location.search).get("view");
    if (p && ["week", "month", "stats", "admin-courses"].includes(p as string))
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
    location,
    widgetOrder,
    setWidgetOrder,
    hiddenWidgets,
    toggleWidgetVisibility,
  } = useAppStore();
  const activeLinkIds = useActiveLinkIds();
  const utils = api.useUtils();

  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isNotifIntroOpen, setIsNotifIntroOpen] = useState(false);
  const [notificationChanges, setNotificationChanges] = useState<
    TimetableChange[] | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    if (isEditingLayout) return;
    longPressTimeout.current = setTimeout(() => {
      setIsEditingLayout(true);
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 600);
  };

  const handlePressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  useEffect(() => {
    ensureUserId();
  }, [ensureUserId]);

  useEffect(() => {
    const changesParam = searchParams.get("changes");
    if (changesParam) {
      try {
        const decoded = JSON.parse(atob(changesParam)) as TimetableChange[];
        const today = new Date().toISOString().split("T")[0];
        const future = decoded.filter((c) => c.date >= today);
        if (future.length === 0) return;
        setNotificationChanges(future);
        localStorage.setItem(
          "last_seen_timetable_update",
          Date.now().toString(),
        );
        window.history.replaceState({}, "", window.location.pathname);
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

  const _routerPush = router.push;

  useEffect(() => {
    if (isClient) {
      if (!hasSeenWelcome) {
        setIsWelcomeOpen(true);
      } else if (!hasConfigured) {
      } else if (!hasSeenNotifIntro) {
        setIsNotifIntroOpen(true);
      }
    }
  }, [isClient, hasConfigured, hasSeenWelcome, hasSeenNotifIntro]);

  const handleWelcomeComplete = () => {
    setHasSeenWelcome(true);
    setIsWelcomeOpen(false);
  };

  const handleNotifIntroComplete = (openSettings = false) => {
    setHasSeenNotifIntro(true);
    setIsNotifIntroOpen(false);
    if (openSettings) setTimeout(() => router.push("/settings"), 300);
  };

  const {
    data: orario,
    isLoading,
    error,
  } = api.orario.getOrario.useQuery(
    {
      name: "INFORMATICA",
      location: location,
      dayOffset: weekOffset,
      linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
      professorName: userRole === "professor" ? professorName : undefined,
    },
    { placeholderData: (p) => p },
  );

  const { data: allSubjects = [] } = api.orario.getSubjects.useQuery({
    linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
    professorName: userRole === "professor" ? professorName : undefined,
  });

  const { data: latestChanges } = api.orario.getLatestChanges.useQuery(
    { linkIds: activeLinkIds },
    { enabled: isClient && activeLinkIds.length > 0 && !notificationChanges },
  );

  const prevLatestChangesRef = useRef(latestChanges);
  if (latestChanges !== prevLatestChangesRef.current) {
    prevLatestChangesRef.current = latestChanges;
    if (latestChanges && isClient && !notificationChanges) {
      const lastSeen = localStorage.getItem("last_seen_timetable_update");
      if (!lastSeen || parseInt(lastSeen, 10) < latestChanges.updatedAt) {
        setNotificationChanges(latestChanges.changes);
        localStorage.setItem(
          "last_seen_timetable_update",
          latestChanges.updatedAt.toString(),
        );
      }
    }
  }

  const schedule = orario ? parseOrarioData(orario) : [];
  const materiaColorMap = getMateriaColorMap(allSubjects);

  useEffect(() => {
    setSelectedDay(null);
  }, []);

  const handleNextWeek = () => setWeekOffset((p) => p + 7);
  const handlePrevWeek = () => setWeekOffset((p) => p - 7);
  const handleReset = () => setWeekOffset(0);

  if (!isClient) return null;

  if (isLoading && !orario) {
    return <LoadingScreen label="Caricamento orario..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error.message}
        onRetryAction={() => router.push("/settings")}
      />
    );
  }

  const displayTitle =
    activeView === "stats"
      ? "Statistiche"
      : activeView === "admin-courses"
        ? "Gestione Corsi"
        : userRole === "professor" && professorName
          ? `Doc. ${professorName}`
          : courseNames.length > 0
            ? courseNames.length > 1
              ? `${courseNames[0]} +${courseNames.length - 1}`
              : courseNames[0]
            : "Orario Insubria";

  const activeSection =
    activeView === "stats" || activeView === "admin-courses"
      ? "admin"
      : "calendar";

  return (
    <div
      onMouseDown={handlePressStart}
      onTouchStart={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchEnd={handlePressEnd}
      className="h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col overflow-hidden fixed inset-0 bg-nothing-grid"
    >
      <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#FF2B2B] opacity-[0.03] dark:opacity-[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#3b82f6] opacity-[0.04] dark:opacity-[0.06] blur-[100px] pointer-events-none" />
      <main
        className="w-full px-3 py-3 portrait:py-3 md:px-6 lg:px-8 lg:py-5 flex-1 max-w-screen-2xl mx-auto flex flex-col overflow-hidden md:pb-0"
        style={{
          paddingBottom:
            "calc(82px + max(0.75rem, env(safe-area-inset-bottom)))",
        }}
      >
        <header className="flex items-center justify-between mb-3 lg:mb-6 flex-shrink-0 gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] truncate leading-none">
              {displayTitle}
            </h1>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2 truncate">
              <span className="nothing-red-dot shrink-0" />
              <span>
                {activeSection === "admin"
                  ? "Admin · Riservato"
                  : `Orario Insubria${userRole === "professor" ? " · Docente" : ""}${!hasConfigured ? " · Demo" : ""}`}
              </span>
            </p>
          </div>

          {activeSection === "calendar" && (
            <button
              type="button"
              onClick={() => utils.orario.getOrario.invalidate()}
              className="md:hidden p-2 bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/8 rounded-xl text-zinc-500 active:scale-90 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-2">
            <div className="flex bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/8 p-1 rounded-xl gap-0.5">
              {(["week", "month"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all",
                    activeView === view
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/5 dark:border-white/8"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
                  )}
                >
                  {view === "week" ? (
                    <LayoutGrid className="w-3 h-3" />
                  ) : (
                    <CalendarMonthIcon className="w-3 h-3" />
                  )}
                  <span>{view === "week" ? "Settimana" : "Mese"}</span>
                </button>
              ))}
              {isAdmin &&
                (["stats", "admin-courses"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all",
                      activeView === view
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/5 dark:border-white/8"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
                    )}
                  >
                    {view === "stats" ? (
                      <BarChart3 className="w-3 h-3" />
                    ) : (
                      <ShieldCheck className="w-3 h-3" />
                    )}
                    <span>{view === "stats" ? "Stats" : "Corsi"}</span>
                  </button>
                ))}
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => utils.orario.getOrario.invalidate()}
              className="p-2 bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/8 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingLayout(!isEditingLayout)}
              className={cn(
                "p-2 border rounded-xl transition-all active:scale-90",
                isEditingLayout
                  ? "bg-[#FF2B2B] text-white border-[#FF2B2B] shadow-md shadow-[#FF2B2B]/20"
                  : "bg-black/4 dark:bg-white/5 border-black/5 dark:border-white/8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
              )}
              title="Modifica Layout"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="p-2 bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/8 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {!hasConfigured && activeSection === "calendar" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-4 py-2.5 rounded-[14px] border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-white/3 flex items-center justify-between gap-3 flex-shrink-0"
          >
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Visualizzando tutti i corsi disponibili
            </p>
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1 shrink-0 hover:opacity-70 transition-opacity"
            >
              Personalizza <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {activeView === "stats" ? (
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <AdminStatsView />
          </div>
        ) : activeView === "admin-courses" ? (
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <AdminCoursesView />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {activeView === "week" ? (
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-5 xl:gap-6 flex-1 min-h-0">
                <Reorder.Group
                  axis="y"
                  values={widgetOrder}
                  onReorder={setWidgetOrder}
                  className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex-1"
                >
                  {widgetOrder.map((id) => {
                    const isHidden = hiddenWidgets.includes(id);
                    if (isHidden) return null;

                    return (
                      <Reorder.Item
                        key={id}
                        value={id}
                        dragListener={isEditingLayout}
                        className={cn(
                          "relative rounded-[28px] transition-all duration-200",
                          id === "calendar" &&
                            "flex-1 min-h-[400px] flex flex-col",
                          isEditingLayout &&
                            "animate-wiggle border-2 border-dashed border-[#FF2B2B]/20 p-2 bg-zinc-50/50 dark:bg-zinc-950/20 cursor-grab active:cursor-grabbing",
                        )}
                      >
                        {isEditingLayout && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWidgetVisibility(id);
                            }}
                            className="absolute -top-2 -right-2 z-50 w-6 h-6 bg-[#FF2B2B] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all border-2 border-white dark:border-zinc-950 cursor-pointer"
                            title="Rimuovi"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}

                        {id === "next-lesson" && (
                          <NextLessonCard schedule={schedule} />
                        )}
                        {id === "bento" && (
                          <BentoMiniCards schedule={schedule} />
                        )}
                        {id === "calendar" && (
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
                        )}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
                <section className="hidden lg:flex flex-col lg:col-span-5 xl:col-span-4 min-w-0 min-h-0 h-full">
                  <DayView
                    day={selectedDay}
                    materiaColorMap={materiaColorMap}
                  />
                </section>
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-12 gap-2 lg:gap-5 xl:gap-6 flex-1 min-h-0 h-full">
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
        )}
      </main>

      {/* Floating Done / Add button layout */}
      <AnimatePresence>
        {isEditingLayout && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => {
                setIsEditingLayout(false);
                setIsAddDrawerOpen(false);
              }}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-zinc-200/10 flex items-center justify-center min-w-[90px]"
            >
              Fatto
            </button>
            {hiddenWidgets.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddDrawerOpen(true)}
                className="w-10 h-10 bg-[#FF2B2B] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/10"
                title="Aggiungi Widget"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android-style widget drawer */}
      <AnimatePresence>
        {isAddDrawerOpen && isEditingLayout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddDrawerOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
              className="fixed bottom-0 left-0 right-0 z-[120] bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 rounded-t-[32px] p-6 pb-12 shadow-2xl backdrop-blur-xl max-w-screen-md mx-auto"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6" />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-6 text-center font-bold">
                Aggiungi Widget
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {hiddenWidgets.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      toggleWidgetVisibility(id);
                      if (hiddenWidgets.length === 1) setIsAddDrawerOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-all active:scale-95 text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform">
                      {id === "next-lesson" && <Clock className="w-5 h-5" />}
                      {id === "bento" && <LayoutGrid className="w-5 h-5" />}
                      {id === "calendar" && <Calendar className="w-5 h-5" />}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] font-black text-zinc-700 dark:text-zinc-300">
                      {id === "next-lesson"
                        ? "Lezione"
                        : id === "bento"
                          ? "Statistiche"
                          : "Calendario"}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
        onNavigate={(offset) => {
          setWeekOffset(offset);
          setNotificationChanges(null);
        }}
      />
      <BottomNav
        activeView={activeView}
        activeSection={activeSection}
        onViewChange={setActiveView}
        onSettings={() => router.push("/settings")}
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

function NotificationChangeDialog({
  changes,
  onClose,
  onNavigate,
}: {
  changes: TimetableChange[] | null;
  onClose: () => void;
  onNavigate?: (weekOffset: number) => void;
}) {
  if (!changes) return null;

  return (
    <Dialog open={!!changes} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[88vw] md:max-w-[400px] rounded-[24px] p-0 border-none bg-white dark:bg-[#0D0D0D] overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 nth-header border-b nth-divider">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[14px] bg-zinc-900 dark:bg-white text-white dark:text-black">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="font-mono font-bold text-base text-zinc-900 dark:text-white uppercase tracking-wide">
                Aggiornamenti
              </DialogTitle>
              <DialogDescription className="nth-label text-zinc-400 mt-0.5">
                {changes.length}{" "}
                {changes.length === 1 ? "Variazione" : "Variazioni"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 max-h-[55dvh] overflow-y-auto custom-scrollbar space-y-3">
          {changes.map((change, i) => {
            const isCanceled = change.type === "CANCELED";
            const isAdded = change.type === "ADDED";
            const isModified = change.type === "MODIFIED";

            return (
              <div
                key={`${change.title}-${change.date}-${i}`}
                className={cn(
                  "p-4 rounded-[18px] border",
                  isCanceled
                    ? "bg-red-50/40 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/20"
                    : isAdded
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/20"
                      : "nth-card",
                )}
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h4
                    className={cn(
                      "text-sm font-bold font-sans uppercase tracking-tight leading-snug",
                      isCanceled
                        ? "text-red-700 dark:text-red-400 line-through"
                        : "text-zinc-900 dark:text-white",
                    )}
                  >
                    {change.title}
                  </h4>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black font-mono uppercase tracking-widest border",
                      isCanceled
                        ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                        : isAdded
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
                    )}
                  >
                    {isCanceled ? "Canc" : isAdded ? "New" : "Mod"}
                  </span>
                </div>

                <div className="space-y-2">
                  <InfoRow
                    icon={<Calendar className="w-3 h-3 text-zinc-400" />}
                    label={change.date}
                  />
                  <InfoRow
                    icon={<Clock className="w-3 h-3 text-zinc-400" />}
                    label={
                      isModified && change.diffs?.time
                        ? `${change.diffs.time.old} → ${change.diffs.time.new}`
                        : change.time
                    }
                  />
                  <InfoRow
                    icon={<MapPin className="w-3 h-3 text-zinc-400" />}
                    label={
                      isModified && change.diffs?.location
                        ? `${change.diffs.location.old} → ${change.diffs.location.new}`
                        : change.location
                    }
                  />
                  {change.professor && change.professor !== "N/A" && (
                    <InfoRow
                      icon={<User className="w-3 h-3 text-zinc-400" />}
                      label={change.professor}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="p-4 nth-header border-t nth-divider gap-2">
          {onNavigate && changes?.[0] && (
            <button
              type="button"
              onClick={() => {
                const target = new Date(changes[0].date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                target.setHours(0, 0, 0, 0);
                const diff = Math.round(
                  (target.getTime() - today.getTime()) / 86400000,
                );
                onNavigate(Math.floor(diff / 7) * 7);
              }}
              className="w-full py-2.5 bg-zinc-100 dark:bg-white/8 text-zinc-700 dark:text-zinc-300 rounded-[14px] font-mono font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Calendar className="w-3 h-3" /> Vai al Giorno
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[14px] font-mono font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-[0.98]"
          >
            Ho Capito
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate">
        {label}
      </span>
    </div>
  );
}
