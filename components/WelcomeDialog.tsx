"use client";

import { AnimatePresence, m } from "framer-motion";
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" && !isLastSlide) handleNext();
    if (event.key === "ArrowLeft" && currentSlide > 0) handleBack();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DrawerContent
        onKeyDown={handleKeyDown}
        className="mx-auto w-full max-w-md"
      >
        <DrawerTitle className="sr-only">Benvenuto</DrawerTitle>
        <div className="relative flex-1 px-8 pt-2 pb-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <m.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center space-y-6 w-full"
            >
              <SlideBody slide={slide} />
            </m.div>
          </AnimatePresence>

          <div
            role="img"
            aria-label={`Passo ${currentSlide + 1} di ${slides.length}`}
            className="flex gap-1.5 pt-10"
          >
            {slides.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  s.id === slide.id ? "w-6 bg-foreground" : "w-1.5 bg-border",
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
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              size="lg"
              className="flex-1"
            >
              <span>{isLastSlide ? "Inizia" : "Avanti"}</span>
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>

          {!isLastSlide && (
            <Button
              type="button"
              variant="ghost"
              onClick={onComplete}
              className="w-full text-muted-foreground"
            >
              Salta
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
