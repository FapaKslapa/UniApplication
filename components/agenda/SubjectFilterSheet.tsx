import { m } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DrawerHeading } from "@/components/ui/drawer-heading";
import { Switch } from "@/components/ui/switch";
import { formatSubjectName } from "@/lib/agenda/subjectName";
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
        <DrawerHeading
          icon={SlidersHorizontal}
          title="Materie"
          description="Nascondi le materie che non vuoi vedere in agenda"
          action={
            <Button
              variant="ghost"
              size="sm"
              disabled={hiddenSubjects.length === 0}
              onClick={onReset}
              className="shrink-0"
            >
              Mostra tutte
            </Button>
          }
        />

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
                  <span className="flex-1 truncate text-sm font-medium">
                    {formatSubjectName(subject)}
                  </span>
                  <Switch
                    checked={visible}
                    onCheckedChange={() => onToggle(subject)}
                    aria-label={`Mostra ${formatSubjectName(subject)}`}
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
