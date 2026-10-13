import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ChangeHistorySkeleton() {
  return (
    <div className="space-y-3" aria-busy>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-36 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-lg" />
    </div>
  );
}

export function ChangeHistoryEmpty({ hasCourses }: { hasCourses: boolean }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {hasCourses
        ? "Nessun cambio negli ultimi 14 giorni. L'orario è stabile."
        : "Scegli un corso per vedere i cambi di orario."}
    </p>
  );
}

export function ChangeHistoryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-3 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Non riesco a caricare i cambi. Controlla la connessione e riprova.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Riprova
      </Button>
    </div>
  );
}
