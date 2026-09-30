import { Moon } from "lucide-react";
import { SettingRow } from "@/components/settings/SettingRow";
import { ThemeToggle } from "@/components/ThemeToggle";

export function ThemeRow() {
  return (
    <SettingRow
      icon={Moon}
      title="Tema"
      subtitle="Chiaro / Scuro"
      trailing={<ThemeToggle />}
    />
  );
}
