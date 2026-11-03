/* CIFRA Vault — настоящий порт React Bits Pro «Features 15»
   (three.js WebGL2 сонар-плита: пинги расходятся из центра и подсвечивают находки;
   рендерится глиф-матрицей « ·+×○◎◉» с блумом и зерном).
   Установлен на блок «Передача работы новому владельцу» (карточка в #benchmarks).
   Вставка ПОСЛЕ гидрации (паттерн nav7/magic-link). ES-модуль: three из importmap. */
import * as THREE from 'three';

const FINDINGS = [
  {
    label: 'CIFRA Vault — передача за',
    value: '5 мин',
    detail: 'Сертификат и файлы у нового владельца сразу после подтверждения сделки.',
    reach: -0.75,
    lift: 0.2,
  },
  {
    label: 'Почта и мессенджеры —',
    value: '2 ч',
    detail: 'Архив уходит письмом: без гарантий доставки и фиксации происхождения.',
    reach: -0.25,
    lift: -0.42,
  },
  {
    label: 'Курьер с диском —',
    value: '2 дня',
    detail: 'Физический носитель в пути: каждый день — риск повреждения и потери.',
    reach: 0.25,
    lift: 0.36,
  },
  {
    label: 'Международная логистика —',
    value: '3 нед',
    detail: 'Таможня и страхование: произведение неделями остаётся вне контроля.',
    reach: 0.75,
    lift: -0.16,
  },
];

const ACCENT = '#ff3b2f';
const ACCENT_INK = '#d7261b';
const CHARSET = ' ·+×○◎◉';
const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
const PINGS = 12;
const ATLAS_COLUMNS = 16;
const INTERVAL = 3.6;
const WAVE_SPEED = 0.17;
const CONTACT_RADIUS = 0.27;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const toLinear = (value) => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));

const toOklab = ([r, g, b]) => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const passVertex = `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fieldFragment = `
precision highp float;
uniform vec2 uCell;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScale;
uniform vec2 uDrift;
uniform float uThreshold;
uniform float uAmbient;
uniform float uReveal;
uniform float uPersistence;
uniform float uWidth;
uniform float uFalloff;
uniform vec4 uPings[12];
uniform vec4 uPingShape[12];
uniform vec2 uBand;
out vec4 fragColor;

float hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * noise3(p);
    p = p * 2.03 + vec3(17.1, 3.7, 1.3);
    amplitude *= 0.5;
  }
  return sum / 0.9375;
}

void main() {
  vec2 center = gl_FragCoord.xy * uCell;
  float speck = hash2(floor(gl_FragCoord.xy) + 17.0);
  float crest = 0.0;
  float tail = 0.0;
  float echo = 0.0;
  for (int k = 0; k < 12; k++) {
    vec4 ping = uPings[k];
    if (ping.w <= 0.0) continue;
    vec4 shape = uPingShape[k];
    float age = uTime - ping.z;
    if (age < 0.0) continue;
    vec2 rel = center - ping.xy;
    float dist = length(rel);
    if (dist > shape.y) continue;
    float radius = age * shape.x;
    float lag = radius - dist;
    if (lag < -uWidth * 3.0) continue;
    float fade = ping.w * (1.0 - smoothstep(shape.y * 0.45, shape.y, dist)) * smoothstep(0.0, shape.w, radius);
    float width = lag < 0.0 ? uWidth * 0.6 : uWidth;
    float x = lag / width;
    float front = exp(-x * x * x * x);
    float after = lag > 0.0 ? exp(-lag / max(shape.x * uPersistence, 1.0)) : 0.0;
    if (shape.z > 0.5) {
      echo += front * fade;
    } else {
      crest += front * fade;
      tail += after * (1.0 - front) * fade;
    }
  }
  crest = min(crest, 1.2);
  tail = min(tail, 1.0);
  echo = min(echo, 1.2);
  float band = 1.0 - smoothstep(uBand.y * 0.55, uBand.y, abs(center.y - uBand.x));
  float grid = uAmbient * (0.75 + 0.25 * speck);
  float value = (grid + crest * 0.62 + tail * 0.12 + echo * 0.7) * band;
  float accent = echo * band;
  value = clamp(value, 0.0, 1.0);
  float tone = clamp(0.2 + crest * 0.8 + tail * 0.2, 0.0, 1.0);
  fragColor = vec4(value, tone, clamp(accent, 0.0, 1.0), 1.0);
}
`;

const glyphFragment = `
precision highp float;
uniform sampler2D uField;
uniform sampler2D uAtlas;
uniform vec2 uAtlasGrid;
uniform float uCount;
uniform vec2 uCell;
uniform float uSpan;
uniform float uGamma;
uniform float uDither;
uniform float uInk;
uniform vec3 uLabA;
uniform vec3 uLabB;
uniform vec3 uAccent;
uniform vec4 uContacts[4];
out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 labToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return max(vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ), 0.0);
}

