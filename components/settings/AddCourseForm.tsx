import { Check, Copy, Info, Link2 } from "lucide-react";
import { Field } from "@/components/settings/Field";
import {
  type CourseDraft,
  LINK_COPY_KEY,
} from "@/components/settings/useCourseDraft";
import { AcademicYearPicker } from "@/components/ui/academic-year-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const YEARS = [1, 2, 3, 4, 5, 6];
const inputClassName = "h-11 rounded-md";

type AddCourseFormProps = { draft: CourseDraft };

export function AddCourseForm({ draft }: AddCourseFormProps) {
  const { newCourse } = draft;
  const copied = draft.copiedKey === LINK_COPY_KEY;

  return (
    <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4">
      <div className="flex items-start gap-3 rounded-md bg-muted p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Il corso sarà <Badge variant="secondary">In attesa</Badge> fino
          all'approvazione. Potrai usarlo subito, ma sarà visibile agli altri
          solo dopo la verifica.
        </p>
      </div>

      <Field label="Nome del corso">
        <Input
          value={newCourse.name}
          onChange={(event) => newCourse.setName(event.target.value)}
          placeholder="Es: Informatica - Varese"
          className={inputClassName}
        />
      </Field>

      <Field
        label="Link calendario Cineca"
        action={
          draft.previewIds.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={draft.copyLink}
              className="h-8 gap-1 rounded-full px-3 text-xs"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copiato" : "Copia"}
            </Button>
          ) : undefined
        }
      >
        <div className="relative">
          <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draft.calendarUrl}
            onChange={draft.changeCalendarUrl}
            placeholder="Incolla l'URL del calendario Cineca..."
            className={cn(inputClassName, "pl-9 text-xs")}
          />
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Anno">
          <Select
            value={newCourse.year === "" ? "" : String(newCourse.year)}
            onValueChange={(value) =>
              newCourse.setYear(value === "" ? "" : Number(value))
            }
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent className="rounded-md bg-popover">
              {YEARS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}° anno
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Anno accademico">
          <AcademicYearPicker
            value={newCourse.academicYear}
            onChange={newCourse.setAcademicYear}
            className="h-11 rounded-md text-sm"
          />
        </Field>
      </div>
    </div>
  );
}
