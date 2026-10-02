import { it } from "date-fns/locale";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
        up
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400",
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 leading-tight flex-1 pr-2">
          {title}
        </p>
        <div className={cn("p-2 rounded-xl shrink-0", iconColor)}>{icon}</div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-1">
        {value.toLocaleString("it-IT")}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[10px] text-zinc-400 font-medium">{subtitle}</p>
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
    <div
      className={cn(
        "bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-5 sm:p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-5 sm:mb-6">
        {title}
      </p>
      {children}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-zinc-200/40 dark:bg-zinc-800/40 animate-pulse rounded-[2rem]",
        className,
      )}
    />
  );
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
      <p className="text-[10px] font-mono text-zinc-400 mb-2">
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
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            {p.value.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-400">
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
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors whitespace-nowrap min-w-[72px]"
        >
          <CalendarDays className="w-3 h-3 text-zinc-400 shrink-0" />
          {date
            ? date.toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
                timeZone: "Europe/Rome",
              })
            : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onSelect(d);
            onOpenChange(false);
          }}
          disabled={disabledFn}
          locale={it}
          className="font-mono"
        />
      </PopoverContent>
    </Popover>
  );
}
