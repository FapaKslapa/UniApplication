import { Monitor, Smartphone, Tablet } from "lucide-react";

export function deviceIcon(type: string) {
  if (type === "mobile") return <Smartphone className="size-4" />;
  if (type === "tablet") return <Tablet className="size-4" />;
  return <Monitor className="size-4" />;
}