float glyphCoverage(float index, vec2 g) {
  vec2 f = fract(g) - 0.5;
  vec2 texel = vec2(0.5 + f.x * uSpan, 0.5 - f.y * uSpan);
  float inside = step(0.0, texel.x) * step(texel.x, 1.0) * step(0.0, texel.y) * step(texel.y, 1.0);
  vec2 slot = vec2(mod(index, uAtlasGrid.x), floor(index / uAtlasGrid.x));
  vec2 uv = (slot + clamp(texel, 0.0, 1.0)) / uAtlasGrid;
  vec2 scale = vec2(uSpan) / uAtlasGrid;
  return textureGrad(uAtlas, uv, dFdx(g) * scale, dFdy(g) * scale).r * inside;
}

vec3 palette(float t) {
  vec3 deep = vec3(uLabA.x * 0.55, uLabA.yz * 0.85);
  vec3 top = uInk > 0.5
    ? vec3(uLabB.x * 0.72, uLabB.yz * 1.05)
    : vec3(min(uLabB.x * 1.08 + 0.05, 0.99), uLabB.yz * 0.35);
  vec3 lab = t < 0.45 ? mix(deep, uLabA, smoothstep(0.0, 0.45, t))
    : t < 0.85 ? mix(uLabA, uLabB, smoothstep(0.45, 0.85, t))
    : mix(uLabB, top, smoothstep(0.85, 1.0, t));
  return labToLinear(lab);
}

void main() {
  vec2 g = gl_FragCoord.xy / uCell;
  vec2 cellId = floor(g);
  vec4 field = texelFetch(uField, ivec2(cellId), 0);
  float dither = hash(cellId) - 0.5;
  float value = clamp(field.r + dither * uDither * step(0.015, field.r), 0.0, 1.0);
  float level = pow(value, uGamma);
  float index = floor(level * (uCount - 1.0) + 0.5);
  float energy = 0.0;
  vec3 color = vec3(0.0);
  if (index >= 1.0) {
    float cover = glyphCoverage(index, g);
    color = mix(palette(clamp(field.g, 0.0, 1.0)), uAccent, clamp(field.b, 0.0, 1.0));
    energy = cover * (0.16 + 0.95 * level);
  }
  vec3 light = color * energy;
  for (int c = 0; c < 4; c++) {
    vec4 contact = uContacts[c];
    vec2 delta = gl_FragCoord.xy - contact.xy;
    if (max(abs(delta.x), abs(delta.y)) > uCell.x * 0.65) continue;
    float distance = length(delta);
    float radius = uCell.x * 0.27;
    float stroke = max(uCell.x * 0.045, 0.5);
    float ring = 1.0 - smoothstep(stroke - 0.5, stroke + 0.5, abs(distance - radius));
    float clear = 1.0 - smoothstep(radius + stroke + 0.5, radius + stroke + 1.5, distance);
    float marker = ring * (0.7 + 0.4 * contact.z);
    light = light * (1.0 - clear) + mix(palette(1.0), uAccent, clamp(contact.z, 0.0, 1.0)) * marker;
    energy = energy * (1.0 - clear) + marker;
  }
  fragColor = vec4(light, energy);
}
`;

const downFragment = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  vec4 b = texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  vec4 d = texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  fragColor = (a + b + c + d) * 0.125 + texture(uSource, vUv) * 0.5;
}
`;

const upFragment = `
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 sum = texture(uSource, vUv) * 4.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, -1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, 1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  fragColor = texture(uBase, vUv) + sum / 16.0;
}
`;

