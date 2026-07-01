"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, MapPin, User, Video, X } from "lucide-react";
import { useMemo } from "react";
import type { DaySchedule, ParsedEvent } from "@/lib/orario-utils";
import { getDayName } from "@/lib/orario-utils";

interface CalendarDayViewProps {
  day: DaySchedule;
  onClose?: () => void;
}

const timeToMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fmtTime = (t: string) => {
  const [h, m] = t.split(":");
  return `${h}:${m ?? "00"}`;
};

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

interface ProcessedEvent extends ParsedEvent {
  startMin: number;
  endMin: number;
  overlaps: boolean;
}

export function CalendarDayView({ day, onClose }: CalendarDayViewProps) {
  const getMateriaColor = (materia: string) => {
    const norm = materia.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    return day.materiaColorMap?.[norm] || "#888888";
  };

  const events = useMemo((): ProcessedEvent[] => {
    const base = (day.events || [])
      .filter(
        (ev: ParsedEvent) =>
          !ev.time.toUpperCase().includes("ANNULLATO") &&
          ev.time.includes(" - "),
      )
      .map((ev: ParsedEvent) => {
        const [start, end] = ev.time.split(" - ");
        return {
          ...ev,
          startMin: timeToMins(start),
          endMin: timeToMins(end),
          overlaps: false,
        };
      })
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < base.length; i++) {
      for (let j = 0; j < base.length; j++) {
        if (
          i !== j &&
          base[i].startMin < base[j].endMin &&
          base[i].endMin > base[j].startMin
        ) {
          base[i].overlaps = true;
        }
      }
    }
    return base;
  }, [day.events]);

  const other = useMemo(
    () =>
      (day.events || []).filter(
        (ev: ParsedEvent) =>
          !ev.time.includes(" - ") &&
          !ev.time.toUpperCase().includes("ANNULLATO"),
      ),
    [day.events],
  );

  return (
    <div className="flex flex-col" style={{ maxHeight: "88dvh" }}>
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </div>

      <div className="px-5 py-4 flex items-start justify-between gap-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800/60">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span
              className="font-mono font-black text-zinc-900 dark:text-white leading-none"
              style={{
                fontSize: "clamp(2rem, 10vw, 2.5rem)",
                letterSpacing: "-0.04em",
              }}
            >
              {day.dayOfMonth !== undefined
                ? day.dayOfMonth.toString().padStart(2, "0")
                : "--"}
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {getDayName(day.day).slice(0, 3)}
            </span>
          </div>
          <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.15em] mt-1.5">
            {events.length} {events.length === 1 ? "lezione" : "lezioni"}
            {events.some((e) => e.overlaps) && (
              <span className="ml-2 text-amber-500">· sovrapposizioni</span>
            )}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-90 shrink-0 mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1.5">
        {events.map((ev: ProcessedEvent, i: number) => {
          const color = getMateriaColor(ev.materia);
          const [rawStart, rawEnd] = ev.time.split(" - ");
          const start = fmtTime(rawStart);
          const end = fmtTime(rawEnd);

          const nextEv = events[i + 1];
          const breakMins =
            nextEv && !ev.overlaps && !nextEv.overlaps
              ? nextEv.startMin - ev.endMin
              : 0;

          return (
            <AnimatePresence key={`${ev.materia}-${ev.time}-${i}`} mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="card-3d rounded-[18px] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex gap-0">
                    <div className="flex-1 px-4 py-4 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-mono font-black text-zinc-900 dark:text-white tabular-nums leading-none"
                            style={{
                              fontSize: "1.4rem",
                              letterSpacing: "-0.03em",
                            }}
                          >
                            {start}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-400 font-bold">
                            → {end}
                          </span>
                        </div>
                        {ev.overlaps && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                            <span className="font-mono text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              Overlap
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: color }}
                        />
                        <p className="font-mono font-bold uppercase tracking-tight text-zinc-900 dark:text-white text-[12px] leading-tight">
                          {ev.materia}
                        </p>
                      </div>

                      {(ev.aula || ev.docente) && (
                        <div className="flex flex-col gap-1">
                          {ev.aula && (
                            <div className="flex items-center gap-1.5">
                              {ev.isVideo ? (
                                <Video className="w-3 h-3 text-zinc-400 shrink-0" />
                              ) : (
                                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              )}
                              <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                {ev.aula}
                              </span>
                            </div>
                          )}
                          {ev.docente && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                {ev.docente}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {breakMins > 0 && (
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-[0.15em] whitespace-nowrap">
                      {fmtDuration(breakMins)} pausa
                    </span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          );
        })}

        {other.length > 0 && (
          <div className="pt-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-2 px-1">
              Altre attività
            </p>
            {other.map((ev: ParsedEvent, i: number) => (
              <div
                key={`${ev.materia}-${ev.time}-${i}`}
                className="rounded-[16px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/40 px-4 py-3 flex items-center justify-between gap-3 mb-1.5"
              >
                <p className="font-mono font-bold text-[11px] uppercase tracking-tight text-zinc-700 dark:text-zinc-300 truncate">
                  {ev.materia}
                </p>
                <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                  {ev.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {events.length === 0 && other.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              Nessuna lezione
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
