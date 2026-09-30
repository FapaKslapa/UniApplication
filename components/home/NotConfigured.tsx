import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotConfiguredProps = {
  onConfigure: () => void;
};

export function NotConfigured({ onConfigure }: NotConfiguredProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-8 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-xl bg-muted elevation-1 animate-in zoom-in duration-500">
        <Calendar className="size-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="max-w-xs space-y-3">
        <h2 className="text-2xl font-bold">Nessun calendario</h2>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          Configura i tuoi corsi di studi per iniziare a visualizzare l'orario
          delle lezioni.
        </p>
      </div>
      <Button size="lg" onClick={onConfigure}>
        Configura ora
      </Button>
    </div>
  );
}
