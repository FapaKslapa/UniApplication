import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { it } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
        up
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {up ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: number | null;
}) {
  return (
    <div className="rounded-xl bg-card p-4 sm:p-5 elevation-1">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground leading-tight flex-1 pr-2">
          {title}
        </p>
        <div className={cn("p-2 rounded-xl shrink-0", iconColor)}>{icon}</div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-foreground mb-1">
        {value.toLocaleString("it-IT")}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-muted-foreground font-medium">
          {subtitle}
        </p>
        {trend !== undefined && <TrendBadge value={trend ?? null} />}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-card p-5 sm:p-6 elevation-2", className)}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5 sm:mb-6">
        {title}
      </p>
      {children}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded-xl", className)} />;
}

export function CustomLineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover p-3 text-popover-foreground elevation-1">
      <p className="text-[11px] text-muted-foreground mb-2">
        {label
          ? new Date(label).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
              timeZone: "Europe/Rome",
            })
          : ""}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="text-xs font-bold">{p.value.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">
            {p.name === "count"
              ? "visite"
              : p.name === "unique"
                ? "IP unici"
                : "utenti"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DatePickerButton({
  date,
  placeholder,
  open,
  onOpenChange,
  onSelect,
  disabledFn,
}: {
  date: Date | undefined;
  placeholder: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (d: Date | undefined) => void;
  disabledFn?: (date: Date) => boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="flex items-center gap-1.5 whitespace-nowrap min-w-[72px] rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-secondary-foreground"
      >
        <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" />
        {date
          ? date.toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
              timeZone: "Europe/Rome",
            })
          : placeholder}
      </button>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-popover">
          <DrawerHeader className="flex-row items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
              <CalendarDays className="size-5" />
            </div>
            <div className="text-left">
              <DrawerTitle className="text-xl">Scegli una data</DrawerTitle>
              <DrawerDescription>{placeholder}</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex justify-center px-2 pb-6">
            <Calendar
              mode="single"
              locale={it}
              selected={date}
              onSelect={(d) => {
                onSelect(d);
                onOpenChange(false);
              }}
              disabled={disabledFn}
              className="bg-transparent"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
