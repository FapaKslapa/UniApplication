import { GraduationCap, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleSelectionButtonsProps {
  userRole: "student" | "professor";
  roleSelected: boolean;
  onSelect: (role: "student" | "professor") => void;
}

export function RoleSelectionButtons({
  userRole,
  roleSelected,
  onSelect,
}: RoleSelectionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full pt-2">
      <Button
        type="button"
        variant={userRole === "student" && roleSelected ? "default" : "outline"}
        onClick={() => onSelect("student")}
        className="flex-col h-auto gap-3 p-4 rounded-lg"
      >
        <GraduationCap className="w-8 h-8" />
        <span className="text-[10px] font-semibold">Studente</span>
      </Button>
      <Button
        type="button"
        variant={
          userRole === "professor" && roleSelected ? "default" : "outline"
        }
        onClick={() => onSelect("professor")}
        className="flex-col h-auto gap-3 p-4 rounded-lg"
      >
        <UserCircle className="w-8 h-8" />
        <span className="text-[10px] font-semibold">Docente</span>
      </Button>
    </div>
  );
}
