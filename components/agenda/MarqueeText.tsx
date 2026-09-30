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
    if (!containerRef.current || !textRef.current) return;
    const overflow =
      textRef.current.scrollWidth - containerRef.current.clientWidth;
    setOffset(overflow > 0 ? overflow : 0);
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
