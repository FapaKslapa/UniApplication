import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ScreenFooterProps = {
  onBack?: () => void;
  primaryLabel: string;
  primaryIcon?: ReactNode;
  onPrimary: () => void;
  primaryDisabled?: boolean;
};

export function ScreenFooter({
  onBack,
  primaryLabel,
  primaryIcon,
  onPrimary,
  primaryDisabled,
}: ScreenFooterProps) {
  return (
    <div
      className="flex shrink-0 gap-3 px-4 pt-3"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {onBack && (
        <Button
          variant="secondary"
          size="lg"
          aria-label="Indietro"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
      )}
      <Button
        size="lg"
        className="flex-1"
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryIcon}
        {primaryLabel}
      </Button>
    </div>
  );
}
