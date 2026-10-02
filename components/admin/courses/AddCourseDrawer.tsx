import { AcademicYearPicker } from "@/components/ui/academic-year-picker";
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Aggiungi corso</DrawerTitle>
          <DrawerDescription>Nuova configurazione sistema</DrawerDescription>
        </DrawerHeader>
        <div className="p-8 lg:p-10 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="admin-course-name"
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
            >
              Nome Corso
            </label>
            <input
              id="admin-course-name"
              type="text"
              value={newCourse.name}
              onChange={(e) => onChange({ ...newCourse, name: e.target.value })}
              placeholder="Es: Informatica - Vare"
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-shadow text-sm"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="admin-course-url"
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
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
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-shadow text-xs font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="admin-course-year"
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
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
                  className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800"
                >
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="rounded-xl"
                    >
                      {y}° Anno
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="admin-academic-year"
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 ml-1"
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
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg"
          >
            Salva
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
