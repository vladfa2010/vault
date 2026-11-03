/*
 * shader-card (React Bits, starter-реестр, @reactbits-starter/shader-card-tw)
 * — порт на ванильный ES-модуль для карточки «Коллекция» в #pricing.
 * Источник: https://pro.reactbits.dev/api/r/starter/shader-card-tw (скачан
 * лицензионным ключом владельца 2026-11-03).
 *
 * Конфигурация (владелец): speed = 0.30000000000000004, остальное — дефолты
 * реестра. Единственное осознанное отклонение: color '#2f6bff' вместо дефолтного
 * '#5227FF' — фиолетовый акцент владелец ранее вывел из бренда (решение
 * 2026-11-02, pricing-6). Палитра шейдера строится из color через OKLCH
 * (linearToOklch/oklchToLinear — дословно из исходника).
 *
 * Все шейдеры (SCENE/BLUR/DOWN/UP/COMPOSITE/EMPTY/PASS_VERTEX/VERTEX),
 * пайплайн рендера (blur → 4-уровневый bloom → composite), пружинная физика
 * tilt/hover, intro 1.6s, поверхностная детекция светлого фона (uInk) —
 * дословно из registry-исходника. React-слой (forwardRef/hooks) заменён
 * плоским объектом настроек; content() отсутствует (parallax контента не нужен).
 *
 * Вставка ПОСЛЕ гидрации + ПОСЛЕ отрисовки сетки pricing-6.js (поллинг до 12с).
 * Fallback: нет WebGL2 → карточка остаётся в прежнем виде.
 */
