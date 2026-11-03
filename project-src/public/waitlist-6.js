/*
 * waitlist-6 (React Bits Pro, pro-реестр) — порт «Форма ожидания».
 * Источник: https://pro.reactbits.dev/api/r/pro/waitlist-6 (лицензия владельца).
 * Изменения относительно оригинала (только адаптация):
 *   1. Секция → модальное окно: открывается по клику на тариф «Студия»/«Коллекция»
 *      (API: window.cvWaitlist.open(planName)), закрытие по X / ESC / клику по фону.
 *   2. Тёмная тема жёстко (#0a0a0b, uTheme=1) — лендинг тёмный; light-ветки убраны.
 *   3. Копия на русском. Строка аватаров+числа «11,204 in queue» убрана —
 *      недоказуемое число (красная линия бренда: только проверяемые цифры).
 *   4. Анимации framer-motion → CSS-переходы (паттерн pricing-6): те же
 *      staggerChildren 0.09 / delayChildren 0.05 / y 20→0 / 0.6s ease-out.
 *   5. Рипплы инициализируются лениво при первом открытии; при недоступности
 *      WebGL — статичный фон (catch по оригиналу).
 * Шейдеры rippleVertexShader/rippleFragmentShader — дословно из реестра.
 */
import * as THREE from 'three';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rippleVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const rippleFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uTheme;

  float ring(vec2 p, float radius, float width) {
    float d = abs(length(p) - radius);
    return 1.0 - smoothstep(0.0, width, d);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (vUv - 0.5) * aspect;
    float dist = length(p);

    float waves = 0.0;
    for (int i = 0; i < 6; i++) {
      float phase = fract(uTime * 0.05 + float(i) / 6.0);
      float radius = phase * 1.35;
      float fade = smoothstep(0.02, 0.2, radius) * (1.0 - smoothstep(0.5, 1.3, radius));
      float width = 0.014 + radius * 0.055;
      waves += ring(p, radius, width) * fade;
    }
    waves = min(waves, 1.0);

    float glow = exp(-dist * 3.2);
    float grain = hash(gl_FragCoord.xy) - 0.5;

    vec3 lightColor = vec3(1.0)
      - vec3(0.085, 0.083, 0.075) * waves
      - vec3(0.030, 0.028, 0.020) * glow;
    vec3 darkColor = vec3(0.039, 0.039, 0.043)
      + vec3(0.62, 0.66, 0.74) * waves * 0.17
      + vec3(0.25, 0.36, 0.52) * waves * 0.09
      + vec3(0.10, 0.12, 0.18) * glow * 0.4;

    vec3 color = mix(lightColor, darkColor, clamp(uTheme, 0.0, 1.0));
    color += grain * 0.012;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CSS = [
  '.wl6-overlay{position:fixed;inset:0;z-index:9990;display:none;align-items:center;justify-content:center;overflow:hidden;background:#0a0a0b}',
  '.wl6-overlay.wl6-open{display:flex}',
  '.wl6-ripples{position:absolute;inset:0;pointer-events:none}',
  '.wl6-ripples canvas{position:absolute;inset:0;width:100%;height:100%;display:block}',
  '.wl6-radial{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 65% 55% at 50% 50%, rgba(10,10,11,0.85), transparent 72%)}',
  '.wl6-panel{position:relative;z-index:10;width:100%;max-width:1400px;max-height:100svh;overflow-y:auto;padding:64px 16px 48px;box-sizing:border-box;display:flex;align-items:center;justify-content:center}',
  '.wl6-close{position:absolute;top:20px;right:20px;z-index:20;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#a3a3a3;cursor:pointer;transition:color .2s,background-color .2s,border-color .2s}',
  '.wl6-close:hover{color:#fff;background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.25)}',
  '.wl6-close:focus-visible{outline:2px solid rgba(255,255,255,0.4);outline-offset:2px}',
  '.wl6-inner{margin:0 auto;display:flex;max-width:768px;flex-direction:column;align-items:center;text-align:center}',
  '.wl6-item{opacity:0;transform:translateY(20px)}',
  '.wl6-overlay.wl6-anim .wl6-item{animation:wl6-rise .6s cubic-bezier(.22,1,.36,1) forwards;animation-delay:calc(var(--wl6-i) * 90ms + 50ms)}',
  '@keyframes wl6-rise{to{opacity:1;transform:translateY(0)}}',
  '@media (prefers-reduced-motion: reduce){.wl6-overlay.wl6-anim .wl6-item{animation:none;opacity:1;transform:none}}',
  '.wl6-badge{display:inline-flex;align-items:center;gap:8px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);padding:6px 14px;font:500 12px/1 var(--font-display,inherit);letter-spacing:.2em;text-transform:uppercase;color:#d4d4d4;backdrop-filter:blur(12px)}',
  '.wl6-badge svg{width:14px;height:14px}',
  '.wl6-h{margin-top:24px;font:600 clamp(2rem,5.2vw,4.5rem)/1.08 var(--font-display,inherit);letter-spacing:-0.02em;color:#fff;text-wrap:balance}',
  '.wl6-p{margin-top:24px;max-width:576px;font:400 clamp(1rem,1.6vw,1.125rem)/1.65 var(--font-display,inherit);color:#a3a3a3}',
  '.wl6-form{margin-top:40px;width:100%;max-width:448px;border-radius:30px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);padding:6px;box-shadow:0 1px 2px rgba(0,0,0,0.2);backdrop-filter:blur(12px);transition:border-color .2s,box-shadow .2s}',
  '.wl6-form:focus-within{border-color:rgba(255,255,255,0.25);box-shadow:0 0 0 2px rgba(255,255,255,0.15)}',
  '.wl6-fields{display:flex;flex-direction:column;gap:6px;transition:opacity .3s cubic-bezier(.22,1,.36,1),transform .3s cubic-bezier(.22,1,.36,1)}',
  '.wl6-form.wl6-loading .wl6-fields,.wl6-form.wl6-done .wl6-fields{opacity:0;transform:translateY(-8px);pointer-events:none}',
  '.wl6-input{height:48px;width:100%;border-radius:999px;background:transparent;padding:0 20px;border:0;box-sizing:border-box;font:400 16px var(--font-display,inherit);color:#fff;outline:none;opacity:1}',
  '.wl6-input::placeholder{color:#737373}',
  '.wl6-input:disabled{opacity:.5}',
  '.wl6-submit{display:inline-flex;height:48px;width:100%;flex-shrink:0;align-items:center;justify-content:center;gap:8px;border-radius:999px;border:0;background:#fff;padding:0 24px;font:500 16px var(--font-display,inherit);color:#0a0a0a;cursor:pointer;transition:background-color .2s,opacity .2s;box-sizing:border-box}',
  '.wl6-submit:hover:not(:disabled){background:#e5e5e5}',
  '.wl6-submit:disabled{cursor:not-allowed;opacity:.6}',
  '.wl6-submit:focus-visible{outline:2px solid #fff;outline-offset:2px}',
  '.wl6-submit svg{width:16px;height:16px}',
  '.wl6-success{display:none;min-height:48px;align-items:center;justify-content:center;gap:10px;padding:8px 16px;text-align:center;font:500 14px var(--font-display,inherit);color:#fff;transition:opacity .4s cubic-bezier(.22,1,.36,1),transform .4s cubic-bezier(.22,1,.36,1);opacity:0;transform:translateY(8px)}',
  '.wl6-form.wl6-done .wl6-success{display:flex;opacity:1;transform:translateY(0)}',
  '.wl6-ok{display:flex;width:24px;height:24px;flex-shrink:0;align-items:center;justify-content:center;border-radius:999px;background:rgba(52,211,153,0.15);color:#34d399}',
  '.wl6-ok svg{width:14px;height:14px}',
  '.wl6-plan{margin-top:20px;font:400 13px var(--font-display,inherit);color:#737373}',
  '@media (min-width:640px){.wl6-form{border-radius:999px}.wl6-fields{flex-direction:row;align-items:center}.wl6-input{flex:1}.wl6-submit{width:auto}}',
].join('\n');

const SVG = {
  radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

const LS_KEY = 'cv_waitlist';

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function mount() {
  if (document.body.dataset.wl6Ready) return;
  document.body.dataset.wl6Ready = '1';

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const overlay = el(
    '<div class="wl6-overlay" role="dialog" aria-modal="true" aria-label="Форма ожидания">' +
      '<div class="wl6-ripples" aria-hidden="true"></div>' +
      '<div class="wl6-radial" aria-hidden="true"></div>' +
      '<button type="button" class="wl6-close" aria-label="Закрыть">' + SVG.close + '</button>' +
      '<div class="wl6-panel">' +
        '<div class="wl6-inner">' +
          '<div class="wl6-item wl6-badge" style="--wl6-i:0">' + SVG.radar + '<span>Закрытая бета · Третья волна</span></div>' +
          '<h2 class="wl6-item wl6-h" style="--wl6-i:1">Когда мы запустимся,<br/>вы узнаете первыми</h2>' +
          '<p class="wl6-item wl6-p" style="--wl6-i:2">C/VAULT открывается небольшими волнами. Оставьте email — и вы получите единственное письмо, когда ваше приглашение будет готово. Больше ничего, честно.</p>' +
          '<form class="wl6-item wl6-form" style="--wl6-i:3" novalidate>' +
            '<div class="wl6-fields">' +
              '<input class="wl6-input" type="email" placeholder="ваш@email.ru" required aria-label="Электронная почта" />' +
              '<button class="wl6-submit" type="submit"><span class="wl6-submit-t">Занять место</span>' + SVG.arrow + '</button>' +
            '</div>' +
            '<div class="wl6-success" role="status"><span class="wl6-ok">' + SVG.check + '</span><span>Вы в очереди — ждите письма</span></div>' +
          '</form>' +
          '<p class="wl6-item wl6-plan" style="--wl6-i:4" hidden></p>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
  document.body.appendChild(overlay);

  const ripplesHost = overlay.querySelector('.wl6-ripples');
  const form = overlay.querySelector('.wl6-form');
  const input = overlay.querySelector('.wl6-input');
  const submitBtn = overlay.querySelector('.wl6-submit');
  const submitTxt = overlay.querySelector('.wl6-submit-t');
  const planLine = overlay.querySelector('.wl6-plan');
  let status = 'idle';
  let plan = null;
  let three = null;

  /* --- Three.js ripple field: шейдеры и логика дословно из реестра --- */
  function initRipples() {
    if (three) return;
    let renderer;
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader: rippleVertexShader,
        fragmentShader: rippleFragmentShader,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uTheme: { value: 1 },
        },
        depthWrite: false,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
      } catch (e) {
        geometry.dispose();
        material.dispose();
        return;
      }

      Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
      ripplesHost.appendChild(renderer.domElement);

      const clock = new THREE.Clock();
      let frame = 0;
      const renderScene = () => renderer.render(scene, camera);
      const resize = () => {
        const rect = ripplesHost.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        material.uniforms.uResolution.value.set(width, height);
        renderScene();
      };
      const tick = () => {
        material.uniforms.uTime.value = clock.getElapsedTime();
        renderScene();
        frame = requestAnimationFrame(tick);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(ripplesHost);
      resize();
      if (REDUCED) {
        material.uniforms.uTime.value = 5.2;
        renderScene();
      } else {
        frame = requestAnimationFrame(tick);
      }
      three = {
        stop() {
          cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          scene.remove(mesh);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          if (renderer.domElement.parentElement === ripplesHost) ripplesHost.removeChild(renderer.domElement);
        },
      };
    } catch (e) {
      /* WebGL недоступен — остаётся статичный тёмный фон */
    }
  }

  function open(planName) {
    plan = planName || null;
    planLine.hidden = !plan;
    if (plan) planLine.textContent = 'Тариф: «' + plan + '» — приглашение придёт с учётом выбора';
    if (status !== 'done') {
      form.classList.remove('wl6-loading', 'wl6-done');
      status = 'idle';
      submitTxt.textContent = 'Занять место';
      submitBtn.disabled = false;
      input.disabled = false;
    }
    overlay.classList.add('wl6-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    initRipples();
    overlay.classList.remove('wl6-anim');
    void overlay.offsetWidth; /* рестарт stagger-анимации */
    overlay.classList.add('wl6-anim');
    overlay.querySelector('.wl6-close').focus();
  }

  function close() {
    overlay.classList.remove('wl6-open', 'wl6-anim');
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  overlay.querySelector('.wl6-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === ripplesHost) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('wl6-open')) close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (status !== 'idle') return;
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.focus();
      input.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
      setTimeout(() => { input.style.boxShadow = ''; }, 1200);
      return;
    }
    status = 'loading';
    form.classList.add('wl6-loading');
    submitTxt.textContent = 'Отправляем…';
    submitBtn.disabled = true;
    input.disabled = true;
    setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        list.push({ email: email, plan: plan, ts: Date.now() });
        localStorage.setItem(LS_KEY, JSON.stringify(list));
      } catch (err) {}
      status = 'done';
      form.classList.remove('wl6-loading');
      form.classList.add('wl6-done');
    }, 900);
  });

  window.cvWaitlist = { open: open, close: close };
}

if (document.readyState === 'complete') {
  setTimeout(mount, 1500);
} else {
  window.addEventListener('load', () => setTimeout(mount, 1500));
}
