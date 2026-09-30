import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type SettingsGroupProps = {
  label: string;
  children: ReactNode;
};

export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <section>
      <h2 className="px-1 pt-5 pb-2 text-xs font-semibold text-muted-foreground">
        {label}
      </h2>
      <Card className="gap-0 overflow-hidden py-0">
        {Children.toArray(children).map((child, index) => (
          <Fragment key={isValidElement(child) ? child.key : index}>
            {index > 0 && <Separator />}
            {child}
          </Fragment>
        ))}
      </Card>
    </section>
  );
}
