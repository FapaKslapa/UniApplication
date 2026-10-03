import { ExternalLink, LogOut, ShieldAlert } from "lucide-react";
import { DesktopLine } from "@/components/settings/desktop/DesktopLine";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { Button } from "@/components/ui/button";

const REPO_URL = "https://github.com/FapaKslapa/UniApplication";

type DevPanelProps = {
  isAdmin: boolean;
  onAdmin: () => void;
  onLogoutAdmin: () => void;
};

export function DevPanel({ isAdmin, onAdmin, onLogoutAdmin }: DevPanelProps) {
  return (
    <DesktopPanel title="Sviluppo">
      <DesktopLine title="Repository GitHub" hint="FapaKslapa/UniApplication">
        <Button variant="outline" asChild>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Apri
          </a>
        </Button>
      </DesktopLine>
      <DesktopLine
        title={isAdmin ? "Esci da admin" : "Pannello admin"}
        hint={
          isAdmin
            ? "Esci dalla modalità amministratore"
            : "Gestione corsi e statistiche"
        }
      >
        <Button variant="outline" onClick={isAdmin ? onLogoutAdmin : onAdmin}>
          {isAdmin ? (
            <LogOut className="size-4" aria-hidden />
          ) : (
            <ShieldAlert className="size-4" aria-hidden />
          )}
          {isAdmin ? "Esci" : "Accedi"}
        </Button>
      </DesktopLine>
    </DesktopPanel>
  );
}
