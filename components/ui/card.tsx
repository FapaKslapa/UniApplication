import type * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lg bg-card py-6 text-card-foreground elevation-1",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
