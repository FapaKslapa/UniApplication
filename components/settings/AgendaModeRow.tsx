import { LayoutList } from "lucide-react";
import { AGENDA_MODE_OPTIONS } from "@/components/settings/agendaModeOptions";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { SettingRow } from "@/components/settings/SettingRow";
import { useAppStore } from "@/lib/store";

export function AgendaModeRow() {
  const { defaultAgendaMode, setDefaultAgendaMode } = useAppStore();

  return (
    <SettingRow
      icon={LayoutList}
      title="Vista iniziale"
      subtitle="Come si apre l'agenda"
      stackTrailing
      trailing={
        <SegmentedControl
          compact
          label="Vista iniziale dell'agenda"
          options={AGENDA_MODE_OPTIONS}
          value={defaultAgendaMode}
          onChange={setDefaultAgendaMode}
        />
      }
    />
  );
}
