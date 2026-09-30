import { Building2 } from "lucide-react";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { SettingRow } from "@/components/settings/SettingRow";
import { useAppStore } from "@/lib/store";

const LOCATION_OPTIONS = [
  { value: "Varese", label: "VA" },
  { value: "Como", label: "CO" },
  { value: "Tutte", label: "Tutte" },
] as const;

export function LocationSwitcher() {
  const { location, setLocation } = useAppStore();

  return (
    <SettingRow
      icon={Building2}
      title="Sede"
      subtitle="Filtra lezioni per sede"
      trailing={
        <SegmentedControl
          compact
          options={LOCATION_OPTIONS}
          value={location}
          onChange={setLocation}
        />
      }
    />
  );
}