const compositeFragment = `
precision highp float;
uniform sampler2D uLines;
uniform sampler2D uBloom;
uniform vec3 uBackground;
uniform float uGlow;
uniform float uExposure;
uniform float uMode;
uniform float uGrain;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec4 lines = texture(uLines, vUv);
  vec4 bloom = texture(uBloom, vUv);
  vec3 color;
  if (uMode < 0.5) {
    vec3 light = (lines.rgb + bloom.rgb * uGlow) * uExposure;
    vec3 exposed = 1.0 - exp(-light);
    float peak = max(exposed.r, max(exposed.g, exposed.b));
    exposed = mix(exposed, vec3(peak), smoothstep(0.75, 1.0, peak) * 0.35);
    color = uBackground + (1.0 - uBackground) * exposed;
  } else {
    float energy = lines.a + bloom.a * uGlow * 0.2;
    vec3 hue = (lines.rgb + bloom.rgb * uGlow * 0.2) / max(energy, 1e-4);
    float cover = clamp(1.0 - exp(-energy * uExposure * 1.4), 0.0, 0.95);
    color = mix(uBackground, clamp(hue * 0.85, 0.0, 1.0), cover);
  }
  float grain = hash(gl_FragCoord.xy + uGrain * 311.0) - 0.5;
  fragColor = vec4(encode(color) + grain * (1.2 / 255.0), 1.0);
}
`;

const drawShape = (context, character, x, y, size, line) => {
  const r = (k) => k * size;
  const ring = (radius) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
  };
  const disc = (radius) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  };
  const diamond = (half) => {
    context.beginPath();
    context.moveTo(x, y - half);
    context.lineTo(x + half, y);
    context.lineTo(x, y + half);
    context.lineTo(x - half, y);
    context.closePath();
  };
  const triangle = (half) => {
    context.beginPath();
    context.moveTo(x, y - half);
    context.lineTo(x + half * 0.92, y + half * 0.6);
    context.lineTo(x - half * 0.92, y + half * 0.6);
    context.closePath();
  };
  context.lineWidth = line;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  switch (character) {
    case '·':
      disc(Math.max(r(0.065), line * 0.8));
      return true;
    case '•':
      disc(r(0.13));
      return true;
    case '●':
      disc(r(0.25));
      return true;
    case '+':
      context.beginPath();
      context.moveTo(x - r(0.2), y);
      context.lineTo(x + r(0.2), y);
      context.moveTo(x, y - r(0.2));
      context.lineTo(x, y + r(0.2));
      context.stroke();
      return true;
    case '×':
      context.beginPath();
      context.moveTo(x - r(0.16), y - r(0.16));
      context.lineTo(x + r(0.16), y + r(0.16));
      context.moveTo(x + r(0.16), y - r(0.16));
      context.lineTo(x - r(0.16), y + r(0.16));
      context.stroke();
      return true;
    case '○':
      ring(r(0.26));
      return true;
    case '□':
      context.beginPath();
      context.rect(x - r(0.23), y - r(0.23), r(0.46), r(0.46));
      context.stroke();
      return true;
    case '■':
      context.fillRect(x - r(0.21), y - r(0.21), r(0.42), r(0.42));
      return true;
    case '◇':
      diamond(r(0.3));
      context.stroke();
      return true;
    case '◆':
      diamond(r(0.28));
      context.fill();
      return true;
    case '△':
      triangle(r(0.3));
      context.stroke();
      return true;
    case '▲':
      triangle(r(0.28));
      context.fill();
      return true;
    case '◎':
      ring(r(0.28));
      disc(r(0.085));
      return true;
    case '◉':
      ring(r(0.28));
      disc(r(0.15));
      return true;
    default:
      return false;
  }
};

