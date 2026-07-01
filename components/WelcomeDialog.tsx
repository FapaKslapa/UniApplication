"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, GraduationCap, UserCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1,
} as const;

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function WelcomeDialog({ isOpen, onComplete }: WelcomeDialogProps) {
  const [step, setStep] = useState(0);
  const { userRole, setUserRole } = useAppStore();
  const [roleSelected, setRoleSelected] = useState(false);

  const prevIsOpenRef = useRef(isOpen);
  if (isOpen !== prevIsOpenRef.current) {
    prevIsOpenRef.current = isOpen;
    if (isOpen) {
      setStep(0);
      setRoleSelected(false);
    }
  }

  if (!isOpen) return null;

  const handleRole = (role: "student" | "professor") => {
    setUserRole(role);
    setRoleSelected(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-nothing-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#FF2B2B] opacity-[0.03] dark:opacity-[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#3b82f6] opacity-[0.04] dark:opacity-[0.07] blur-[100px] pointer-events-none" />

      {}
      <div className="relative px-7 pt-14 pb-0 flex-shrink-0">
        <p className="nth-label text-zinc-400">INSUBRIA · ORARIO</p>
      </div>

      {}
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="step-role"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={SPRING}
            className="relative flex-1 flex flex-col px-7 pt-12"
          >
            {}
            <h1 className="font-serif italic font-bold text-[2.4rem] leading-[1.1] text-zinc-900 dark:text-white mb-2">
              Chi sei?
            </h1>
            <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-[0.18em] mb-10">
              Personalizza la tua esperienza
            </p>

            {}
            <div className="grid grid-cols-2 gap-3">
              {(["student", "professor"] as const).map((role) => {
                const isSelected = userRole === role && roleSelected;
                const Icon = role === "student" ? GraduationCap : UserCircle;
                return (
                  <motion.button
                    key={role}
                    type="button"
                    onClick={() => handleRole(role)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "flex flex-col items-start gap-4 p-5 rounded-[20px] border-2 transition-colors text-left",
                      isSelected
                        ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white"
                        : "bg-white dark:bg-[#111] border-zinc-100 dark:border-white/8",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-7 h-7",
                        isSelected
                          ? "text-white dark:text-black"
                          : "text-zinc-400",
                      )}
                      strokeWidth={1.25}
                    />
                    <div>
                      <p
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.2em] font-black leading-none mb-1",
                          isSelected
                            ? "text-white dark:text-black"
                            : "text-zinc-900 dark:text-white",
                        )}
                      >
                        {role === "student" ? "Studente" : "Docente"}
                      </p>
                      <p
                        className={cn(
                          "font-mono text-[9px] opacity-60 leading-snug",
                          isSelected
                            ? "text-white dark:text-black"
                            : "text-zinc-500",
                        )}
                      >
                        {role === "student"
                          ? "Cerca i tuoi corsi"
                          : "Cerca le tue lezioni"}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {}
            <div className="mt-8 p-4 rounded-[16px] overflow-hidden relative zima-gradient">
              <p className="relative z-10 font-mono text-[10px] text-white/80 uppercase tracking-[0.16em] mb-1">
                Dati live
              </p>
              <p className="relative z-10 font-serif italic text-white text-base font-semibold leading-snug">
                Orario aggiornato in tempo reale da Cineca · Insubria
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-features"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={SPRING}
            className="relative flex-1 flex flex-col px-7 pt-12"
          >
            <h1 className="font-serif italic font-bold text-[2.4rem] leading-[1.1] text-zinc-900 dark:text-white mb-2">
              Come funziona
            </h1>
            <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-[0.18em] mb-8">
              Tre cose da sapere
            </p>

            <div className="space-y-3">
              {[
                {
                  label: "01",
                  title: "Lezione in corso",
                  desc: "Il widget mostra sempre la lezione attiva, l'aula e il docente.",
                },
                {
                  label: "02",
                  title: "Settimana e mese",
                  desc: "Naviga tra le settimane con swipe o salta a qualsiasi data.",
                },
                {
                  label: "03",
                  title: "Notifiche push",
                  desc: "Avvisi immediati su cambi di aula, orario o cancellazioni.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex gap-4 p-4 rounded-[16px] bg-zinc-50 dark:bg-[#0D0D0D] border border-zinc-100 dark:border-white/6"
                >
                  <span className="nth-display text-2xl leading-none text-zinc-200 dark:text-zinc-800 shrink-0 w-7">
                    {item.label}
                  </span>
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-0.5">
                      {item.title}
                    </p>
                    <p className="font-serif italic text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="relative px-7 pb-10 pt-6 flex-shrink-0 space-y-3">
        {}
        <div className="flex gap-1.5 mb-4">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 20 : 4,
                backgroundColor: i === step ? "#FF2B2B" : undefined,
              }}
              className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800"
              transition={SPRING}
            />
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={step === 0 && !roleSelected}
          onClick={() => {
            if (step === 0 && roleSelected) setStep(1);
            else if (step === 1) onComplete();
          }}
          className={cn(
            "w-full flex items-center justify-between py-4 px-6 rounded-[18px] font-mono font-black text-[11px] uppercase tracking-[0.25em] transition-all",
            step === 0 && !roleSelected
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              : "bg-zinc-900 dark:bg-white text-white dark:text-black",
          )}
        >
          <span>{step === 1 ? "Inizia Ora" : "Continua"}</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {step === 0 && (
          <button
            type="button"
            onClick={() => {
              setUserRole("student");
              onComplete();
            }}
            className="w-full text-center font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-700 py-1"
          >
            Salta
          </button>
        )}
      </div>
    </motion.div>
  );
}
