import { Check } from "lucide-react";
import { CoursesScreen } from "@/components/settings/CoursesScreen";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { getConfigSummary } from "@/components/settings/summaries";
import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CoursesPanelProps = {
  draft: CourseDraft;
  error: string | null;
  isSetup: boolean;
  justSaved: boolean;
  onSave: () => void;
  className?: string;
};

export function CoursesPanel({
  draft,
  error,
  isSetup,
  justSaved,
  onSave,
  className,
}: CoursesPanelProps) {
  const label = justSaved ? "Salvato" : isSetup ? "Inizia" : "Salva";
  const status = justSaved
    ? "Orario aggiornato"
    : getConfigSummary(draft.selectedCourses);

  return (
    <DesktopPanel
      id="corsi"
      title="I miei corsi"
      description="Scegli corso di laurea e anno: vedrai solo le loro lezioni"
      className={cn("min-h-[28rem]", className)}
    >
      <CoursesScreen draft={draft} />
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border px-4 py-3">
        <div className="min-w-0" aria-live="polite">
          {error ? (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          ) : (
            <p
              className={cn(
                "truncate text-xs text-muted-foreground",
                justSaved && "font-semibold text-success",
              )}
            >
              {status}
            </p>
          )}
        </div>
        <Button
          size="lg"
          disabled={!draft.hasConfig}
          onClick={onSave}
          className="shrink-0 px-8"
        >
          {justSaved && <Check className="size-4" aria-hidden />}
          {label}
        </Button>
      </div>
    </DesktopPanel>
  );
}
