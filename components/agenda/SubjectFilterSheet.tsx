import { m } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { fadeUpVariants } from "@/lib/motion";

type SubjectFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: string[];
  hiddenSubjects: string[];
  colorFor: (materia: string) => string;
  onToggle: (materia: string) => void;
  onReset: () => void;
};

export function SubjectFilterSheet({
  open,
  onOpenChange,
  subjects,
  hiddenSubjects,
  colorFor,
  onToggle,
  onReset,
}: SubjectFilterSheetProps) {
  const hiddenSet = new Set(hiddenSubjects);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
            <SlidersHorizontal className="size-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DrawerTitle className="text-xl">Materie</DrawerTitle>
            <DrawerDescription>
              Nascondi le materie che non vuoi vedere in agenda
            </DrawerDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={hiddenSubjects.length === 0}
            onClick={onReset}
            className="shrink-0"
          >
            Mostra tutte
          </Button>
        </DrawerHeader>

        {subjects.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-muted-foreground">
            Nessuna materia questa settimana
          </p>
        ) : (
          <div className="max-h-[70dvh] space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-6">
            {subjects.map((subject, index) => {
              const visible = !hiddenSet.has(subject);
              return (
                <m.div
                  key={subject}
                  custom={index}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex h-14 items-center gap-3 rounded-md bg-card px-3"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colorFor(subject) }}
                  />
                  <span className="flex-1 truncate text-sm font-medium capitalize">
                    {subject.toLowerCase()}
                  </span>
                  <Switch
                    checked={visible}
                    onCheckedChange={() => onToggle(subject)}
                    aria-label={`Mostra ${subject}`}
                  />
                </m.div>
              );
            })}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
