"use client";

import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type ReactNode } from "react";

const SPACING = 26;
const DOT_R = 1.2;

const FIELD_R = 0.78;
const FIELD_CUT = 1.2;

const EDGE_FADE = 160;

const ALPHA_LIGHT = 0.26;
const ALPHA_DARK = 0.32;

const WAVE_LENGTH = 110;
const WAVE_PERIOD = 5.5;
const WAVE_SIZE = 0.3;
const WAVE_ALPHA = 0.45;

const CURSOR_R = 170;
const CURSOR_PUSH = 14;
const CURSOR_GROW = 1.1;
const CURSOR_ALPHA = 0.4;

const FOLLOW_RATE = 9;
const PRESENCE_RATE = 5;

const INTRO_DELAY = 0.35;
const INTRO_S = 2.6;

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
const smooth = (t: number): number => t * t * (3 - 2 * t);
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

function readTheme(): { color: string; alpha: number } {
  const root = document.documentElement;
  const color =
    getComputedStyle(root).getPropertyValue("--foreground").trim() || "#000";
  const dark = root.classList.contains("dark");
  return { color, alpha: dark ? ALPHA_DARK : ALPHA_LIGHT };
}

function createField(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  reducedMotion: boolean,
  alphaScale: number
): () => void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};
  const host = canvas.parentElement as HTMLElement;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let fieldR = 1;
  let theme = readTheme();

  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let presence = 0;
  let wanted = 0;

  const fit = (): void => {
    const r = host.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    width = r.width;
    height = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    cx = width / 2;
    cy = s.top - r.top + s.height / 2;
    fieldR = FIELD_R * Math.hypot(width / 2, height / 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (t: number): void => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.color;

    const intro = reducedMotion
      ? 1
      : easeOut(clamp01((t - INTRO_DELAY) / INTRO_S));
    if (intro <= 0) return;

    const front = intro * (fieldR + 160);
    const wavePhase = (t / WAVE_PERIOD) * Math.PI * 2;
    const cursorOn = presence > 0.001;

    const x0 = cx - Math.ceil(cx / SPACING) * SPACING;
    const y0 = cy - Math.ceil(cy / SPACING) * SPACING;

    for (let gy = y0; gy <= height + SPACING; gy += SPACING) {
      for (let gx = x0; gx <= width + SPACING; gx += SPACING) {
        const dx = gx - cx;
        const dy = gy - cy;
        const r = Math.hypot(dx, dy);
        const q = r / fieldR;
        if (q > FIELD_CUT) continue;
        const fall =
          Math.exp(-3 * q * q) *
          smooth(clamp01(gy / EDGE_FADE)) *
          smooth(clamp01((height - gy) / EDGE_FADE));

        let a = theme.alpha * alphaScale * fall;
        let size = DOT_R;
        let x = gx;
        let y = gy;

        if (!reducedMotion) {
          const w = 0.5 + 0.5 * Math.sin(r / WAVE_LENGTH - wavePhase);
          a *= 1 - WAVE_ALPHA + WAVE_ALPHA * w;
          size *= 1 + WAVE_SIZE * (w - 0.5);

          a *= clamp01((front - r) / 140);

          if (cursorOn) {
            const ux = gx - px;
            const uy = gy - py;
            const d = Math.hypot(ux, uy);
            if (d < CURSOR_R) {
              const k = 1 - d / CURSOR_R;
              const f = k * k * presence;
              const push = (CURSOR_PUSH * f) / (d || 1);
              x += ux * push;
              y += uy * push;
              size *= 1 + CURSOR_GROW * f;
              a += CURSOR_ALPHA * f * (0.35 + 0.65 * fall);
            }
          }
        }

        if (a < 0.004) continue;
        ctx.globalAlpha = a > 1 ? 1 : a;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  ro.observe(stage);

  const mo = new MutationObserver(() => {
    theme = readTheme();
    if (reducedMotion) draw(0);
  });
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  if (reducedMotion) {
    draw(0);
    const ro2 = new ResizeObserver(() => draw(0));
    ro2.observe(host);
    return () => {
      ro.disconnect();
      ro2.disconnect();
      mo.disconnect();
    };
  }

  let elapsed = 0;
  let last = 0;
  let raf = 0;
  let visible = true;

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    elapsed += dt;
    const kf = 1 - Math.exp(-dt * FOLLOW_RATE);
    px += (tx - px) * kf;
    py += (ty - py) * kf;
    const kp = 1 - Math.exp(-dt * PRESENCE_RATE);
    presence += (wanted - presence) * kp;
    draw(elapsed);
  };
  const stop = (): void => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const play = (): void => {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent): void => {
    if (e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    const inside = tx >= 0 && ty >= 0 && tx <= r.width && ty <= r.height;
    if (inside && wanted === 0) {
      px = tx;
      py = ty;
    }
    wanted = inside ? 1 : 0;
  };
  const onLeave = (): void => {
    wanted = 0;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) play();
      else stop();
    },
    { rootMargin: "80px" }
  );
  io.observe(host);
  const onVis = (): void => {
    if (document.hidden) stop();
    else play();
  };
  document.addEventListener("visibilitychange", onVis);
  play();

  return () => {
    stop();
    ro.disconnect();
    mo.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    document.removeEventListener("visibilitychange", onVis);
  };
}

export function DotField({
  stageId,
  className,
  alpha = 1,
}: {
  stageId: string;
  className?: string;

  alpha?: number;
}): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = document.getElementById(stageId);
    if (!canvas || !stage) return;
    return createField(canvas, stage, reducedMotion, alpha);
  }, [stageId, reducedMotion, alpha]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
