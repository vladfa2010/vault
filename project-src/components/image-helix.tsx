"use client";

import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type ReactNode } from "react";
import {
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from "three";
import { PHOTOS, photoUrl } from "@/lib/photos";

const CARD_SHARE = 0.1;
const CARD_MIN = 84;
const CARD_MAX = 150;
const ASPECT = 0.86;

const PITCH = 0.55;

const AMP_SHARE = 0.09;
const AMP_MIN = 80;
const AMP_MAX = 140;

const TURN = 1000;

const OVERLAP = 0.5;

const OVERLAP_NARROW = -0.15;
const NARROW = 640;

const FADE_ABOVE = 200;
const FADE_ABOVE_NARROW = 120;
const FADE_INTO = 0.3;

const DEPTH = 0.1;

const TURN_S = 26;

const RADIUS = 0.1;

const EXPOSURE = 1.1;
const LIFT = 0.03;
const MAX_CARDS = 96;

const INTRO_DELAY = 0.1;
const INTRO_S = 2.6;
const STAGGER = 0.45;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number): number => t * t * (3 - 2 * t);

const emergeEase = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -9 * t) * (1 - t * 0.35);

const TEXTURE_PX = 640;

const FRAG = `
precision highp float;
uniform sampler2D uMap;
uniform vec2 uRepeat;
uniform vec2 uOffset;
uniform float uOpacity;
uniform float uRadius;
uniform float uAspect;
uniform float uExposure;
uniform float uLift;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 half_ = vec2(uAspect, 1.0) * 0.5 - uRadius;
  vec2 q = abs(p) - half_;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float aa = fwidth(d);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  vec4 c = texture2D(uMap, vUv * uRepeat + uOffset);
  vec3 rgb = clamp(c.rgb * uExposure + uLift, 0.0, 1.0);
  gl_FragColor = vec4(rgb, c.a * mask * uOpacity);
}`;

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

interface Card {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  index: number;
  lap: number;
  pending: boolean;
}

interface Shape {
  card: number;
  spacing: number;
  amp: number;
  turn: number;
  axis: number;
  span: number;
  count: number;
}

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

