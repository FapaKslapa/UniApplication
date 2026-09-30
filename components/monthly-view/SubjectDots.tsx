import { cn } from "@/lib/utils";

type SubjectDotsProps = {
  materie: string[];
  colorFor: (materia: string) => string;
  inverted?: boolean;
  large?: boolean;
};

export function SubjectDots({
  materie,
  colorFor,
  inverted = false,
  large = false,
}: SubjectDotsProps) {
  const shown = materie.length > 4 ? materie.slice(0, 3) : materie.slice(0, 4);
  const hasMore = materie.length > 4;
  const dot = cn("rounded-full shrink-0 size-1", large && "lg:size-1.5");

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-0.5 p-0.5 min-h-2",
        large && "lg:gap-1 lg:min-h-3",
      )}
    >
      {shown.map((m) => (
        <div
          key={m}
          className={cn(dot, inverted && "bg-background/70")}
          style={inverted ? undefined : { backgroundColor: colorFor(m) }}
        />
      ))}
      {hasMore && (
        <div
          className={cn(
            dot,
            inverted ? "bg-background/30" : "bg-muted-foreground/40",
          )}
        />
      )}
    </div>
  );
}
