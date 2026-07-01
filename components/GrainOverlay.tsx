"use client";

import { useEffect, useRef } from "react";

interface GrainOverlayProps {
  opacity?: number;
  blendMode?: "soft-light" | "overlay" | "screen" | "multiply";
  className?: string;
}

export function GrainOverlay({
  opacity = 0.18,
  blendMode = "soft-light",
  className = "",
}: GrainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 256,
      H = 256;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none rounded-[inherit] ${className}`}
      style={{ opacity, mixBlendMode: blendMode, imageRendering: "pixelated" }}
    />
  );
}
