"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { SlideBody } from "@/components/welcome/SlideBody";
import { slides } from "@/components/welcome/slides";
import { cn } from "@/lib/utils";

type WelcomeDialogProps = {
  isOpen: boolean;
  onComplete: () => void;
};

export function WelcomeDialog({ isOpen, onComplete }: WelcomeDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setCurrentSlide(0);
  }

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const handleNext = () => {
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
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 pt-10">
            {slides.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  s.id === slide.id ? "w-6 bg-foreground" : "w-1.5 bg-muted",
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
                aria-label="Indietro"
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              size="lg"
              className="flex-1"
            >
              <span>{isLastSlide ? "Inizia Ora" : "Continua"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {!isLastSlide && (
            <Button
              type="button"
              variant="ghost"
              onClick={onComplete}
              className="w-full text-muted-foreground"
            >
              Salta Intro
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
