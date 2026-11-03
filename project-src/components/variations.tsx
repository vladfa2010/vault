"use client";

import { useReducedMotion } from "@/lib/motion";
import { PHOTOS, photoSrc } from "@/lib/photos";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

const PHOTO = PHOTOS[6];
const SRC = photoSrc(PHOTO, 800, 500);

const SRC_LG = photoSrc(PHOTO, 2000, 1250);

// Визуальные версии секции сейчас задаёт runtime-скрипт public/warhol.js:
// SVG-фильтры постеризуют изображение в 4 тона и раскрашивают в палитры
// в стиле Энди Уорхола (серии Мэрилин / супов Кэмпбелла). className ниже —
// legacy-фильтры, перекрываются inline-style из warhol.js. Подписи (note)
// должны соответствовать порядку палитр в warhol.js (KEPT=5 — подлинник).
const VARIATIONS: { note: string; className: string }[] = [
  { note: "Оригинал", className: "filter-none" },
  { note: "Версия «Уорхол», розовая", className: "[filter:hue-rotate(-28deg)_saturate(0.9)]" },
  { note: "Версия «Уорхол», жёлтая", className: "[filter:contrast(0.8)_brightness(1.1)]" },
  { note: "Версия «Уорхол», бирюзовая", className: "[filter:brightness(0.7)_contrast(1.08)]" },
  { note: "Версия «Уорхол», фиолетовая", className: "[filter:saturate(0.4)]" },
  { note: "Теплее", className: "[filter:sepia(0.45)_saturate(1.25)]" },
  { note: "Версия «Уорхол», красная", className: "[filter:saturate(1.6)_contrast(1.15)]" },
  {
    note: "Версия «Уорхол», синяя",
    className: "[filter:contrast(0.8)_brightness(1.18)_saturate(0.7)]",
  },
  { note: "Версия «Уорхол», лаймовая", className: "[filter:grayscale(1)_contrast(1.08)]" },
  { note: "Версия «Уорхол», оранжевая", className: "[filter:brightness(1.25)]" },
  { note: "Версия «Уорхол», лазурная", className: "[filter:contrast(0.7)_brightness(1.06)]" },
  {
    note: "Версия «Уорхол», ультрафиолетовая",
    className: "[filter:saturate(1.2)_brightness(0.82)_contrast(1.1)]",
  },
];
const KEPT = 5;

const SPLIT: [number, number] = [0.04, 0.5];
const HOLD_END = 0.6;
const KEEP: [number, number] = [HOLD_END, 0.9];

const SPREAD_WINDOW = 0.34;

const FIELD_R = 300;
const FIELD_LIFT = 0.07;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (v: number, [a, b]: [number, number]): number =>
  clamp01((v - a) / (b - a));
const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Field {
  x: MotionValue<number>;
  y: MotionValue<number>;

  on: MotionValue<number>;
}

interface TileProps {
  index: number;
  progress: MotionValue<number>;
  gridRef: RefObject<HTMLDivElement | null>;
  field: Field;
}

