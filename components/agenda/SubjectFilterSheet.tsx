import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";

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
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle>Materie</DrawerTitle>
          <Button
            variant="ghost"
            size="sm"
            disabled={hiddenSubjects.length === 0}
            onClick={onReset}
          >
            Mostra tutte
          </Button>
        </DrawerHeader>

        {subjects.length === 0 ? (
          <p className="px-4 pb-6 text-sm text-muted-foreground">
            Nessuna materia questa settimana
          </p>
        ) : (
          <div className="max-h-[70dvh] overflow-y-auto overscroll-contain px-4 pb-6">
            {subjects.map((subject) => {
              const visible = !hiddenSet.has(subject);
              return (
                <div key={subject} className="flex h-14 items-center gap-3">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
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
                </div>
              );
            })}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
