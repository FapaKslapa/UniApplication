"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  durationToPx,
  type EventGroup,
  offsetToPx,
} from "@/components/day-detail/dayLayout";
import { EventCard } from "@/components/day-detail/EventCard";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";

const SWIPE_THRESHOLD = 50;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

type EventCarouselProps = {
  group: EventGroup;
  colorFor: (materia: string) => string;
};

export function EventCarousel({ group, colorFor }: EventCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const count = group.events.length;
  const event = group.events[index];

  const step = (delta: -1 | 1) => {
    setDirection(delta);
    setIndex((current) => (current + delta + count) % count);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) step(1);
    else if (info.offset.x > SWIPE_THRESHOLD) step(-1);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springs.smooth}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <EventCard
            event={event}
            color={colorFor(event.materia)}
            style={{
              top: offsetToPx(event.startMin, group.start),
              height: durationToPx(event.startMin, event.endMin),
              left: 0,
              width: "100%",
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-3 bottom-2 z-30 flex items-center gap-1 rounded-full bg-popover/90 p-1 elevation-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Lezione precedente"
          onClick={() => step(-1)}
          className="size-9 rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {index + 1} / {count}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Lezione successiva"
          onClick={() => step(1)}
          className="size-9 rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