import * as THREE from 'three';

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const PASS_VERTEX = `
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SCENE_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uShift;
uniform vec3 uDeep;
uniform vec3 uMain;
uniform vec3 uHot;
uniform float uPositionY;
uniform float uScale;
uniform float uEffectRadius;
uniform float uEffectBoost;
uniform float uEdgeMin;
uniform float uEdgeMax;
uniform float uFalloffPower;
uniform float uNoiseScale;
uniform float uWidthFactor;
uniform float uWaveAmount;
uniform float uBranchIntensity;
uniform float uVerticalExtent;
uniform float uHorizontalExtent;
uniform float uContours;
uniform float uFlash;
uniform float uLift;
uniform float uFade;
uniform float uIntensity;

in vec2 vUv;
out vec4 fragColor;

vec3 random3(vec3 c) {
  float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
  vec3 r;
  r.z = fract(512.0 * j);
  j *= 0.125;
  r.x = fract(512.0 * j);
  j *= 0.125;
  r.y = fract(512.0 * j);
  return r - 0.5;
}

const float F3 = 0.3333333;
const float G3 = 0.1666667;

float simplex3d(vec3 p) {
  vec3 s = floor(p + dot(p, vec3(F3)));
  vec3 x = p - s + dot(s, vec3(G3));
  vec3 e = step(vec3(0.0), x - x.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 x1 = x - i1 + G3;
  vec3 x2 = x - i2 + 2.0 * G3;
  vec3 x3 = x - 1.0 + 3.0 * G3;
  vec4 w;
  vec4 d;
  w.x = dot(x, x);
  w.y = dot(x1, x1);
  w.z = dot(x2, x2);
  w.w = dot(x3, x3);
  w = max(0.6 - w, 0.0);
  d.x = dot(random3(s), x);
  d.y = dot(random3(s + i1), x1);
  d.z = dot(random3(s + i2), x2);
  d.w = dot(random3(s + 1.0), x3);
  w *= w;
  w *= w;
  d *= w;
  return dot(d, vec4(52.0));
}

const float PI = 3.14159265359;

void main() {
  float time = 28.22 + 1.25 * uTime;
  float bignessScale = 1.0 / uNoiseScale;

  vec2 uv = ((vUv * uRes + uShift) / uRes) * 2.0 - 1.0;
  float aspect = uRes.x / uRes.y;
  uv.x *= aspect;

  float effectiveScale = max(uScale, 0.5);
  uv = uv / effectiveScale;

  float yOffset = mix(-0.3, 0.8, uPositionY) + uLift / effectiveScale;
  uv.y -= yOffset;
  uv.y *= uVerticalExtent;
  uv.x *= uHorizontalExtent;

  vec2 p = (uv / aspect + 1.0) * 0.5;
  p.x *= aspect;

  vec2 positionFromCenter = uv;
  positionFromCenter /= uEffectRadius;
  positionFromCenter.x /= uWidthFactor;
  float positionFromBottom = 0.5 * (positionFromCenter.y + 1.0);

  vec2 waveOffset = vec2(0.0);
  waveOffset.x += positionFromBottom * sin(4.0 * positionFromCenter.y - 4.0 * time);
  waveOffset.x += 0.1 * positionFromBottom * sin(4.0 * positionFromCenter.x - 1.561 * time);
  waveOffset.x += uBranchIntensity * 0.15 * sin(8.0 * positionFromCenter.y + time * 2.0);
  waveOffset.x += uBranchIntensity * 0.1 * sin(12.0 * positionFromCenter.y - time * 1.5);
  waveOffset.y += uBranchIntensity * 0.08 * sin(6.0 * positionFromCenter.x + time * 1.8);
  positionFromCenter += uWaveAmount * waveOffset;

  positionFromCenter.x += positionFromCenter.x / (1.0 - positionFromCenter.y);

  float effectMask = clamp(1.0 - length(positionFromCenter), 0.0, 1.0);
  effectMask = 1.0 - pow(1.0 - effectMask, uFalloffPower);

  vec3 p3 = bignessScale * 0.25 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.1, time * 0.025);
  float noise = simplex3d(p3 * 32.0);
  noise += 0.3 * simplex3d(p3 * 64.0 + vec3(time * 0.05, time * 0.03, 0.0));
  noise += 0.15 * simplex3d(p3 * 128.0 - vec3(time * 0.08, 0.0, time * 0.04));
  noise = 0.5 + 0.5 * noise;

  float value = effectMask * noise + uEffectBoost * effectMask;
  float edge = mix(uEdgeMin, uEdgeMax, pow(clamp(0.5 * (positionFromCenter.y + 1.0), 0.0, 1.0), 1.2));
  float edgedValue = clamp(value - edge, 0.0, 1.0);
  float steppedValue = smoothstep(edge, edge + 0.1, value);
  float highlight = 1.0 - edgedValue;

  p3 = bignessScale * 0.1 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.01, time * 0.025);
  noise = 0.5 + 0.5 * simplex3d(p3 * 32.0);
  float repeatedValue = mix(highlight, noise, 0.65);
  repeatedValue = 0.5 * sin(6.0 * PI * (1.0 - pow(1.0 - repeatedValue, 1.8)) - 0.5 * PI) + 0.5;
  float steppedLines = smoothstep(0.95, 1.0, pow(repeatedValue, 8.0));
  steppedLines = mix(steppedLines, 0.0, 0.8 - noise);
  highlight = max(steppedLines * uContours, highlight);
  highlight = highlight * highlight;

  float wave = sin(time * 3.0);
  float flash = wave * wave * wave * wave * uFlash;
  float heat = clamp(steppedValue * highlight, 0.0, 1.0);
  float height = clamp(vUv.y, 0.0, 1.0);
  vec3 body = mix(uMain, uDeep, smoothstep(0.0, 0.9, height));
  vec3 emission = body * steppedValue * 0.95;
  emission += uHot * heat * (0.9 + 0.4 * flash);
  emission += vec3(1.0, 0.94, 0.98) * heat * heat * heat * (0.15 + 0.35 * flash);
  float cover = steppedValue * mix(0.55, 1.0, heat);

  float fadeStart = mix(1.05, 0.3, uFade);
  float mask = 1.0 - smoothstep(fadeStart, fadeStart + 0.4, vUv.y);
  fragColor = vec4(emission * uIntensity * mask, cover * mask);
}
`;

