import { Mail } from "lucide-react";
import { DesktopLine } from "@/components/settings/desktop/DesktopLine";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "stefanomarocco0@gmail.com";

export function SupportPanel() {
  return (
    <DesktopPanel title="Supporto">
      <DesktopLine title="Scrivici un suggerimento" hint={SUPPORT_EMAIL}>
        <Button variant="outline" asChild>
          <a href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail className="size-4" aria-hidden />
            Scrivi
          </a>
        </Button>
      </DesktopLine>
    </DesktopPanel>
  );
}
