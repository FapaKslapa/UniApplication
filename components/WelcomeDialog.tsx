"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { RoleSelectionButtons } from "@/components/welcome/RoleSelectionButtons";
import { SlideBody } from "@/components/welcome/SlideBody";
import { slides } from "@/components/welcome/slides";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type WelcomeDialogProps = {
  isOpen: boolean;
  onComplete: () => void;
};

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

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
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
    <Drawer open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DrawerContent>
        <DrawerTitle className="sr-only">Benvenuto</DrawerTitle>
        <div className="relative flex-1 px-8 pt-2 pb-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6 w-full"
            >
              <SlideBody slide={slide} />

              {isRoleSlide && (
                <RoleSelectionButtons
                  userRole={userRole}
                  roleSelected={roleSelected}
                  onSelect={handleRoleSelect}
                />
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              size="lg"
              className="flex-1"
            >
              <span>{isLastSlide ? "Inizia Ora" : "Continua"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {!isLastSlide && !isRoleSlide && (
            <Button
              type="button"
              variant="ghost"
              onClick={onComplete}
              className="w-full text-zinc-400"
            >
              Salta Intro
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
