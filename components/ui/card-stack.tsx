"use client";

import {
  AnimatePresence,
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CardStackItem = {
  id: number | string;
  content: ReactNode;
  layerClassName?: string;
  layerStyle?: CSSProperties;
  bare?: boolean;
};

export type CardStackMode = "loop" | "dismiss";
export type CardStackIndicator = "dots" | "count" | "none";
export type CardStackControls = "hidden" | "visible";

export type CardStackLabels = {
  previous?: string;
  dismiss?: string;
  next?: string;
  position?: (current: number, total: number, item: CardStackItem) => string;
};

export type CardStackProps = {
  items: CardStackItem[];
  mode?: CardStackMode;
  hideLayers?: boolean;
  onDismiss?: (id: CardStackItem["id"]) => void;
  onEmpty?: () => void;
  offset?: number;
  scaleFactor?: number;
  visibleLayers?: number;
  cardHeight?: string;
  controls?: CardStackControls;
  indicator?: CardStackIndicator;
  labels?: CardStackLabels;
  ariaLabel?: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
};

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;
const INSTANT = { duration: 0 } as const;

const DEFAULT_LABELS = {
  previous: "Precedente",
  dismiss: "Scarta",
  next: "Successivo",
  position: (current: number, total: number) => `${current} di ${total}`,
};

type StackLayerProps = {
  depth: number;
  count: number;
  offset: number;
  scaleFactor: number;
  visibleLayers: number;
  cardHeight: string;
  hideLayers: boolean;
  reduceMotion: boolean;
  onAdvance: () => void;
  onSwipe: (direction: 1 | -1) => void;
  dismissOnSwipe: boolean;
  exitDirection: 0 | 1 | -1 | 2;
  item: CardStackItem;
  children: ReactNode;
};

const exitVariants = {
  exit: (direction: 0 | 1 | -1 | 2) =>
    direction === 0 || direction === 2
      ? { opacity: 0, transition: { duration: 0 } }
      : { x: direction * 360, rotate: direction * 14, opacity: 0 },
};

function StackLayer({
  depth,
  count,
  offset,
  scaleFactor,
  visibleLayers,
  cardHeight,
  hideLayers,
  reduceMotion,
  onAdvance,
  onSwipe,
  dismissOnSwipe,
  exitDirection,
  item,
  children,
}: StackLayerProps) {
  const isTop = depth === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const dragged = useRef(false);
  const bareTop = isTop && item.bare === true;
  const collapsed = hideLayers && depth > 0;
  const geometryDepth = collapsed ? 0 : depth;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setTimeout(() => {
      dragged.current = false;
    }, 60);
    const flicked = Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || flicked) {
      onSwipe(info.offset.x < 0 ? -1 : 1);
      if (dismissOnSwipe) return;
    }
    animate(x, 0, reduceMotion ? INSTANT : SPRING);
  };

  return (
    <motion.div
      className={cn(
        "absolute inset-x-0 top-0",
        !isTop && "pointer-events-none",
      )}
      style={{ height: cardHeight, transformOrigin: "top center" }}
      initial={false}
      variants={exitVariants}
      custom={exitDirection}
      exit="exit"
      animate={{
        top: geometryDepth * -offset,
        scale: 1 - geometryDepth * scaleFactor,
        zIndex: count - depth,
        opacity:
          depth < visibleLayers && !collapsed
            ? 1 - Math.min(depth, 3) * 0.12
            : 0,
      }}
      transition={
        reduceMotion
          ? INSTANT
          : {
              ...SPRING,
              opacity: {
                duration: collapsed ? 0.1 : 0.3,
                delay: collapsed ? 0.05 : 0,
              },
            }
      }
    >
      <motion.div
        className={cn(
          "h-full rounded-md",
          bareTop ? "overflow-visible" : "overflow-hidden bg-card elevation-1",
          depth === 1 && "pointer-events-auto cursor-pointer",
          !bareTop && item.layerClassName,
        )}
        style={{
          ...(bareTop ? undefined : item.layerStyle),
          x,
          rotate: reduceMotion ? 0 : rotate,
        }}
        drag={isTop ? "x" : false}
        dragDirectionLock
        dragElastic={0.9}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
        onClick={depth === 1 ? onAdvance : undefined}
      >
        <div
          className={cn(
            "h-full transition-opacity duration-200",
            !isTop && "opacity-0",
          )}
          aria-hidden={!isTop}
          inert={!isTop}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CardStack({
  items,
  mode = "loop",
  hideLayers = false,
  onDismiss,
  onEmpty,
  offset = 10,
  scaleFactor = 0.06,
  visibleLayers = 3,
  cardHeight = "12rem",
  controls = "hidden",
  indicator = "dots",
  labels,
  ariaLabel,
  index,
  defaultIndex = 0,
  onIndexChange,
  className,
}: CardStackProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [innerIndex, setInnerIndex] = useState(defaultIndex);
  const [dismissed, setDismissed] = useState<ReadonlySet<CardStackItem["id"]>>(
    new Set(),
  );
  const [exitDirection, setExitDirection] = useState<0 | 1 | -1>(0);
  const [collapsed, setCollapsed] = useState(false);
  const hadItems = useRef(false);
  const hadMany = useRef(false);
  const showControls = controls === "visible" || reduceMotion;

  const isDismiss = mode === "dismiss";
  const stack = isDismiss
    ? items.filter((item) => !dismissed.has(item.id))
    : items;
  const count = stack.length;

  if (items.length > 0) hadItems.current = true;
  if (items.length > 1) hadMany.current = true;
  if (!hadItems.current || collapsed) return null;
  if (count === 1 && !isDismiss && !hadMany.current) {
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-md bg-card elevation-1 [&>*]:grow",
          className,
        )}
        style={{ minHeight: cardHeight, ...stack[0]?.layerStyle }}
      >
        {stack[0]?.content}
      </div>
    );
  }

  const text = { ...DEFAULT_LABELS, ...labels };
  const current =
    count > 0 ? (((index ?? innerIndex) % count) + count) % count : 0;
  const layers = Math.max(1, Math.min(visibleLayers, count));
  const reserve = (layers - 1) * offset;
  const ordered = stack.map(
    (_, i) => stack[(i + current) % count] as CardStackItem,
  );
  const transition = reduceMotion ? INSTANT : SPRING;

  const goTo = (target: number) => {
    const normalized = ((target % count) + count) % count;
    if (index === undefined) setInnerIndex(normalized);
    onIndexChange?.(normalized);
  };
  const next = () => goTo(current + 1);
  const previous = () => goTo(current - 1);

  const discardTop = (direction: 1 | -1 = 1) => {
    const top = ordered[0];
    if (!top) return;
    setExitDirection(direction);
    setDismissed((prev) => new Set(prev).add(top.id));
    onDismiss?.(top.id);
  };

  const handleSwipe = (direction: 1 | -1) =>
    isDismiss ? discardTop(direction) : next();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (
      isDismiss &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      event.preventDefault();
      discardTop();
    }
  };

  return (
    <div className={className}>
      <motion.section
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        initial={false}
        animate={{ paddingTop: reserve }}
        transition={transition}
      >
        <div className="relative w-full" style={{ height: cardHeight }}>
          <AnimatePresence
            initial={false}
            custom={exitDirection}
            onExitComplete={() => {
              setExitDirection(0);
              if (count === 0) {
                setCollapsed(true);
                onEmpty?.();
              }
            }}
          >
            {stack.map((item) => (
              <StackLayer
                key={item.id}
                exitDirection={exitDirection}
                depth={ordered.indexOf(item)}
                count={count}
                offset={offset}
                scaleFactor={scaleFactor}
                visibleLayers={layers}
                cardHeight={cardHeight}
                hideLayers={hideLayers}
                reduceMotion={reduceMotion}
                onAdvance={next}
                onSwipe={handleSwipe}
                dismissOnSwipe={isDismiss}
                item={item}
              >
                {item.content}
              </StackLayer>
            ))}
          </AnimatePresence>
        </div>

        {showControls && (
          <div className="mt-2 flex items-center justify-between gap-2">
            {isDismiss ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => discardTop()}
              >
                <X className="size-4" aria-hidden />
                {text.dismiss}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={previous}
              >
                <ChevronLeft className="size-4" aria-hidden />
                {text.previous}
              </Button>
            )}
            {count > 1 && (
              <p
                aria-live="polite"
                className="text-center text-xs font-semibold tabular-nums text-muted-foreground"
              >
                {text.position(current + 1, count, ordered[0] as CardStackItem)}
              </p>
            )}
            {count > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={next}
              >
                {text.next}
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        )}
      </motion.section>

      {indicator !== "none" && count > 1 && (
        <div aria-hidden className="mt-2 flex h-3 items-center justify-center">
          {indicator === "dots" ? (
            <div className="flex gap-1.5">
              {stack.map((item, i) => (
                <span
                  key={item.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                    i === current
                      ? "w-4 bg-foreground/60"
                      : "w-1.5 bg-foreground/20",
                  )}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {current + 1}/{count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