const BLUR_SHADER = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uDirection;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec4 sum = texture(uSource, vUv) * 0.2270270270;
  sum += texture(uSource, vUv + uDirection * 1.3846153846) * 0.3162162162;
  sum += texture(uSource, vUv - uDirection * 1.3846153846) * 0.3162162162;
  sum += texture(uSource, vUv + uDirection * 3.2307692308) * 0.0702702703;
  sum += texture(uSource, vUv - uDirection * 3.2307692308) * 0.0702702703;
  fragColor = sum;
}
`;

const DOWN_SHADER = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
in vec2 vUv;
out vec4 fragColor;
vec3 tap(vec2 d) { return texture(uSource, vUv + d * uTexel).rgb; }
void main() {
  vec3 a = tap(vec2(-2.0, 2.0));
  vec3 b = tap(vec2(0.0, 2.0));
  vec3 c = tap(vec2(2.0, 2.0));
  vec3 d = tap(vec2(-2.0, 0.0));
  vec3 e = tap(vec2(0.0, 0.0));
  vec3 f = tap(vec2(2.0, 0.0));
  vec3 g = tap(vec2(-2.0, -2.0));
  vec3 h = tap(vec2(0.0, -2.0));
  vec3 i = tap(vec2(2.0, -2.0));
  vec3 j = tap(vec2(-1.0, 1.0));
  vec3 k = tap(vec2(1.0, 1.0));
  vec3 l = tap(vec2(-1.0, -1.0));
  vec3 m = tap(vec2(1.0, -1.0));
  vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  if (uThreshold > 0.0) {
    float peak = max(color.r, max(color.g, color.b));
    float knee = 0.5;
    float soft = clamp(peak - uThreshold + knee, 0.0, 2.0 * knee);
    soft = soft * soft / (4.0 * knee + 0.00001);
    color *= max(soft, peak - uThreshold) / max(peak, 0.00001);
  }
  fragColor = vec4(color, 1.0);
}
`;

const UP_SHADER = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;
vec3 tap(vec2 d) { return texture(uSource, vUv + d * uTexel).rgb; }
void main() {
  vec3 color = tap(vec2(0.0)) * 4.0
    + (tap(vec2(-1.0, 0.0)) + tap(vec2(1.0, 0.0)) + tap(vec2(0.0, -1.0)) + tap(vec2(0.0, 1.0))) * 2.0
    + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
  fragColor = vec4(color / 16.0, 1.0);
}
`;

const COMPOSITE_SHADER = `
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomStrength;
uniform float uGrain;
uniform float uTime;
uniform float uInk;
in vec2 vUv;
out vec4 fragColor;

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec4 scene = texture(uScene, vUv);
  vec3 light = max(scene.rgb + texture(uBloom, vUv).rgb * uBloomStrength, 0.0);
  float n = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 517.0) - 0.5;
  float dither = (hash(gl_FragCoord.xy * 1.37 + 0.71) - 0.5) / 255.0;
  float peak = max(light.r, max(light.g, light.b));
  if (uInk > 0.5) {
    vec3 hue = light / max(peak, 0.0001);
    float cover = clamp(max(scene.a * 0.9, 1.0 - exp(-peak * 1.3)), 0.0, 1.0);
    vec3 ink = encode(hue * mix(0.55, 0.8, smoothstep(0.4, 1.6, peak)));
    ink += n * uGrain * 0.08 + dither;
    fragColor = vec4(clamp(ink, 0.0, 1.0) * cover, cover);
    return;
  }
  vec3 mapped = 1.0 - exp(-light * 1.35);
  vec3 color = encode(mapped);
  float alpha = max(max(color.r, max(color.g, color.b)), scene.a * 0.8);
  color += (n * uGrain * 0.08 + dither) * smoothstep(0.0, 0.1, alpha);
  color = clamp(color, 0.0, 1.0);
  fragColor = vec4(min(color, vec3(alpha)), alpha);
}
`;

const EMPTY_SHADER = `
  void main() {
    gl_FragColor = vec4(0.0);
  }
