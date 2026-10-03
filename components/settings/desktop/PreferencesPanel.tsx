import { DesktopLine } from "@/components/settings/desktop/DesktopLine";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PreferencesPanel() {
  return (
    <DesktopPanel title="Preferenze">
      <DesktopLine title="Tema" hint="Passa da chiaro a scuro">
        <ThemeToggle />
      </DesktopLine>
    </DesktopPanel>
  );
}
