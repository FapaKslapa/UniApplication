import { cn } from "@/lib/utils";
import type { WelcomeSlide } from "./slides";

interface SlideBodyProps {
  slide: WelcomeSlide;
}

export function SlideBody({ slide }: SlideBodyProps) {
  const Icon = slide.icon;

  return (
    <>
      <div
        className={cn(
          "w-20 h-20 rounded-lg flex items-center justify-center transition-all duration-500",
          slide.bgColor,
        )}
      >
        <Icon className={cn("w-10 h-10", slide.color)} />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {slide.title}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
          {slide.description}
        </p>
      </div>

      {slide.bullets && (
        <ul className="w-full space-y-2 pt-1">
          {slide.bullets.map(({ icon: BulletIcon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-left text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-2.5 font-medium"
            >
              <BulletIcon className={cn("w-4 h-4 shrink-0", slide.color)} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}

      {slide.communityNote && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 py-3 leading-relaxed w-full text-left">
          {slide.communityNote}
        </p>
      )}
    </>
  );
}
