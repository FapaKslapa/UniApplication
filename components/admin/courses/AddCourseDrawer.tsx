import { Plus } from "lucide-react";
import { AcademicYearPicker } from "@/components/ui/academic-year-picker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewCourseState {
  name: string;
  calendarUrl: string;
  year: number | "";
  academicYear: string;
}

interface AddCourseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCourse: NewCourseState;
  onChange: (next: NewCourseState) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function AddCourseDrawer({
  open,
  onOpenChange,
  newCourse,
  onChange,
  onSave,
  isSaving,
}: AddCourseDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
            <Plus className="size-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DrawerTitle className="text-xl">Aggiungi corso</DrawerTitle>
            <DrawerDescription>Nuova configurazione sistema</DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="space-y-5 px-5 pb-6">
          <div className="space-y-2">
            <label
              htmlFor="admin-course-name"
              className="ml-1 text-xs font-medium text-muted-foreground"
            >
              Nome Corso
            </label>
            <input
              id="admin-course-name"
              type="text"
              value={newCourse.name}
              onChange={(e) => onChange({ ...newCourse, name: e.target.value })}
              placeholder="Es: Informatica - Vare"
              className="w-full rounded-md bg-card px-4 py-3 text-sm elevation-1 transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="admin-course-url"
              className="ml-1 text-xs font-medium text-muted-foreground"
            >
              Cineca URL
            </label>
            <input
              id="admin-course-url"
              type="text"
              value={newCourse.calendarUrl}
              onChange={(e) =>
                onChange({ ...newCourse, calendarUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full rounded-md bg-card px-4 py-3 text-xs elevation-1 transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="admin-course-year"
                className="ml-1 text-xs font-medium text-muted-foreground"
              >
                Anno
              </label>
              <Select
                value={newCourse.year === "" ? "" : String(newCourse.year)}
                onValueChange={(v) =>
                  onChange({ ...newCourse, year: Number(v) })
                }
              >
                <SelectTrigger
                  id="admin-course-year"
                  className="h-12 rounded-md bg-card elevation-1"
                >
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}° Anno
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="admin-academic-year"
                className="ml-1 text-xs font-medium text-muted-foreground"
              >
                Accademico
              </label>
              <AcademicYearPicker
                id="admin-academic-year"
                value={newCourse.academicYear}
                onChange={(v) => onChange({ ...newCourse, academicYear: v })}
              />
            </div>
          </div>
        </div>
        <DrawerFooter className="flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1"
          >
            Salva
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
