"use client";

import { it } from "date-fns/locale";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ArrowLeftToLine,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Video,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";
import { timeToMinutes } from "@/lib/date-utils";
import type { DaySchedule } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function MarqueeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const overflow =
      textRef.current.scrollWidth - containerRef.current.clientWidth;
    setOffset(overflow > 0 ? overflow : 0);
  }, []);

  const style =
    offset > 0
      ? ({
          animation: "marquee-text 8s ease-in-out infinite",
          "--marquee-offset": `-${offset}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div ref={containerRef} className="overflow-hidden w-full">
      <span
        ref={textRef}
        className={cn("inline-block whitespace-nowrap", className)}
        style={style}
      >
        {text}
      </span>
    </div>
  );
}

const SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1,
} as const;

export default function NextLessonCard({
  schedule: _schedule,
}: {
  schedule?: DaySchedule[];
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const [calMonth, setCalMonth] = useState<Date>(new Date());
  const { hiddenSubjects, professorName, userRole, location } = useAppStore();
  const activeLinkIds = useActiveLinkIds();

  const handleCalDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50)
      setCalMonth((p) => {
        const d = new Date(p);
        d.setMonth(d.getMonth() + 1);
        return d;
      });
    else if (info.offset.x > 50)
      setCalMonth((p) => {
        const d = new Date(p);
        d.setMonth(d.getMonth() - 1);
        return d;
      });
  };

  const goPrevDay = () => {
    if (dayOffset > 0) {
      setDirection(-1);
      setDayOffset((p) => p - 1);
      setLessonIdx(0);
    }
  };
  const goNextDay = () => {
    setDirection(1);
    setDayOffset((p) => p + 1);
    setLessonIdx(0);
  };
  const goPrevLesson = () => {
    if (lessonIdx > 0) {
      setDirection(-1);
      setLessonIdx((p) => p - 1);
      return true;
    }
    return false;
  };
  const goNextLesson = () => {
    if (lessons.length > 0 && lessonIdx < lessons.length - 1) {
      setDirection(1);
      setLessonIdx((p) => p + 1);
      return true;
    }
    return false;
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) {
      if (!goNextLesson()) goNextDay();
    } else if (info.offset.x > 50) {
      if (!goPrevLesson()) goPrevDay();
    }
  };

  const { data, isFetching } = api.orario.getNextLesson.useQuery(
    {
      dayOffset,
      linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
      location,
      professorName: userRole === "professor" ? professorName : undefined,
    },
    { enabled: true, placeholderData: (p) => p },
  );

  const lessons = useMemo(
    () =>
      (data?.lessons || []).filter(
        (l) =>
          (l.isVideo || !l.time?.toUpperCase().includes("ANNULLATO")) &&
          !hiddenSubjects.includes(l.title),
      ),
    [data, hiddenSubjects],
  );

  const prevNextLessonRef = useRef(data?.nextLesson);
  const prevDayOffsetRef = useRef(dayOffset);
  if (
    dayOffset !== prevDayOffsetRef.current ||
    data?.nextLesson !== prevNextLessonRef.current
  ) {
    prevDayOffsetRef.current = dayOffset;
    prevNextLessonRef.current = data?.nextLesson;
    if (lessons.length > 0 && dayOffset === 0 && data?.nextLesson) {
      const idx = lessons.findIndex(
        (l) =>
          l.time === data.nextLesson?.lesson.time &&
          l.title === data.nextLesson?.lesson.title,
      );
      if (idx !== -1) setLessonIdx(idx);
    }
  }

  const displayIdx = Math.max(0, Math.min(lessonIdx, lessons.length - 1));
  const lesson = lessons[displayIdx];
  const isNow =
    dayOffset === 0 &&
    !!lesson &&
    data?.nextLesson?.lesson.time === lesson.time &&
    data?.nextLesson?.status === "current";
  const isNext =
    dayOffset === 0 &&
    !!lesson &&
    data?.nextLesson?.lesson.time === lesson.time &&
    data?.nextLesson?.status === "next";

  const hasOverlap = (l: { time: string }, idx: number) => {
    if (!l.time?.includes(" - ")) return false;
    const [s, e] = l.time.split(" - ");
    const sMin = timeToMinutes(s);
    const eMin = timeToMinutes(e);
    if (sMin === null || eMin === null) return false;
    return lessons.some((ll, i) => {
      if (i === idx || !ll.time?.includes(" - ")) return false;
      const [ls, le] = ll.time.split(" - ");
      const lsMin = timeToMinutes(ls);
      const leMin = timeToMinutes(le);
      if (lsMin === null || leMin === null) return false;
      return sMin < leMin && eMin > lsMin;
    });
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 52 : -52, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 52 : -52, opacity: 0 }),
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.06}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="zima-gradient w-full rounded-[28px] overflow-hidden touch-none relative"
      style={{
        boxShadow:
          "0 24px 48px rgba(69, 112, 234, 0.35), 0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <GrainOverlay opacity={0.18} blendMode="soft-light" />

      <div className="relative z-10 flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <Popover
          open={isCalendarOpen}
          onOpenChange={(o) => {
            setIsCalendarOpen(o);
            if (o) {
              const d = new Date();
              d.setDate(d.getDate() + dayOffset);
              setCalMonth(d);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 font-mono text-[11px] text-white font-bold tracking-[0.1em] uppercase active:scale-95 transition-transform"
            >
              <span>{data?.dayName || "—"}</span>
              <ChevronDown className="w-3 h-3 text-white/60 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white dark:bg-[#0D0D0D] border border-zinc-200 dark:border-white/8 rounded-3xl shadow-2xl overflow-hidden"
            align="start"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleCalDrag}
              className="touch-none"
            >
              <Calendar
                mode="single"
                month={calMonth}
                onMonthChange={setCalMonth}
                selected={new Date(Date.now() + dayOffset * 86400000)}
                onSelect={(d) => {
                  if (d) {
                    const diff = Math.max(
                      0,
                      Math.round(
                        (new Date(d).setHours(0, 0, 0, 0) -
                          new Date().setHours(0, 0, 0, 0)) /
                          86400000,
                      ),
                    );
                    setDirection(diff > dayOffset ? 1 : -1);
                    setDayOffset(diff);
                    setIsCalendarOpen(false);
                    setLessonIdx(0);
                  }
                }}
                locale={it}
                className="font-mono"
              />
            </motion.div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1 shrink-0">
          {dayOffset !== 0 && (
            <button
              type="button"
              onClick={() => {
                setDirection(-1);
                setDayOffset(0);
              }}
              className="p-1.5 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeftToLine className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex border border-white/20 rounded-xl overflow-hidden p-0.5 gap-0.5">
            <button
              type="button"
              onClick={goPrevDay}
              disabled={dayOffset === 0}
              className="p-1.5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-20"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-white/70" />
            </button>
            <button
              type="button"
              onClick={goNextDay}
              className="p-1.5 hover:bg-white/10 transition-colors rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-2 min-h-[160px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {isFetching && !data ? (
            <motion.div
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[160px]"
            >
              <div className="w-5 h-5 border border-white/20 border-t-white rounded-full animate-spin" />
            </motion.div>
          ) : lessons.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[160px] gap-2"
            >
              <CalendarIcon className="w-8 h-8 text-white/30" strokeWidth={1} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Nessuna lezione
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${dayOffset}-${displayIdx}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING}
              className="flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.03,
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-mono font-black text-white leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(2rem, 9vw, 3rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {lesson.time}
                </motion.p>

                {(isNow || isNext) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="shrink-0 mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white font-mono text-[9px] font-black uppercase tracking-[0.15em]"
                    style={{ color: isNow ? "#FF2B2B" : "#4570EA" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isNow ? "#FF2B2B" : "#4570EA",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    {isNow ? "NOW" : "NEXT"}
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.07,
                  duration: 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mb-4"
              >
                <MarqueeText
                  text={lesson.title}
                  className="font-serif italic font-semibold text-white/95 leading-tight text-[1.05rem]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.25 }}
                className="rounded-[16px] bg-white/15 border border-white/20 px-4 py-3 space-y-1.5 backdrop-blur-sm"
              >
                {lesson.location && (
                  <div className="flex items-center gap-2 min-w-0">
                    {lesson.isVideo ? (
                      <Video className="w-3 h-3 shrink-0 text-white/70" />
                    ) : (
                      <MapPin className="w-3 h-3 shrink-0 text-white/70" />
                    )}
                    <span className="font-mono text-[11px] text-white/85 truncate">
                      {lesson.location}
                    </span>
                    {hasOverlap(lesson, displayIdx) && (
                      <span className="text-[#F5E642] font-mono font-black text-[10px] ml-auto shrink-0">
                        OVERLAP
                      </span>
                    )}
                  </div>
                )}
                {lesson.professor && (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3 h-3 shrink-0 text-white/70" />
                    <span className="font-mono text-[11px] text-white/85 truncate">
                      {lesson.professor}
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex justify-between items-center px-5 py-4 mt-1 border-t border-white/10">
        <div className="flex gap-1.5 items-center">
          {lessons.length > 1 ? (
            lessons.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === displayIdx ? 20 : 5 }}
                className="h-1 rounded-full"
                style={{
                  backgroundColor:
                    i === displayIdx
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.25)",
                }}
                transition={SPRING}
              />
            ))
          ) : (
            <div className="h-1 w-5 rounded-full bg-white/20" />
          )}
        </div>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (!goPrevLesson()) goPrevDay();
            }}
            disabled={dayOffset === 0 && displayIdx === 0}
            className="p-2 rounded-xl text-white/50 disabled:opacity-20 hover:bg-white/10 transition-colors active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!goNextLesson()) goNextDay();
            }}
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 transition-colors active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