function Tile({ index, progress, gridRef, field }: TileProps): ReactNode {
  const ref = useRef<HTMLLIElement>(null);
  const v = VARIATIONS[index] ?? { note: "", className: "filter-none" };
  const kept = index === KEPT;

  const m = useRef({ dx: 0, dy: 0, rank: 0, fill: 1, cx: 0, cy: 0 });
  const ver = useMotionValue(0);

  const born = useTransform([progress, ver], ([p]) => {
    const start =
      SPLIT[0] + (SPLIT[1] - SPLIT[0] - SPREAD_WINDOW) * m.current.rank;
    return easeOutQuint(span(p as number, [start, start + SPREAD_WINDOW]));
  });

  const keep = useTransform(progress, (p) => easeInOut(span(p, KEEP)));

  const x = useTransform([born, keep, ver], ([b, k]) => {
    const d = m.current.dx;
    return -d * (1 - (b as number)) - (kept ? d * (k as number) : 0);
  });
  const y = useTransform([born, keep, ver], ([b, k]) => {
    const d = m.current.dy;
    return -d * (1 - (b as number)) - (kept ? d * (k as number) : 0);
  });
  const scale = useTransform([born, keep, ver], ([b, k]) => {
    const settle = 0.97 + 0.03 * (b as number);
    return kept
      ? settle + (m.current.fill - 1) * (k as number)
      : settle * (1 - 0.06 * (k as number));
  });
  const appear = useTransform(progress, (p) => span(p, [0, 0.04]));
  const opacity = useTransform([appear, keep], ([a, k]) =>
    kept ? (a as number) : (a as number) * (1 - (k as number))
  );

  const near = useTransform(
    [field.x, field.y, field.on, born, keep, ver],
    ([fx, fy, on, b, k]) => {
      if (kept) return 0;
      const d = Math.hypot(
        m.current.cx - (fx as number),
        m.current.cy - (fy as number)
      );
      const f = 1 - clamp01(d / FIELD_R);
      const soft = f * f * (3 - 2 * f);
      return soft * (on as number) * (b as number) * (1 - (k as number));
    }
  );
  const floatScale = useTransform(near, (n) => 1 + FIELD_LIFT * n);

  const zIndex = useTransform(near, (n) =>
    kept ? 20 : 12 - index + Math.round(n * 12)
  );

  useEffect(() => {
    const el = ref.current;
    const grid = gridRef.current;
    if (!el || !grid) return;

    const measure = (): void => {
      const gw = grid.clientWidth;
      const gh = grid.clientHeight;
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const cy = el.offsetTop + el.offsetHeight / 2;
      const dx = cx - gw / 2;
      const dy = cy - gh / 2;
      m.current = {
        dx,
        dy,
        cx,
        cy,

        rank: Math.hypot(dx, dy) / Math.hypot(gw / 2, gh / 2),
        fill: Math.min(gw / el.offsetWidth, gh / el.offsetHeight),
      };
      ver.set(ver.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [gridRef, ver]);

  return (
    <motion.li
      ref={ref}

      style={{ x, y, scale, opacity, zIndex }}
      className={`relative min-h-0 ${kept ? "" : "will-change-transform"}`}
    >
      <motion.div
        style={{ scale: floatScale }}
        className="relative h-full w-full"
      >
        <motion.span
          aria-hidden="true"
          style={{ opacity: near }}
          className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)]"
        />
        <figure className="relative h-full w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={kept ? SRC_LG : SRC}
            alt={
              kept
                ? `Цифровое произведение, версия «${v.note}».`
                : ""
            }
            fill
            sizes={kept ? "100vw" : "(min-width: 1024px) 25vw, 33vw"}
            className={`object-cover ${v.className}`}
          />
          <figcaption className="sr-only">{v.note}</figcaption>
        </figure>
      </motion.div>
    </motion.li>
  );
}

function Kept({
  progress,
  gridRef,
}: {
  progress: MotionValue<number>;
  gridRef: RefObject<HTMLDivElement | null>;
}): ReactNode {
  const opacity = useTransform(progress, (p) => span(p, [0.82, 0.92]));
  const y = useTransform(opacity, (o) => 10 * (1 - o));

  const width = useMotionValue("100%");
  const height = useMotionValue("100%");

  const borderRadius = useMotionValue("0.75rem");
  useEffect(() => {
    const grid = gridRef.current;
    const tile = grid?.querySelector("li");
    if (!grid || !tile) return;
    const fit = (): void => {
      const fill = Math.min(
        grid.clientWidth / tile.offsetWidth,
        grid.clientHeight / tile.offsetHeight
      );
      width.set(`${tile.offsetWidth * fill}px`);
      height.set(`${tile.offsetHeight * fill}px`);
      const figure = tile.querySelector("figure");
      if (figure) {
        const r = parseFloat(getComputedStyle(figure).borderRadius);
        borderRadius.set(`${r * fill}px`);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [gridRef, width, height, borderRadius]);
  return (
    <motion.div
      style={{ opacity, width, height, borderRadius }}
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
    >
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      <motion.p
        style={{ y }}
        className="absolute inset-x-0 bottom-0 p-6 font-serif text-[1.5rem] leading-[1.15] tracking-[-0.01em] text-white sm:p-10 sm:text-[2rem]"
      >
Подлинник один — все версии верифицированы.
      </motion.p>
    </motion.div>
  );
}

function Headline({ progress }: { progress: MotionValue<number> }): ReactNode {
  const a = useTransform(progress, (p) => 1 - span(p, [0.5, 0.58]));
  const b = useTransform(progress, (p) => span(p, [0.6, 0.7]));
  const cls =
    "font-serif text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-balance";
  return (
    <div className="relative mx-auto max-w-3xl text-center">
      <motion.h2 id="features-heading" style={{ opacity: a }} className={cls}>
        Двенадцать версий одной работы?
      </motion.h2>
      <motion.p
        aria-hidden="true"
        style={{ opacity: b }}
        className={`${cls} absolute inset-x-0 top-0`}
      >
        Подлинник остаётся один.
      </motion.p>
    </div>
  );
}

export function Variations(): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.5,
  });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawOn = useMotionValue(0);
  const field: Field = {
    x: useSpring(rawX, { stiffness: 140, damping: 22, mass: 0.6 }),
    y: useSpring(rawY, { stiffness: 140, damping: 22, mass: 0.6 }),
    on: useSpring(rawOn, { stiffness: 90, damping: 24 }),
  };
  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - r.left);
    rawY.set(e.clientY - r.top);
    rawOn.set(1);
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>): void => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    field.x.jump(e.clientX - r.left);
    field.y.jump(e.clientY - r.top);
  };

  if (reducedMotion) {
    return (
      <section
        id="features"
        aria-labelledby="features-heading"
        className="scroll-mt-20 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <h2
            id="features-heading"
            className="mx-auto max-w-3xl text-center font-serif text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-balance"
          >
            Двенадцать версий одной работы? Подлинник остаётся один.
          </h2>
          <ul className="mt-12 grid grid-cols-3 gap-3 lg:grid-cols-4">
            {VARIATIONS.map((v, i) => (
              <li
                key={v.note}
                className={`relative aspect-[4/5] overflow-hidden rounded-xl bg-muted ${
                  i === KEPT
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : ""
                }`}
              >
                <Image
                  src={SRC}
                  alt={
                    i === KEPT ? "Цифровое произведение, подлинная версия." : ""
                  }
                  fill
                  sizes="25vw"
                  className={`object-cover ${v.className}`}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      id="features"
      ref={ref}
      aria-labelledby="features-heading"
      className="relative h-[420svh] scroll-mt-0"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-28 sm:px-6 sm:pt-32">
          <Headline progress={progress} />
        </div>
        <div className="mx-auto min-h-0 w-full max-w-[1440px] flex-1 px-4 pt-10 pb-6 sm:px-6 sm:pt-12 sm:pb-8">
          <div
            ref={gridRef}
            onPointerMove={onMove}
            onPointerEnter={onEnter}
            onPointerLeave={() => rawOn.set(0)}
            className="relative h-full"
          >
            <Kept progress={progress} gridRef={gridRef} />
            <ul className="grid h-full grid-cols-3 grid-rows-4 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:grid-rows-3">
              {VARIATIONS.map((v, i) => (
                <Tile
                  key={v.note}
                  index={i}
                  progress={progress}
                  gridRef={gridRef}
                  field={field}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
