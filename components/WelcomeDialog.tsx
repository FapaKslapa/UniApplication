"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const;

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

const slides = [
  {
    id: "role-selection",
    icon: Sparkles,
    title: "Benvenuto su UniOrario",
    description:
      "L'orario di tutto l'Ateneo Insubria in un'unica app. Prima di iniziare, dimmi chi sei.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    isRoleSelection: true,
  },
  {
    id: "how-it-works",
    icon: Sparkles,
    title: "Come funziona",
    description:
      "Seleziona i tuoi corsi dalle impostazioni e l'app costruirà il tuo orario personalizzato. Puoi vedere la settimana corrente, navigare tra i mesi e scoprire in tempo reale la lezione in corso, l'aula e il docente.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    bullets: [
      "📅  Vista settimanale e mensile",
      "⚡  Lezione in corso sempre visibile",
      "🔔  Notifiche su cambi orario",
    ],
  },
  {
    id: "notifications",
    icon: BellRing,
    title: "Resta sempre aggiornato",
    description:
      "Attiva le notifiche push: ti avvisiamo in tempo reale se una lezione viene spostata, cambia aula o viene annullata. Puoi scegliere per quali materie ricevere avvisi.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "community",
    icon: Heart,
    title: "Progetto della community",
    description:
      "UniOrario è un progetto open source fatto da studenti per studenti. Se manca il tuo corso puoi aggiungerlo tu stesso: verrà revisionato e reso disponibile a tutti.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    communityNote:
      "Trovato un bug o hai un'idea? Apri una issue su GitHub o scrivici.",
  },
];

export function WelcomeDialog({ isOpen, onComplete }: WelcomeDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [roleSelected, setRoleSelected] = useState(false);
  const { userRole, setUserRole } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setRoleSelected(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isRoleSlide = slide.isRoleSelection;
  const canProceed = !isRoleSlide || roleSelected;

  const handleRoleSelect = (role: "student" | "professor") => {
    setUserRole(role);
    setRoleSelected(true);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="w-full max-w-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="relative flex-1 px-8 pt-12 pb-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6 w-full"
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500",
                  slide.bgColor,
                )}
              >
                <Icon className={cn("w-10 h-10", slide.color)} />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-serif tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed font-serif italic">
                  {slide.description}
                </p>
              </div>

              {slide.isRoleSelection && (
                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("student")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all active:scale-95",
                      userRole === "student" && roleSelected
                        ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black shadow-lg"
                        : "bg-white dark:bg-black border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-800",
                    )}
                  >
                    <GraduationCap className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Studente
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("professor")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all active:scale-95",
                      userRole === "professor" && roleSelected
                        ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black shadow-lg"
                        : "bg-white dark:bg-black border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-800",
                    )}
                  >
                    <UserCircle className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Docente
                    </span>
                  </button>
                </div>
              )}

              {"bullets" in slide && slide.bullets && (
                <ul className="w-full space-y-2 pt-1">
                  {slide.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-left text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-2.5 font-medium"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {"communityNote" in slide && slide.communityNote && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-3 leading-relaxed w-full text-left">
                  {slide.communityNote}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 pt-10">
            {slides.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  s.id === slide.id
                    ? "w-6 bg-zinc-900 dark:bg-white"
                    : "w-1.5 bg-zinc-200 dark:bg-zinc-800",
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-xl text-sm uppercase tracking-widest font-mono",
                canProceed
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none",
              )}
            >
              <span>{isLastSlide ? "Inizia Ora" : "Continua"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isLastSlide && !isRoleSlide && (
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-tighter font-mono"
            >
              Salta Intro
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
