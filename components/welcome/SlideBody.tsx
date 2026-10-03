import type { WelcomeSlide } from "@/components/welcome/slides";

type SlideBodyProps = {
  slide: WelcomeSlide;
};

export function SlideBody({ slide }: SlideBodyProps) {
  const Icon = slide.icon;

  return (
    <>
      <div className="flex size-16 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="size-7" aria-hidden />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">{slide.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {slide.description}
        </p>
      </div>

      {slide.note && (
        <p className="w-full rounded-md bg-muted px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
          {slide.note}
        </p>
      )}
    </>
  );
}
