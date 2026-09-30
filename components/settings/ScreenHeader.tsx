import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  action?: { label: string; onClick: () => void };
};

export function ScreenHeader({ title, onBack, action }: ScreenHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 px-4 py-3">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Indietro"
          onClick={onBack}
          className="-ml-1 rounded-full"
        >
          <ArrowLeft className="size-5 text-muted-foreground" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="text-base font-bold leading-none"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </header>
  );
}
