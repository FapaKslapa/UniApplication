import { AnimatePresence, m } from "framer-motion";
import { springs } from "@/lib/motion";

type HeroTimeStatusProps = {
  status: string;
  statusKey: string | number;
  timeRange: string;
};

export function HeroTimeStatus({
  status,
  statusKey,
  timeRange,
}: HeroTimeStatusProps) {
  return (
    <div className="space-y-2">
      <p
        className="whitespace-nowrap font-bold leading-none tracking-[-0.03em]"
        style={{
          fontSize: "clamp(1.75rem, 9.5vw, 3.25rem)",
          fontVariantNumeric: "lining-nums proportional-nums",
        }}
      >
        {timeRange}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={statusKey}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={springs.gentle}
          className="text-sm font-semibold tabular-nums text-muted-foreground"
        >
          {status}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
