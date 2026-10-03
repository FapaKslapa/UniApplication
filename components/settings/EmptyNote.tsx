import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type EmptyNoteProps = {
  children: ReactNode;
  hint?: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyNote({ children, hint, action }: EmptyNoteProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
      <p className="text-sm font-medium">{children}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-3"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