`;

const INTRO_SECONDS = 1.6;
const SCENE_SCALE = 0.5;

/* --- настройки: конфигурация владельца + дефолты реестра --- */
const S = {
  speed: 0.30000000000000004,
  playing: true,
  fragmentShader: undefined,
  color: '#2f6bff',
  highlightColor: undefined,
  positionY: 0,
  scale: 4,
  effectRadius: 0.9,
  effectBoost: 0.5,
  edgeMin: 0.0,
  edgeMax: 1,
  falloffPower: 2,
  noiseScale: 1.5,
  widthFactor: 1.5,
  waveAmount: 0.15,
  branchIntensity: 2,
  verticalExtent: 1.5,
  horizontalExtent: 1.5,
  contours: 1,
  flash: 0.6,
  blur: 4,
  intensity: 1,
  bloom: 0.8,
  grain: 0.25,
  fade: 0.6,
  interactive: true,
  tiltStrength: 8,
  parallax: 1,
  hoverRise: 1,
  intro: true,
  dpr: 2,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

function parseHex(value) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value.trim());
  if (match) {
    return [
      parseInt(match[1], 16) / 255,
      parseInt(match[2], 16) / 255,
      parseInt(match[3], 16) / 255,
    ];
  }
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(value.trim());
  if (short) {
    return [
      parseInt(short[1] + short[1], 16) / 255,
      parseInt(short[2] + short[2], 16) / 255,
      parseInt(short[3] + short[3], 16) / 255,
    ];
  }
  return null;
}

function parseRaw(value) {
  const hex = parseHex(value);
  if (hex) return hex;
  const color = new THREE.Color();
  try {
    color.setStyle(value, THREE.SRGBColorSpace);
  } catch (e) {
    color.setRGB(0, 1, 1, THREE.SRGBColorSpace);
  }
  const srgb = color.clone().convertLinearToSRGB();
  return [srgb.r, srgb.g, srgb.b];
}

const toLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function linearToOklch([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}

function oklchToLinear([L, C, h]) {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function luminanceOf(value) {
  const text = value.trim().toLowerCase();
  if (!text || text === 'transparent') return null;
  const rgba = /^rgba?\(([^)]+)\)$/.exec(text);
  if (rgba) {
    const parts = rgba[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length >= 4 && parts[3] < 0.05) return null;
    return (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255;
  }
  const oklch = /^oklch\(([^)]+)\)$/.exec(text);
  if (oklch) {
    const parts = oklch[1].split(/[\s/]+/).filter(Boolean);
    if (parts.length >= 4 && parseFloat(parts[3]) < 0.05) return null;
    const lightness = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    return Number.isFinite(lightness) ? lightness : null;
  }
  return null;
}

function spring(value, velocity, target, omega, dt) {
  const accel = omega * omega * (target - value) - 2 * omega * velocity;
  const next = velocity + accel * dt;
  return [value + next * dt, next];
}


function createShaderCard(card, host) {
  const view = window;
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  host.appendChild(canvas);

  const floatTargets =
    renderer.extensions.has('EXT_color_buffer_float') ||
    renderer.extensions.has('EXT_color_buffer_half_float');
  const targetType = floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
  );
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(geometry);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const flameUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uShift: { value: new THREE.Vector2(0, 0) },
    uDeep: { value: new THREE.Vector3(0.02, 0, 0.2) },
    uMain: { value: new THREE.Vector3(0.08, 0.02, 1) },
    uHot: { value: new THREE.Vector3(1, 0.35, 0.95) },
    uPositionY: { value: 0.1 },
    uScale: { value: 3 },
    uEffectRadius: { value: 0.9 },
    uEffectBoost: { value: 0.5 },
    uEdgeMin: { value: 0 },
    uEdgeMax: { value: 0.5 },
    uFalloffPower: { value: 2 },
    uNoiseScale: { value: 1.5 },
    uWidthFactor: { value: 0.5 },
    uWaveAmount: { value: 0.5 },
    uBranchIntensity: { value: 0.5 },
    uVerticalExtent: { value: 1.5 },
    uHorizontalExtent: { value: 1.5 },
    uContours: { value: 1 },
    uFlash: { value: 1 },
    uLift: { value: 0 },
    uFade: { value: 0 },
    uIntensity: { value: 1 },
  };
  const customUniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    uColor: { value: new THREE.Vector3(1, 0.62, 0.99) },
    uHighlight: { value: new THREE.Vector3(1, 1, 1) },
    uUseHighlight: { value: 0 },
    uPositionY: flameUniforms.uPositionY,
    uScale: flameUniforms.uScale,
    uEffectRadius: flameUniforms.uEffectRadius,
    uEffectBoost: flameUniforms.uEffectBoost,
    uEdgeMin: flameUniforms.uEdgeMin,
    uEdgeMax: flameUniforms.uEdgeMax,
    uFalloffPower: flameUniforms.uFalloffPower,
    uNoiseScale: flameUniforms.uNoiseScale,
    uWidthFactor: flameUniforms.uWidthFactor,
    uWaveAmount: flameUniforms.uWaveAmount,
    uBranchIntensity: flameUniforms.uBranchIntensity,
    uVerticalExtent: flameUniforms.uVerticalExtent,
    uHorizontalExtent: flameUniforms.uHorizontalExtent,
    uContours: flameUniforms.uContours,
    uFlash: flameUniforms.uFlash,
    uLift: flameUniforms.uLift,
    uShift: { value: new THREE.Vector2(0, 0) },
  };

  const pass = (fragmentShader, uniforms, additive = false) =>
    new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: PASS_VERTEX,
      fragmentShader,
      uniforms,
      blending: additive ? THREE.AdditiveBlending : THREE.NoBlending,
      transparent: additive,
      depthTest: false,
      depthWrite: false,
    });

  const sceneMaterial = pass(SCENE_SHADER, flameUniforms);
  const blurMaterial = pass(BLUR_SHADER, {
    uSource: { value: null },
    uDirection: { value: new THREE.Vector2() },
  });
  const downMaterial = pass(DOWN_SHADER, {
    uSource: { value: null },
    uTexel: { value: new THREE.Vector2() },
    uThreshold: { value: 0 },
  });
  const upMaterial = pass(
    UP_SHADER,
    { uSource: { value: null }, uTexel: { value: new THREE.Vector2() } },
    true,
  );
  const target = () =>
    new THREE.WebGLRenderTarget(1, 1, {
      type: targetType,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
    });
  const sceneTarget = target();
  const blurTarget = target();
  const bloomTargets = Array.from({ length: 4 }, target);
  const compositeMaterial = pass(COMPOSITE_SHADER, {
    uScene: { value: sceneTarget.texture },
    uBloom: { value: bloomTargets[0].texture },
    uBloomStrength: { value: 0.15 },
    uGrain: { value: 0.2 },
    uTime: { value: 0 },
    uInk: { value: 0 },
  });

  let customSource = S.fragmentShader || EMPTY_SHADER;
  const customMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: customSource,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: false,
    depthWrite: false,
  });

  let width = 0;
  let height = 0;
  let ratio = 0;
  let dirty = true;
  let visible = true;
  let pageVisible = view.document.visibilityState !== 'hidden';
  let frame = 0;
  let last = 0;
  let clock = 0;
  let introAge = S.intro && !S.reducedMotion ? 0 : INTRO_SECONDS;
  let hover = 0;
  let hoverVelocity = 0;
  let hoverTarget = 0;
  let tiltX = 0;
  let tiltY = 0;
  let tiltVX = 0;
  let tiltVY = 0;
  let aimX = 0;
  let aimY = 0;
  let colorKey = '';
  let light = false;
  let surfaceCheck = 0;

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const nextRatio = Math.min(view.devicePixelRatio || 1, Math.max(S.dpr, 0.5));
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === width && h === height && nextRatio === ratio) return;
    width = w;
    height = h;
    ratio = nextRatio;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    customUniforms.iResolution.value.set(width * ratio, height * ratio, 1);
    const sw = Math.max(1, Math.round(width * ratio * SCENE_SCALE));
    const sh = Math.max(1, Math.round(height * ratio * SCENE_SCALE));
    sceneTarget.setSize(sw, sh);
    blurTarget.setSize(sw, sh);
    flameUniforms.uRes.value.set(sw, sh);
    let bw = sw;
    let bh = sh;
    for (const bloomTarget of bloomTargets) {
      bw = Math.max(1, Math.round(bw / 2));
      bh = Math.max(1, Math.round(bh / 2));
      bloomTarget.setSize(bw, bh);
    }
    dirty = true;
  };

  const detectSurface = () => {
    let node = card;
    let found = null;
    while (node && found === null) {
      found = luminanceOf(view.getComputedStyle(node).backgroundColor);
      node = node.parentElement;
    }
    const next = found !== null && found > 0.55;
    if (next !== light) {
      light = next;
      colorKey = '';
    }
  };

  const syncColors = (s) => {
    const raw = parseRaw(s.color);
    customUniforms.uColor.value.set(raw[0], raw[1], raw[2]);
    if (s.highlightColor) {
      const hot = parseRaw(s.highlightColor);
      customUniforms.uHighlight.value.set(hot[0], hot[1], hot[2]);
      customUniforms.uUseHighlight.value = 1;
    } else {
      customUniforms.uUseHighlight.value = 0;
    }
    const main = [toLinear(raw[0]), toLinear(raw[1]), toLinear(raw[2])];
    const [L, C, h] = linearToOklch(main);
    const deep = oklchToLinear([L * 0.55, C * 0.9, h - 0.12]);
    let hot;
    if (s.highlightColor) {
      const raw2 = parseRaw(s.highlightColor);
      hot = [toLinear(raw2[0]), toLinear(raw2[1]), toLinear(raw2[2])];
    } else {
      hot = oklchToLinear([Math.min(L + 0.13, 0.86), C, h + 0.28]);
    }
    flameUniforms.uDeep.value.set(deep[0], deep[1], deep[2]);
    flameUniforms.uMain.value.set(main[0], main[1], main[2]);
    flameUniforms.uHot.value.set(hot[0], hot[1], hot[2]);
    compositeMaterial.uniforms.uInk.value = light ? 1 : 0;
  };

  const syncUniforms = () => {
    const s = S;
    const nextKey = `${s.color}|${s.highlightColor ?? ''}|${light ? 1 : 0}`;
    if (nextKey !== colorKey) {
      colorKey = nextKey;
      syncColors(s);
    }
    flameUniforms.uPositionY.value = s.positionY;
    flameUniforms.uScale.value = s.scale;
    flameUniforms.uEffectRadius.value = s.effectRadius;
    flameUniforms.uEffectBoost.value = s.effectBoost;
    flameUniforms.uEdgeMin.value = s.edgeMin;
    flameUniforms.uEdgeMax.value = s.edgeMax;
    flameUniforms.uFalloffPower.value = s.falloffPower;
    flameUniforms.uNoiseScale.value = s.noiseScale;
    flameUniforms.uWidthFactor.value = s.widthFactor;
    flameUniforms.uWaveAmount.value = s.waveAmount;
    flameUniforms.uBranchIntensity.value = s.branchIntensity;
    flameUniforms.uVerticalExtent.value = s.verticalExtent;
    flameUniforms.uHorizontalExtent.value = s.horizontalExtent;
    flameUniforms.uContours.value = s.contours;
    flameUniforms.uFlash.value = s.flash;
    flameUniforms.uFade.value = s.fade;
    compositeMaterial.uniforms.uGrain.value = Math.min(Math.max(s.grain, 0), 1);
    const nextSource = s.fragmentShader || EMPTY_SHADER;
    if (nextSource !== customSource) {
      customSource = nextSource;
      customMaterial.fragmentShader = nextSource;
      customMaterial.needsUpdate = true;
    }
  };

  const applyTransforms = () => {
    const s = S;
    const strength = s.tiltStrength;
    const rx = -tiltY * strength;
    const ry = tiltX * strength;
    card.style.transform =
      Math.abs(rx) + Math.abs(ry) > 0.001
        ? `perspective(900px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
        : '';
    customUniforms.uShift.value.set(tiltX * s.parallax * 10 * ratio, tiltY * s.parallax * 10 * ratio);
    flameUniforms.uShift.value.set(
      tiltX * s.parallax * 10 * ratio * SCENE_SCALE,
      tiltY * s.parallax * 10 * ratio * SCENE_SCALE,
    );
  };

  const renderGlow = () => {
    const s = S;
    mesh.material = sceneMaterial;
    renderer.setRenderTarget(sceneTarget);
    renderer.render(scene, camera);
    const spread = (Math.max(s.blur, 0) * ratio * SCENE_SCALE) / 2.2;
    if (spread > 0.05) {
      mesh.material = blurMaterial;
      blurMaterial.uniforms.uSource.value = sceneTarget.texture;
      blurMaterial.uniforms.uDirection.value.set(spread / sceneTarget.width, 0);
      renderer.setRenderTarget(blurTarget);
      renderer.render(scene, camera);
      blurMaterial.uniforms.uSource.value = blurTarget.texture;
      blurMaterial.uniforms.uDirection.value.set(0, spread / sceneTarget.height);
      renderer.setRenderTarget(sceneTarget);
      renderer.render(scene, camera);
    }
    const bloom = Math.min(Math.max(s.bloom, 0), 3) * (light ? 0.6 : 1);
    if (bloom > 0.001) {
      let source = sceneTarget;
      mesh.material = downMaterial;
      for (const bloomTarget of bloomTargets) {
        downMaterial.uniforms.uThreshold.value = source === sceneTarget ? 0.75 : 0;
        downMaterial.uniforms.uSource.value = source.texture;
        downMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);
        renderer.setRenderTarget(bloomTarget);
        renderer.render(scene, camera);
        source = bloomTarget;
      }
      mesh.material = upMaterial;
      for (let i = bloomTargets.length - 1; i > 0; i--) {
        upMaterial.uniforms.uSource.value = bloomTargets[i].texture;
        upMaterial.uniforms.uTexel.value.set(1 / bloomTargets[i].width, 1 / bloomTargets[i].height);
        renderer.setRenderTarget(bloomTargets[i - 1]);
        renderer.render(scene, camera);
      }
    }
    compositeMaterial.uniforms.uBloomStrength.value = bloom / bloomTargets.length;
    compositeMaterial.uniforms.uTime.value = clock;
    mesh.material = compositeMaterial;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
  };

  const settled = () =>
    Math.abs(tiltX - aimX) < 0.0005 &&
    Math.abs(tiltY - aimY) < 0.0005 &&
    Math.abs(tiltVX) + Math.abs(tiltVY) < 0.0005 &&
    Math.abs(hover - hoverTarget) < 0.0005 &&
    Math.abs(hoverVelocity) < 0.0005;

  const tick = (now) => {
    frame = 0;
    if (!visible || !pageVisible) return;
    const s = S;
    const dt = last && now - last < 100 ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
    last = now;
    resize();
    surfaceCheck -= dt;
    if (surfaceCheck <= 0) {
      surfaceCheck = 0.5;
      detectSurface();
    }
    syncUniforms();
    const moving = s.playing && !s.reducedMotion;
    if (moving) clock += dt * s.speed * (1 + 0.6 * hover * s.hoverRise);
    if (introAge < INTRO_SECONDS) introAge += s.reducedMotion ? INTRO_SECONDS : dt;
    const introT = Math.min(introAge / INTRO_SECONDS, 1);
    const hidden = 1 - (1 - Math.pow(1 - introT, 3));
    [hover, hoverVelocity] = spring(hover, hoverVelocity, hoverTarget, 6, dt);
    [tiltX, tiltVX] = spring(tiltX, tiltVX, aimX, 9, dt);
    [tiltY, tiltVY] = spring(tiltY, tiltVY, aimY, 9, dt);
    customUniforms.iTime.value = clock;
    flameUniforms.uTime.value = clock;
    flameUniforms.uLift.value = -hidden * 2.2 + hover * s.hoverRise * 0.35;
    flameUniforms.uIntensity.value = s.intensity * (1 + 0.18 * hover * s.hoverRise);
    applyTransforms();
    renderGlow();
    dirty = false;
    const animating = moving || introT < 1 || !settled();
    if (animating || dirty) frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!frame && visible && pageVisible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  const onMove = (event) => {
    const s = S;
    if (!s.interactive || s.reducedMotion) return;
    const rect = card.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    hoverTarget = 1;
    if (event.pointerType === 'touch') {
      wake();
      return;
    }
    aimX = Math.min(Math.max(((event.clientX - rect.left) / rect.width) * 2 - 1, -1), 1);
    aimY = Math.min(Math.max(((event.clientY - rect.top) / rect.height) * 2 - 1, -1), 1);
    wake();
  };

  const onLeave = () => {
    hoverTarget = 0;
    aimX = 0;
    aimY = 0;
    wake();
  };

  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerenter', onMove);
  card.addEventListener('pointerleave', onLeave);
  card.addEventListener('pointercancel', onLeave);

  const resizeObserver = new ResizeObserver(() => {
    dirty = true;
    wake();
  });
  resizeObserver.observe(host);

  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) wake();
    },
    { rootMargin: '120px' },
  );
  intersection.observe(card);

  const onVisibility = () => {
    pageVisible = view.document.visibilityState !== 'hidden';
    if (pageVisible) wake();
  };
  view.document.addEventListener('visibilitychange', onVisibility);

  const onLost = (event) => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const onRestored = () => {
    dirty = true;
    width = 0;
    wake();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  detectSurface();
  wake();

  return {
    replay: () => {
      if (S.reducedMotion) return;
      introAge = 0;
      wake();
    },
    destroy: () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerenter', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('pointercancel', onLeave);
      resizeObserver.disconnect();
      intersection.disconnect();
      view.document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      card.style.transform = '';
      scene.remove(mesh);
      geometry.dispose();
      sceneMaterial.dispose();
      blurMaterial.dispose();
      downMaterial.dispose();
      upMaterial.dispose();
      compositeMaterial.dispose();
      customMaterial.dispose();
      sceneTarget.dispose();
      blurTarget.dispose();
      for (const bloomTarget of bloomTargets) bloomTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === host) host.removeChild(canvas);
    },
  };
}

