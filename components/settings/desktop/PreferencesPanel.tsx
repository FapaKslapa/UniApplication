import { ChangeHistoryButton } from "@/components/home/ChangeHistoryButton";
import { AGENDA_MODE_OPTIONS } from "@/components/settings/agendaModeOptions";
import { DesktopLine } from "@/components/settings/desktop/DesktopLine";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";

export function PreferencesPanel() {
  const { defaultAgendaMode, setDefaultAgendaMode } = useAppStore();

  return (
    <DesktopPanel title="Preferenze">
      <DesktopLine title="Tema" hint="Passa da chiaro a scuro">
        <ThemeToggle />
      </DesktopLine>
      <DesktopLine title="Vista iniziale" hint="Come si apre l'agenda">
        <SegmentedControl
          compact
          label="Vista iniziale dell'agenda"
          options={AGENDA_MODE_OPTIONS}
          value={defaultAgendaMode}
          onChange={setDefaultAgendaMode}
        />
      </DesktopLine>
      <DesktopLine
        title="Cosa è cambiato"
        hint="Cambi di orario degli ultimi 14 giorni"
      >
        <ChangeHistoryButton />
      </DesktopLine>
    </DesktopPanel>
  );
}
