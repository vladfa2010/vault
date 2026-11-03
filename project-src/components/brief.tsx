"use client";

import { useReducedMotion } from "@/lib/motion";
import { PHOTOS, photoSrc } from "@/lib/photos";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

const BRIEF =
  "\u201CПроизведение живёт дольше носителя. Сохраните оригинал так, как он был задуман, — и пусть история владения останется непрерывной на десятилетия.\u201D";
const WORDS = BRIEF.split(" ");
const PHOTO = PHOTOS[3];
const SRC = photoSrc(PHOTO, 2400, 1500);

const WORDS_END = 0.28;
const GROW: [number, number] = [0.32, 0.86];

const TEXT_OUT: [number, number] = [0.4, 0.58];
const CAPTION: [number, number] = [0.84, 0.96];

const SEED_W = 200;
const SEED_H = 160;

const RADIUS = 16;

const DIM = 0.14;
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (v: number, [a, b]: [number, number]): number =>
  clamp01((v - a) / (b - a));

function Word({
  text,
  progress,
  index,
}: {
  text: string;
  progress: MotionValue<number>;
  index: number;
}): ReactNode {
  const n = WORDS.length;
  const a = (index / n) * WORDS_END;
  const b = Math.min(WORDS_END, ((index + 3) / n) * WORDS_END);
  const opacity = useTransform(
    progress,
    (v) => DIM + (1 - DIM) * span(v, [a, b])
  );
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {text}&nbsp;
    </motion.span>
  );
}

function Scene({ progress }: { progress: MotionValue<number> }): ReactNode {
  const frameRef = useRef<HTMLDivElement>(null);
  const seed = useMotionValue(0.14);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = (): void =>
      seed.set(
        Math.min(
          0.6,
          Math.max(
            0.1,
            Math.min(SEED_W / el.offsetWidth, SEED_H / el.offsetHeight)
          )
        )
      );
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [seed]);

  const grow = useTransform(progress, (v) => easeInOut(span(v, GROW)));
  const scale = useTransform(
    [grow, seed],
    ([g, s]) => (s as number) + (1 - (s as number)) * (g as number)
  );

  const radius = useTransform(scale, (s) => RADIUS / s);
  const frameOpacity = useTransform(progress, (v) => span(v, [0.02, 0.14]));
  const caption = useTransform(progress, (v) => span(v, CAPTION));
  const captionY = useTransform(caption, (c) => 12 * (1 - c));

  return (
    <motion.div
      ref={frameRef}
      style={{ scale, borderRadius: radius, opacity: frameOpacity }}
      className="absolute inset-x-3 top-[54%] bottom-3 overflow-hidden bg-muted will-change-transform sm:inset-4"
    >
      <Image
        src={SRC}
        alt="Абстрактная световая композиция — цифровое произведение из коллекции."
        fill
        sizes="100vw"
        className="object-cover"
      />

      <motion.span
        aria-hidden="true"
        style={{ opacity: caption }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent"
      />
      <motion.div
        style={{ opacity: caption, y: captionY }}
        className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10"
      >
        <p className="max-w-md font-serif text-[1.5rem] leading-[1.15] tracking-[-0.01em] text-balance sm:text-[2rem]">
          Оригинал. Без потерь. Навсегда.
        </p>
      </motion.div>
    </motion.div>
  );
}

export function Brief(): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const textOpacity = useTransform(
    scrollYProgress,
    (v) => 1 - span(v, TEXT_OUT)
  );

  const textClass =
    "mx-auto max-w-3xl text-center font-serif text-[clamp(1.75rem,3.3vw,2.75rem)] leading-[1.15] tracking-[-0.015em] text-balance text-foreground";

  if (reducedMotion) {
    return (
      <section aria-label="The brief" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <p className={textClass}>{BRIEF}</p>
          <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={SRC}
              alt="Абстрактная световая композиция — цифровое произведение из коллекции."
              fill
              sizes="100vw"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <p className="max-w-md font-serif text-[1.5rem] leading-[1.15] sm:text-[2rem]">
                Оригинал. Без потерь. Навсегда.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="The brief" className="relative h-[320svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div
          style={{ opacity: textOpacity }}
          className="mx-auto max-w-[1440px] px-4 pt-28 sm:px-6 sm:pt-32"
        >
          <p className="sr-only">{BRIEF}</p>
          <p aria-hidden="true" className={textClass}>
            {WORDS.map((w, i) => (
              <Word key={i} text={w} progress={scrollYProgress} index={i} />
            ))}
          </p>
        </motion.div>
        <Scene progress={scrollYProgress} />
      </div>
    </section>
  );
}
