import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
} as const;

export type IconTone = keyof typeof TONES;

type IconTileProps = {
  icon: (props: { className?: string }) => React.ReactNode;
  tone?: IconTone;
  small?: boolean;
};

export function IconTile({
  icon: Icon,
  tone = "neutral",
  small = false,
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        small ? "size-8 rounded-sm" : "size-10 rounded-md",
        TONES[tone],
      )}
    >
      <Icon className={small ? "size-3.5" : "size-4"} />
    </div>
  );
}
