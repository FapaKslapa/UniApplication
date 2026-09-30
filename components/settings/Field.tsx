import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Field({ label, action, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}
