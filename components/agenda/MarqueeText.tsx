"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MarqueeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const label = textRef.current;
    if (!container || !label) return;
    const measure = () => {
      const overflow = label.scrollWidth - container.clientWidth;
      setOffset(overflow > 0 ? overflow : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(label);
    return () => observer.disconnect();
  }, []);

  const style =
    offset > 0
      ? ({
          animation: "marquee-text 7s ease-in-out infinite",
          "--marquee-offset": `-${offset}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div ref={containerRef} className="overflow-hidden w-full">
      <span
        ref={textRef}
        className={cn("inline-block whitespace-nowrap", className)}
        style={style}
      >
        {text}
      </span>
    </div>
  );
}
