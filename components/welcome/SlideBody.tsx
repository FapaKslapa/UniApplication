import type { WelcomeSlide } from "@/components/welcome/slides";

type SlideBodyProps = {
  slide: WelcomeSlide;
};

export function SlideBody({ slide }: SlideBodyProps) {
  const Icon = slide.icon;

  return (
    <>
      <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-7 text-foreground" />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">{slide.title}</h2>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          {slide.description}
        </p>
      </div>

      {slide.bullets && (
        <ul className="w-full space-y-2 pt-1">
          {slide.bullets.map(({ icon: BulletIcon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-md bg-muted px-4 py-2.5 text-left text-sm font-medium"
            >
              <BulletIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}

      {slide.note && (
        <p className="w-full rounded-md bg-muted px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
          {slide.note}
        </p>
      )}
    </>
  );
}
