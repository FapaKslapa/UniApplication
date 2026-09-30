import { m } from "framer-motion";
import { CalendarIcon } from "lucide-react";
import { scaleInVariants } from "@/lib/motion";

export function EmptyDay() {
  return (
    <m.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground"
    >
      <CalendarIcon className="size-10" strokeWidth={1.5} />
      <p className="text-sm font-semibold">Nessuna lezione</p>
      <p className="text-xs">Libero</p>
    </m.div>
  );
}
