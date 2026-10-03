import { Building2 } from "lucide-react";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { SettingRow } from "@/components/settings/SettingRow";
import { useAppStore } from "@/lib/store";

const LOCATION_OPTIONS = [
  { value: "Varese", label: "VA", ariaLabel: "Varese" },
  { value: "Como", label: "CO", ariaLabel: "Como" },
  { value: "Tutte", label: "Tutte" },
] as const;

export function LocationSwitcher() {
  const { location, setLocation } = useAppStore();

  return (
    <SettingRow
      icon={Building2}
      title="Sede"
      subtitle="Mostra solo le lezioni di una sede"
      stackTrailing
      trailing={
        <SegmentedControl
          compact
          label="Sede"
          options={LOCATION_OPTIONS}
          value={location}
          onChange={setLocation}
        />
      }
    />
  );
}