function createHelix(
  host: HTMLDivElement,
  stage: HTMLElement,
  reducedMotion: boolean
): () => void {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.sortObjects = true;
  const canvas = renderer.domElement;
  canvas.className = "absolute inset-0 block size-full";
  canvas.classList.add(
    "opacity-0",
    "transition-opacity",
    "duration-400",
    "ease-[ease]"
  );
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;
  const geometry = new PlaneGeometry(ASPECT, 1);
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  const loader = new TextureLoader();
  loader.setCrossOrigin("anonymous");
  const textures: (Texture | null)[] = PHOTOS.map(() => null);
  const loads = PHOTOS.map(
    (id, i) =>
      new Promise<void>((resolve) => {
        loader.load(
          photoUrl(id, TEXTURE_PX),
          (tex) => {
            tex.colorSpace = SRGBColorSpace;
            tex.minFilter = LinearMipmapLinearFilter;
            tex.generateMipmaps = true;
            tex.anisotropy = anisotropy;
            textures[i] = tex;
            resolve();
          },
          undefined,
          () => resolve()
        );
      })
  );

  const applyTexture = (card: Card, tex: Texture): void => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    const ia = img?.width && img?.height ? img.width / img.height : ASPECT;
    const repeat = new Vector2(1, 1);
    const offset = new Vector2(0, 0);
    if (ia > ASPECT) {
      repeat.x = ASPECT / ia;
      offset.x = (1 - repeat.x) / 2;
    } else {
      repeat.y = ia / ASPECT;
      offset.y = (1 - repeat.y) / 2;
    }
    const u = card.mesh.material.uniforms;
    if (u.uMap) u.uMap.value = tex;
    if (u.uRepeat) u.uRepeat.value = repeat;
    if (u.uOffset) u.uOffset.value = offset;
  };

  let serial = 0;
  const assign = (card: Card): boolean => {
    for (let k = 0; k < PHOTOS.length; k++) {
      const i = (serial + k) % PHOTOS.length;
      const tex = textures[i];
      if (!tex) continue;
      serial = i + 1;
      applyTexture(card, tex);
      return true;
    }
    return false;
  };

  const cards: Card[] = [];
  for (let i = 0; i < MAX_CARDS; i++) {
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: null },
        uRepeat: { value: new Vector2(1, 1) },
        uOffset: { value: new Vector2(0, 0) },
        uOpacity: { value: 0 },
        uRadius: { value: RADIUS },
        uAspect: { value: ASPECT },
        uExposure: { value: EXPOSURE },
        uLift: { value: LIFT },
      },
    });
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);
    cards.push({ mesh, index: i, lap: -1, pending: true });
  }

  let width = 1;
  let height = 1;
  let shape: Shape = {
    card: 80,
    spacing: 50,
    amp: 200,
    turn: 1600,
    axis: 300,
    span: 1600,
    count: 0,
  };
  const fit = (): void => {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    const stageRect = stage.getBoundingClientRect();
    height = Math.max(1, rect.height);
    const card = clamp(width * CARD_SHARE, CARD_MIN, CARD_MAX);
    const spacing = card * ASPECT * PITCH;
    const pad = card * (1 + DEPTH);
    const span = width + 2 * pad;
    const count = Math.min(MAX_CARDS, Math.ceil(span / spacing) + 1);
    const amp = clamp(width * AMP_SHARE, AMP_MIN, AMP_MAX);
    shape = {
      card,
      spacing,
      amp,
      turn: TURN,

      axis:
        stageRect.top -
        rect.top +
        stageRect.height * (width < NARROW ? OVERLAP_NARROW : OVERLAP) -
        (card * (1 + DEPTH)) / 2 -
        amp,
      span,
      count,
    };
    for (const c of cards) c.mesh.visible = c.index < count;
    const narrow = width < NARROW;
    const stageTop = stageRect.top - rect.top;
    const y0 = stageTop - (narrow ? FADE_ABOVE_NARROW : FADE_ABOVE);
    const y1 = stageTop + stageRect.height * FADE_INTO;
    const at = (f: number): string => `${y0 + (y1 - y0) * f}px`;

    const mask = `linear-gradient(to bottom, #000 ${at(0)}, rgba(0,0,0,0.9) ${at(0.25)}, rgba(0,0,0,0.5) ${at(0.5)}, rgba(0,0,0,0.1) ${at(0.75)}, transparent ${at(1)})`;
    host.style.maskImage = mask;
    host.style.webkitMaskImage = mask;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const layout = (t: number): void => {
    const { card, spacing, amp, turn, axis, span, count } = shape;
    const unfold = reducedMotion
      ? 1
      : emergeEase(clamp01((t - INTRO_DELAY) / INTRO_S));
    const flow = (t / TURN_S) * turn;
    const k = (2 * Math.PI) / turn;
    for (let i = 0; i < count; i++) {
      const c = cards[i];
      if (!c) continue;
      const raw = i * spacing + flow;
      const lap = Math.floor(raw / span);
      if (lap !== c.lap) {
        c.lap = lap;
        c.pending = !assign(c);
      } else if (c.pending) {
        c.pending = !assign(c);
      }
      const rest = raw - lap * span - span / 2;

      const far = Math.abs(rest) / (span / 2);
      const born = smooth(clamp01(unfold * (1 + STAGGER) - far * STAGGER));
      const x = rest * born;
      const theta = k * x;
      const cos = Math.cos(theta);
      const y = axis + amp * cos;
      const s = (1 + DEPTH * cos) * (0.6 + 0.4 * born);
      const { mesh } = c;

      mesh.position.set(x, height / 2 - y, x / span);
      mesh.scale.set(card * s, card * s, 1);
      const u = mesh.material.uniforms;
      if (u.uOpacity) u.uOpacity.value = c.pending ? 0 : born;
    }
  };

  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  ro.observe(stage);

  const render = (): void => renderer.render(scene, camera);
  const show = (): void => {
    canvas.classList.replace("opacity-0", "opacity-100");
  };

  function dispose(): void {
    geometry.dispose();
    for (const c of cards) c.mesh.material.dispose();
    for (const tex of textures) tex?.dispose();
    renderer.dispose();
    canvas.remove();
  }

  if (reducedMotion) {
    const still = (): void => {
      layout(TURN_S * 0.37);
      render();
    };
    still();
    show();
    const tick = window.setInterval(still, 400);
    const stopTick = window.setTimeout(() => window.clearInterval(tick), 8000);
    const ro2 = new ResizeObserver(still);
    ro2.observe(host);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stopTick);
      ro.disconnect();
      ro2.disconnect();
      dispose();
    };
  }

  let elapsed = 0;
  let last = 0;
  let raf = 0;
  let visible = true;
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    elapsed += Math.min(now - last, 100) / 1000;
    last = now;
    layout(elapsed);
    render();
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

  let started = false;
  const begin = (): void => {
    if (started) return;
    started = true;
    layout(0);
    render();
    show();
    play();
  };
  Promise.allSettled(loads.slice(0, 6)).then(begin);
  const grace = window.setTimeout(begin, 1500);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) {
        if (started) play();
      } else stop();
    },
    { rootMargin: "80px" }
  );
  io.observe(host);
  const onVis = (): void => {
    if (document.hidden) stop();
    else if (started) play();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    stop();
    window.clearTimeout(grace);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    dispose();
  };
}

export function ImageHelix({
  stageId,
  className,
}: {
  stageId: string;
  className?: string;
}): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    const stage = document.getElementById(stageId);
    if (!host || !stage) return;
    return createHelix(host, stage, reducedMotion);
  }, [stageId, reducedMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    />
  );
}
