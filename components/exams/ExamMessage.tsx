import type { ReactNode } from "react";

type ExamMessageProps = {
  title: string;
  hint: string;
  children?: ReactNode;
};

export function ExamMessage({ title, hint, children }: ExamMessageProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-10 text-center xl:col-span-2">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
      {children && <div className="pt-3">{children}</div>}
    </div>
  );
}
