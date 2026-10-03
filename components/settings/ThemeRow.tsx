import { Moon } from "lucide-react";
import { SettingRow } from "@/components/settings/SettingRow";
import { ThemeToggle } from "@/components/ThemeToggle";

export function ThemeRow() {
  return (
    <SettingRow
      icon={Moon}
      title="Tema"
      subtitle="Passa da chiaro a scuro"
      trailing={<ThemeToggle />}
    />
  );
}
