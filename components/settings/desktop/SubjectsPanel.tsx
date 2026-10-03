import { ArrowRight } from "lucide-react";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { SubjectsScreen } from "@/components/settings/SubjectsScreen";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { Button } from "@/components/ui/button";

type SubjectsPanelProps = {
  hasConfig: boolean;
  visibility: SubjectVisibility;
  showContinue: boolean;
  onContinue: () => void;
};

export function SubjectsPanel({
  hasConfig,
  visibility,
  showContinue,
  onContinue,
}: SubjectsPanelProps) {
  return (
    <DesktopPanel
      id="materie"
      title="Materie visibili"
      description="Spegni le materie che non vuoi vedere nell'orario"
    >
      {hasConfig ? (
        <div className="flex max-h-96 min-h-0 flex-col">
          <SubjectsScreen visibility={visibility} />
        </div>
      ) : (
        <p className="border-t border-border px-4 py-6 text-sm text-muted-foreground">
          Scegli prima un corso
        </p>
      )}
      {showContinue && (
        <div className="border-t border-border p-4">
          <Button size="lg" className="w-full" onClick={onContinue}>
            Vai all&apos;orario
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}
    </DesktopPanel>
  );
}
