"use client";

import { m } from "framer-motion";
import type { DateTime } from "luxon";
import { NextUpLine } from "@/components/agenda/NextUpLine";
import type { NextUp } from "@/lib/agenda/nextUp";
import { scaleInVariants } from "@/lib/motion";

type HeroFinishedProps = {
  now: DateTime;
  nextUp: NextUp | null;
  colorFor: (materia: string) => string;
};

export function HeroFinished({ now, nextUp, colorFor }: HeroFinishedProps) {
  return (
    <m.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="relative flex shrink-0 flex-col gap-4 overflow-hidden rounded-xl bg-card p-5 elevation-1"
    >
      <div className="relative space-y-1">
        <p className="text-3xl font-bold leading-none tracking-tight">
          Per oggi hai finito.
        </p>
        <p className="text-sm text-muted-foreground">
          Il resto della giornata è tuo.
        </p>
      </div>
      {nextUp && (
        <div className="relative">
          <NextUpLine nextUp={nextUp} now={now} colorFor={colorFor} />
        </div>
      )}
    </m.div>
  );
}