/* --- монтаж: ждём сетку pricing-6.js и оборачиваем популярную карточку --- */
const EXTRA_CSS = [
  '#pricing .cv-p6-card.popular.cv-p6-shader{background:#050507}',
  '#pricing .cv-p6-card.popular.cv-p6-shader .cv-p6-shader-host{position:absolute;inset:0;z-index:0}',
  '#pricing .cv-p6-card.popular.cv-p6-shader .cv-p6-shader-host::after{content:"";position:absolute;inset:0;background:linear-gradient(to top, rgba(5,5,7,0.15), rgba(5,5,7,0.5))}',
  '#pricing .cv-p6-card.popular.cv-p6-shader > :not(.cv-p6-shader-host){position:relative;z-index:1}',
  '@media (prefers-reduced-motion: reduce){#pricing .cv-p6-card.popular.cv-p6-shader{transform:none !important}}',
].join('\n');

function tryMount(attempt) {
  if (document.body.dataset.scReady) return;
  const card = document.querySelector('#pricing li.cv-p6-card.popular') || document.querySelector('#pricing .cv-p6-card.popular');
  if (!card) {
    if (attempt < 24) setTimeout(() => tryMount(attempt + 1), 500);
    return;
  }
  document.body.dataset.scReady = '1';

  const style = document.createElement('style');
  style.textContent = EXTRA_CSS;
  document.head.appendChild(style);

  const host = document.createElement('div');
  host.className = 'cv-p6-shader-host';
  host.setAttribute('aria-hidden', 'true');
  card.insertBefore(host, card.firstChild);
  card.classList.add('cv-p6-shader');

  try {
    createShaderCard(card, host);
  } catch (e) {
    /* WebGL2 недоступен — возвращаем прежний вид карточки */
    card.classList.remove('cv-p6-shader');
    if (host.parentNode === card) card.removeChild(host);
    style.remove();
  }
}

if (document.readyState === 'complete') {
  setTimeout(() => tryMount(0), 1500);
} else {
  window.addEventListener('load', () => setTimeout(() => tryMount(0), 1500));
}
