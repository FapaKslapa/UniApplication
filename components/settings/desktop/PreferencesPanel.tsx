import { DesktopLine } from "@/components/settings/desktop/DesktopLine";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";

const LOCATION_OPTIONS = [
  { value: "Varese", label: "Varese" },
  { value: "Como", label: "Como" },
  { value: "Tutte", label: "Tutte" },
] as const;

export function PreferencesPanel() {
  const { location, setLocation } = useAppStore();

  return (
    <DesktopPanel title="Preferenze">
      <DesktopLine title="Tema" hint="Passa da chiaro a scuro">
        <ThemeToggle />
      </DesktopLine>
      <DesktopLine title="Sede" hint="Mostra solo le lezioni di una sede">
        <SegmentedControl
          compact
          label="Sede"
          options={LOCATION_OPTIONS}
          value={location}
          onChange={setLocation}
        />
      </DesktopLine>
    </DesktopPanel>
  );
}