const buildAtlas = (doc, charset, fontFamily, cell, weight) => {
  const ramp = Array.from(new Set(Array.from(charset))).slice(0, 180);
  if (!ramp.includes(' ')) ramp.unshift(' ');
  if (ramp.length < 2) ramp.push('·');
  const line = Math.max(1, Math.round(cell * 0.075 * weight));
  const offset = line % 2 === 1 ? 0.5 : 0;
  const font = `500 ${Math.round(cell * 0.78)}px ${fontFamily}`;
  const paint = (context, character, x, y) => {
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#ffffff';
    if (drawShape(context, character, x + offset, y + offset, cell, line)) return;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = font;
    context.fillText(character, x, y + cell * 0.04);
  };
  const measure = doc.createElement('canvas');
  measure.width = cell;
  measure.height = cell;
  const probe = measure.getContext('2d', { willReadFrequently: true });
  const weightOf = (character) => {
    if (!probe || character === ' ') return 0;
    probe.fillStyle = '#000000';
    probe.fillRect(0, 0, cell, cell);
    paint(probe, character, Math.floor(cell / 2), Math.floor(cell / 2));
    const data = probe.getImageData(0, 0, cell, cell).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += data[i];
    return sum;
  };
  const list = ramp
    .map((character) => ({ character, ink: weightOf(character) }))
    .sort((a, b) => a.ink - b.ink)
    .map((item) => item.character);
  const rows = Math.ceil(list.length / ATLAS_COLUMNS);
  const canvas = doc.createElement('canvas');
  canvas.width = ATLAS_COLUMNS * cell;
  canvas.height = rows * cell;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    list.forEach((character, index) => {
      if (character === ' ') return;
      const x = (index % ATLAS_COLUMNS) * cell + Math.floor(cell / 2);
      const y = Math.floor(index / ATLAS_COLUMNS) * cell + Math.floor(cell / 2);
      paint(context, character, x, y);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.NoColorSpace;
  texture.flipY = false;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return { texture, count: list.length, rows };
};

function createSonar(root, band, cards) {
  const doc = root.ownerDocument;
  const view = doc.defaultView ?? window;
  const canvas = doc.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;z-index:0;width:100%;height:100%;display:block;pointer-events:none';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  if (!renderer.capabilities.isWebGL2) {
    renderer.dispose();
    return null;
  }
  root.prepend(canvas);
  renderer.autoClear = false;
  const texelType =
    renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float')
      ? THREE.HalfFloatType
      : THREE.UnsignedByteType;

  const motionQuery = view.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const plane = new THREE.PlaneGeometry(2, 2);
  const pingSlots = Array.from({ length: PINGS }, () => new THREE.Vector4(0, 0, 0, 0));
  const pingShapes = Array.from({ length: PINGS }, () => new THREE.Vector4(1, 1, 0, 0));
  const contactSlots = Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, 0));
  const pings = Array.from({ length: PINGS }, () => ({
    active: false,
    echo: false,
    x: 0,
    y: 0,
    born: 0,
    amplitude: 0,
    hit: FINDINGS.map(() => false),
  }));
  const glow = FINDINGS.map(() => 0);

  const pass = (fragmentShader, uniforms) =>
    new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms,
      vertexShader: passVertex,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });

  const fieldMaterial = pass(fieldFragment, {
    uCell: { value: new THREE.Vector2(11, 11) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uScale: { value: 1.2 },
    uDrift: { value: new THREE.Vector2(0.026, -0.009) },
    uThreshold: { value: 0.57 },
    uAmbient: { value: 0.16 },
    uReveal: { value: 0.5 },
    uPersistence: { value: 0.35 },
    uWidth: { value: 8 },
    uFalloff: { value: 300 },
    uPings: { value: pingSlots },
    uPingShape: { value: pingShapes },
    uBand: { value: new THREE.Vector2(0, 100) },
  });
  const glyphMaterial = pass(glyphFragment, {
    uField: { value: null },
    uAtlas: { value: null },
    uAtlasGrid: { value: new THREE.Vector2(ATLAS_COLUMNS, 1) },
    uCount: { value: 2 },
    uCell: { value: new THREE.Vector2(11, 11) },
    uSpan: { value: 1 },
    uGamma: { value: 0.9 },
    uDither: { value: 0.05 },
    uInk: { value: 0 },
    uLabA: { value: new THREE.Vector3(...toOklab([0.42, 0.42, 0.42])) },
    uLabB: { value: new THREE.Vector3(...toOklab([0.93, 0.93, 0.93])) },
    uAccent: { value: new THREE.Vector3() },
    uContacts: { value: contactSlots },
  });
  const downMaterial = pass(downFragment, { uSource: { value: null }, uTexel: { value: new THREE.Vector2() } });
  const upMaterial = pass(upFragment, {
    uSource: { value: null },
    uBase: { value: null },
    uTexel: { value: new THREE.Vector2() },
  });
  const compositeMaterial = pass(compositeFragment, {
    uLines: { value: null },
    uBloom: { value: null },
    uBackground: { value: new THREE.Vector3() },
    uGlow: { value: 0.18 },
    uExposure: { value: 1.25 },
    uMode: { value: 0 },
    uGrain: { value: 0 },
  });
  const quad = new THREE.Mesh(plane, compositeMaterial);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  const target = (w, h) =>
    new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
      type: texelType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
  let lineTarget = null;
  let downTargets = [];
  let upTargets = [];
  let fieldTarget = null;
  let fieldKey = '';
  let atlas = null;
  let atlasKey = '';

  const probe = doc.createElement('canvas').getContext('2d', { willReadFrequently: true });
  let colorKey = '';
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let clock = 0;
  let nextPing = 0;
  let grain = 0;
  let bandCenter = 0;
  let bandHalf = 100;
  const contacts = FINDINGS.map(() => ({ x: 0, y: 0 }));
  let raf = 0;
  let last = 0;
  let visible = false;
  let destroyed = false;
  let lost = false;
  let layoutDirty = false;

  const release = () => {
    if (lineTarget) lineTarget.dispose();
    downTargets.forEach((item) => item.dispose());
    upTargets.forEach((item) => item.dispose());
    lineTarget = null;
    downTargets = [];
    upTargets = [];
  };

  const draw = (material, output) => {
    quad.material = material;
    renderer.setRenderTarget(output);
    renderer.render(quadScene, camera);
  };

  const glyphPixels = () => 11 * clamp(Math.min(width, height) / 520, 0.75, 1) * pixelRatio;
  const diagonal = () => Math.hypot(width, Math.min(height, (bandHalf * 2.4) / pixelRatio)) * pixelRatio;

  const ensureAtlas = () => {
    const cell = Math.round(clamp(glyphPixels(), 8, 96));
    const key = String(cell);
    if (key === atlasKey && atlas) return;
    atlasKey = key;
    if (atlas) atlas.texture.dispose();
    atlas = buildAtlas(doc, CHARSET, FONT, cell, 1);
    glyphMaterial.uniforms.uAtlas.value = atlas.texture;
    glyphMaterial.uniforms.uAtlasGrid.value.set(ATLAS_COLUMNS, atlas.rows);
    glyphMaterial.uniforms.uCount.value = atlas.count;
  };

  const ensureField = () => {
    const cell = glyphPixels();
    const cols = Math.ceil((width * pixelRatio) / cell);
    const rows = Math.ceil((height * pixelRatio) / cell);
    const key = `${cols}|${rows}`;
    if (key === fieldKey && fieldTarget) return;
    fieldKey = key;
    if (fieldTarget) fieldTarget.dispose();
    fieldTarget = new THREE.WebGLRenderTarget(cols, rows, {
      type: texelType,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
  };

  const syncColors = () => {
    if (!probe) return false;
    let node = root;
    let fill = 'rgba(0, 0, 0, 0)';
    while (node) {
      const value = view.getComputedStyle(node).backgroundColor;
      if (!/rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(value)) {
        fill = value;
        break;
      }
      node = node.parentElement;
    }
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = '#0a0a0a';
    probe.fillStyle = fill;
    probe.fillRect(0, 0, 1, 1);
    const data = probe.getImageData(0, 0, 1, 1).data;
    const r = data[0], g = data[1], b = data[2];
    const key = `${r},${g},${b}`;
    if (key === colorKey) return false;
    colorKey = key;
    const ink = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) > 0.5;
    compositeMaterial.uniforms.uBackground.value.set(toLinear(r / 255), toLinear(g / 255), toLinear(b / 255));
    compositeMaterial.uniforms.uMode.value = ink ? 1 : 0;
    compositeMaterial.uniforms.uExposure.value = ink ? 4 : 1.25;
    glyphMaterial.uniforms.uInk.value = ink ? 1 : 0;
    const accent = hexToRgb(ink ? ACCENT_INK : ACCENT).map(toLinear);
    glyphMaterial.uniforms.uAccent.value.set(...accent);
    return true;
  };

  const spawn = (x, y, amplitude, echo = false, at = clock) => {
    let slot = pings.findIndex((item) => !item.active);
    if (slot < 0) {
      slot = 0;
      for (let k = 1; k < PINGS; k++) if (pings[k].born < pings[slot].born) slot = k;
    }
    Object.assign(pings[slot], { active: true, echo, x, y, born: at, amplitude, hit: FINDINGS.map(() => false) });
  };

  const measure = () => {
    const rect = root.getBoundingClientRect();
    const area = band.getBoundingClientRect();
    const boxes = cards.map((card) => (card ? card.getBoundingClientRect() : null));
    bandCenter = (rect.bottom - (area.top + area.height / 2)) * pixelRatio;
    bandHalf = (area.height / 2) * pixelRatio;
    const measured = boxes.map((box, index) => {
      if (!box || box.width === 0) return FINDINGS[index].reach;
      return (box.left + box.width / 2 - rect.left - rect.width / 2) / Math.max(rect.width / 2, 1);
    });
    const stacked = Math.max(...measured) - Math.min(...measured) < 0.2;
    const reaches = stacked ? FINDINGS.map((finding) => finding.reach * 0.8) : measured;
    reaches.forEach((reach, index) => {
      const x = (rect.width / 2) * (1 + reach) * pixelRatio;
      const y = bandCenter + FINDINGS[index].lift * bandHalf * 0.78;
      contacts[index] = { x, y };
      const card = cards[index];
      const box = boxes[index];
      if (!card || !box) return;
      const top = (box.top - rect.top) * pixelRatio;
      const contactTop = rect.height * pixelRatio - y;
      card.style.setProperty('--lead', `${Math.max((top - contactTop - glyphPixels() * CONTACT_RADIUS) / pixelRatio, 0)}px`);
    });
    layoutDirty = false;
  };

  const apply = () => {
    const w = width * pixelRatio;
    const diag = diagonal();
    const cell = glyphPixels();
    const field = fieldMaterial.uniforms;
    field.uCell.value.set(cell, cell);
    field.uResolution.value.set(w, height * pixelRatio);
    field.uTime.value = clock;
    field.uWidth.value = Math.max(1, cell * 0.8);
    field.uFalloff.value = 0.25 * diag;
    field.uBand.value.set(bandCenter, bandHalf);
    pings.forEach((ping, k) => {
      if (!ping.active) {
        pingSlots[k].set(0, 0, 0, 0);
        return;
      }
      pingSlots[k].set(ping.x, ping.y, ping.born, ping.amplitude);
      pingShapes[k].set(
        WAVE_SPEED * diag * (ping.echo ? 0.55 : 1),
        ping.echo ? Math.min(0.17 * diag, 230 * pixelRatio) : 0.75 * diag,
        ping.echo ? 1 : 0,
        Math.max(1, (ping.echo ? 0.004 : 0.06) * diag),
      );
    });
    contacts.forEach((contact, index) => contactSlots[index].set(contact.x, contact.y, glow[index], 0));
    const glyph = glyphMaterial.uniforms;
    glyph.uField.value = fieldTarget ? fieldTarget.texture : null;
    glyph.uCell.value.set(cell, cell);
    glyph.uSpan.value = 1;
    glyph.uDither.value = 0.12 / Math.sqrt(Math.max((atlas ? atlas.count : 8) / 8, 1));
    compositeMaterial.uniforms.uGrain.value = grain;
  };

  const render = () => {
    if (!lineTarget || !downTargets.length) return;
    if (layoutDirty) measure();
    ensureAtlas();
    ensureField();
    apply();
    if (fieldTarget) draw(fieldMaterial, fieldTarget);
    draw(glyphMaterial, lineTarget);
    let source = lineTarget;
    for (const item of downTargets) {
      downMaterial.uniforms.uSource.value = source.texture;
      downMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);
      draw(downMaterial, item);
      source = item;
    }
    let accumulated = downTargets[downTargets.length - 1];
    for (let k = downTargets.length - 2; k >= 0; k--) {
      upMaterial.uniforms.uSource.value = accumulated.texture;
      upMaterial.uniforms.uBase.value = downTargets[k].texture;
      upMaterial.uniforms.uTexel.value.set(1 / accumulated.width, 1 / accumulated.height);
      draw(upMaterial, upTargets[k]);
      accumulated = upTargets[k];
    }
    compositeMaterial.uniforms.uLines.value = lineTarget.texture;
    compositeMaterial.uniforms.uBloom.value = accumulated.texture;
    draw(compositeMaterial, null);
  };

  const step = (dt) => {
    if (reduced) {
      glow.forEach((_, index) => (glow[index] = 0.35));
      return;
    }
    clock += dt;
    const w = width * pixelRatio;
    if (clock >= nextPing) {
      spawn(w / 2, bandCenter, 1, false, nextPing);
      nextPing = Math.max(nextPing + INTERVAL, clock + INTERVAL * 0.25);
    }
    const diag = diagonal();
    pings.forEach((ping) => {
      if (!ping.active) return;
      const front = (clock - ping.born) * WAVE_SPEED * diag * (ping.echo ? 0.55 : 1);
      if (!ping.echo) {
        contacts.forEach((contact, index) => {
          if (ping.hit[index]) return;
          if (front >= Math.hypot(contact.x - ping.x, contact.y - ping.y)) {
            ping.hit[index] = true;
            glow[index] = Math.max(glow[index], ping.amplitude);
            spawn(contact.x, contact.y, 0.95 * ping.amplitude, true);
          }
        });
      }
      if (front > (ping.echo ? Math.min(0.2 * diag, 270 * pixelRatio) : 0.9 * diag)) ping.active = false;
    });
    glow.forEach((value, index) => {
      glow[index] = value * Math.exp(-dt / 1.1);
      const card = cards[index];
      if (card) card.dataset.lit = glow[index] > 0.35 ? 'true' : 'false';
    });
    grain = (grain + 0.618034) % 1;
  };

  const schedule = () => {
    if (destroyed || lost || !visible || raf) return;
    raf = view.requestAnimationFrame(tick);
  };

  function tick(now) {
    raf = 0;
    if (destroyed || lost) return;
    const dt = last && now - last < 100 ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    if (layoutDirty) measure();
    step(dt);
    render();
    if (!reduced) schedule();
    else last = 0;
  }

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    pixelRatio = Math.min(view.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    const w = Math.round(width * pixelRatio);
    const h = Math.round(height * pixelRatio);
    release();
    lineTarget = target(w, h);
    const levels = clamp(Math.floor(Math.log2(Math.min(w, h) / 8)), 3, 6);
    for (let k = 1; k <= levels; k++) {
      downTargets.push(target(w >> k, h >> k));
      upTargets.push(target(w >> k, h >> k));
    }
    measure();
    render();
    schedule();
  };

  const onDown = (event) => {
    if (reduced || event.button !== 0) return;
    if (event.target && event.target.closest && event.target.closest('a,button,[tabindex]')) return;
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) * pixelRatio;
    const y = (rect.height - (event.clientY - rect.top)) * pixelRatio;
    if (Math.abs(y - bandCenter) > bandHalf) return;
    spawn(x, y, 1.1, false);
    schedule();
  };

  const refresh = () => {
    if (syncColors()) {
      if (!raf && visible) render();
      schedule();
    }
  };

  const onMotion = () => {
    reduced = motionQuery.matches;
    last = 0;
    schedule();
  };

  const onLost = (event) => {
    event.preventDefault();
    lost = true;
    view.cancelAnimationFrame(raf);
    raf = 0;
  };

  const onRestored = () => {
    lost = false;
    colorKey = '';
    atlasKey = '';
    syncColors();
    resize();
  };

  const resizeObserver = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
      schedule();
    },
    { rootMargin: '80px' },
  );
  const themes = new MutationObserver(refresh);
  const scheme = view.matchMedia('(prefers-color-scheme: dark)');
  themes.observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  if (scheme.addEventListener) scheme.addEventListener('change', refresh);
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
  root.addEventListener('pointerdown', onDown);
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  resizeObserver.observe(root);
  resizeObserver.observe(band);
  intersection.observe(root);
  syncColors();
  resize();
  nextPing = 0.4;

  if (typeof window !== 'undefined') {
    window.__cvTf = { pings, contacts, glow, get clock() { return clock; }, get bandCenter() { return bandCenter; }, get width() { return width; }, spawn };
  }

  return {
    updateLayout: () => {
      layoutDirty = true;
      schedule();
    },
    destroy: () => {
      destroyed = true;
      view.cancelAnimationFrame(raf);
      themes.disconnect();
      resizeObserver.disconnect();
      intersection.disconnect();
      if (scheme.removeEventListener) scheme.removeEventListener('change', refresh);
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', onMotion);
      root.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      release();
      if (fieldTarget) fieldTarget.dispose();
      if (atlas) atlas.texture.dispose();
      plane.dispose();
      [fieldMaterial, glyphMaterial, downMaterial, upMaterial, compositeMaterial].forEach((item) => item.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
}

/* ---------- монтаж: карточка «Передача работы новому владельцу» ---------- */

function cvTfCss() {
  const s = document.createElement('style');
  s.textContent = [
    '#benchmarks .cv-tf{position:relative;isolation:isolate;overflow:hidden}',
    '#benchmarks .cv-tf>*{position:relative;z-index:1}',
    '@keyframes cvTfRise{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}',
    '#benchmarks .cv-tf-sonar{margin-top:clamp(40px,6vw,64px);animation:cvTfRise .8s cubic-bezier(.16,1,.3,1) both}',
    '#benchmarks .cv-tf-band{height:clamp(14rem,30vw,26rem);width:100%}',
    '#benchmarks .cv-tf-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr;gap:40px 24px;margin-top:8px}',
    '@media(min-width:640px){#benchmarks .cv-tf-grid{grid-template-columns:repeat(2,1fr)}}',
    '@media(min-width:1024px){#benchmarks .cv-tf-grid{grid-template-columns:repeat(4,1fr)}}',
    '#benchmarks .cv-tf-grid>li{position:relative;display:flex;flex-direction:column;padding-top:32px;animation:cvTfRise .8s cubic-bezier(.16,1,.3,1) both}',
    '#benchmarks .cv-tf-grid>li:nth-child(1){animation-delay:.45s}',
    '#benchmarks .cv-tf-grid>li:nth-child(2){animation-delay:.53s}',
    '#benchmarks .cv-tf-grid>li:nth-child(3){animation-delay:.61s}',
    '#benchmarks .cv-tf-grid>li:nth-child(4){animation-delay:.69s}',
    '@media(min-width:1024px){#benchmarks .cv-tf-grid>li{padding-top:40px;align-items:center;text-align:center}}',
    '#benchmarks .cv-tf-lead{position:absolute;bottom:100%;left:50%;width:1px;height:var(--lead,0px);transform:translateX(-.5px);background:rgba(10,10,10,.2);transition:background-color .5s;display:none}',
    'html.dark #benchmarks .cv-tf-lead{background:rgba(255,255,255,.2)}',
    '@media(min-width:1024px){#benchmarks .cv-tf-lead{display:block}}',
    '#benchmarks .cv-tf-grid>li[data-lit=true] .cv-tf-lead{background:#d7261b}',
    'html.dark #benchmarks .cv-tf-grid>li[data-lit=true] .cv-tf-lead{background:#ff3b2f}',
    '#benchmarks .cv-tf-label{font-size:14px;color:var(--muted-foreground,#737373)}',
    '#benchmarks .cv-tf-val{margin-top:8px;font-family:var(--font-display,serif);font-size:2.5rem;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;transition:color .5s}',
    '@media(min-width:640px){#benchmarks .cv-tf-val{font-size:3rem}}',
    '#benchmarks .cv-tf-grid>li[data-lit=true] .cv-tf-val{color:#d7261b}',
    'html.dark #benchmarks .cv-tf-grid>li[data-lit=true] .cv-tf-val{color:#ff3b2f}',
    '#benchmarks .cv-tf-detail{margin-top:16px;max-width:30ch;font-size:14px;line-height:1.6;color:var(--muted-foreground,#737373)}',
    '@media (prefers-reduced-motion: reduce){#benchmarks .cv-tf-sonar,#benchmarks .cv-tf-grid>li{animation:none}}',
  ].join('\n');
  return s;
}

function cvTfInit() {
  let card = null;
  const candidates = document.querySelectorAll('#benchmarks .rounded-2xl.border.bg-muted');
  for (let i = 0; i < candidates.length; i++) {
    const h3 = candidates[i].querySelector('h3');
    if (h3 && h3.textContent.indexOf('Передача') !== -1) { card = candidates[i]; break; }
  }
  if (!card || card.dataset.cvTf) return;
  card.dataset.cvTf = '1';
  card.classList.add('cv-tf');

  document.head.appendChild(cvTfCss());

  /* старая логарифмическая шкала и мобильный список больше не нужны */
  const oldScale = card.querySelector('.relative.mt-36');
  if (oldScale) oldScale.remove();
  const oldList = card.querySelector('ul.mt-8');
  if (oldList) oldList.remove();
  /* подпись про логарифмическую шкалу устарела */
  const copy = card.querySelector('p');
  if (copy && copy.textContent.indexOf('Логарифмическая шкала') !== -1) {
    copy.textContent = 'Четыре способа передать произведение, измеренные от начала до конца — от мгновенной передачи сертификата до международной логистики.';
  }

  const sonarEl = document.createElement('div');
  sonarEl.className = 'cv-tf-sonar';
  const band = document.createElement('div');
  band.className = 'cv-tf-band';
  band.setAttribute('aria-hidden', 'true');
  const ol = document.createElement('ol');
  ol.className = 'cv-tf-grid';
  FINDINGS.forEach((f) => {
    const li = document.createElement('li');
    li.dataset.lit = 'false';
    const lead = document.createElement('span');
    lead.className = 'cv-tf-lead';
    lead.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'cv-tf-label';
    label.textContent = f.label;
    const val = document.createElement('span');
    val.className = 'cv-tf-val';
    val.textContent = f.value;
    const detail = document.createElement('span');
    detail.className = 'cv-tf-detail';
    detail.textContent = f.detail;
    li.appendChild(lead);
    li.appendChild(label);
    li.appendChild(val);
    li.appendChild(detail);
    ol.appendChild(li);
  });
  sonarEl.appendChild(band);
  sonarEl.appendChild(ol);
  card.appendChild(sonarEl);

  const cards = Array.from(ol.children);
  const sonar = createSonar(card, band, cards);
  if (!sonar) {
    /* WebGL2 недоступен — статичное состояние: первая находка подсвечена */
    cards.forEach((c, i) => { c.dataset.lit = i === 0 ? 'true' : 'false'; });
    band.style.height = '2rem';
  }
}

if (document.readyState === 'complete') {
  setTimeout(cvTfInit, 1500);
} else {
  window.addEventListener('load', () => setTimeout(cvTfInit, 1500));
}
