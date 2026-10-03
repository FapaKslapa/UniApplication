import { m } from "framer-motion";
import type { DateTime } from "luxon";
import { NextUpLine } from "@/components/agenda/NextUpLine";
import type { NextUp } from "@/lib/agenda/nextUp";
import { scaleInVariants } from "@/lib/motion";

type EmptyDayProps = {
  now: DateTime;
  nextUp: NextUp | null;
  colorFor: (materia: string) => string;
};

export function EmptyDay({ now, nextUp, colorFor }: EmptyDayProps) {
  return (
    <m.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-1 flex-col items-start justify-center gap-5 overflow-hidden px-2 py-12"
    >
      <div className="relative space-y-1">
        <p className="text-3xl font-bold leading-tight tracking-tight">
          Giornata libera.
        </p>
        <p className="text-base text-muted-foreground">
          Nessuna lezione per oggi.
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
