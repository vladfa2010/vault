/* CIFRA Vault — секция «Для институций».
   ПОЛНЫЙ ПОРТ блока CTA-5 (React Bits Pro, registry: @reactbits-pro/cta-5, исходник cta-5.tsx сверен
   построчно 2026-11-02): автоплей-видео (autoPlay loop muted playsInline, object-cover, источник —
   дословно из оригинала, локальная копия cta-5-motion.mp4) под органической SVG-маской
   (fill-rule evenodd, viewBox 0 0 1204 845, aspect-ratio 1204/845, preserveAspectRatio slice,
   маска залита цветом фона страницы вместо white/neutral-950 оригинала), uppercase-теглайн,
   центрированный h2, розовая пилюля с ArrowRight (group-hover:translate-x-1, transition-colors 200ms),
   motion-входы: scale 0.95→1 .8s у медиа, y 20→0 .6s с задержками .2/.3/.4 у текста (дословно;
   триггер — IntersectionObserver, в оригинале — на маунте). Постер видео — reel-art-3.jpg (статичный
   фолбэк первого кадра). Формы в оригинале cta-5 НЕТ (бывш. форма «Имя/…» — наша прошлая надстройка,
   удалена ранее); пилюля «Оставить заявку» — mailto:sales@vault.cifra.com. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* дословно из cta-5.tsx: даже-нечётная маска, вырезающая органическое окно из прямоугольника 1204×845 */
  var MASK_PATH = 'M0 0H1204V845H0V0ZM75 0C33.5786 0 0 33.5786 0 75V570C0 611.421 33.5786 645 75 645H237C310.541 645.02 334.965 663.267 335 743V769C335 810.421 368.579 844 410 844H794C835.421 844 869 810.421 869 769V743C869.035 663.267 893.459 645.02 967 645H1129C1170.42 645 1204 611.421 1204 570V75C1204 33.5786 1170.42 0 1129 0H75Z';

  function css() {
    var s = document.createElement('style');
    s.textContent = [
      '/* ===== CTA-5: секция ===== */',
      '#institutions{position:relative;background:var(--background);padding:clamp(48px,7vw,96px) clamp(16px,3vw,32px)}',
      '#institutions .inst-wrap{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:clamp(24px,4vw,32px)}',
      /* медиа под маской: relative, max-w-3xl, aspect-ratio 1204/845 — как в оригинале */
      '#institutions .inst-media{position:relative;width:100%;max-width:48rem;aspect-ratio:1204/845;isolation:isolate}',
      /* видео дословно из cta-5.tsx: absolute inset-0 w-full h-full object-cover */
      '#institutions .inst-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}',
      '#institutions .inst-media svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block}',
      /* теглайн: text-xs/sm uppercase tracking-wider, font-medium, muted — дословно */
      '#institutions .inst-tag{font:500 clamp(12px,1.4vw,14px)/1 var(--font-display,inherit);letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground);margin:0}',
      /* h2: text-xl→3xl, font-normal, leading-tight, max-w-xl, centered — дословно */
      '#institutions h2#institutions-heading{font-family:var(--font-display,inherit);font-weight:400;font-size:clamp(20px,3vw,30px);line-height:1.25;letter-spacing:0;color:var(--foreground);text-align:center;max-width:36rem;margin:0}',
      /* пилюля: px-6/8 py-3/3.5 rounded-full bg-pink-300 hover:bg-pink-400 text-neutral-900, ArrowRight w-4/5 group-hover:translate-x-1, transition-colors 200ms — дословно */
      '#institutions .inst-pill{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border:0;border-radius:999px;background:#f9a8d4;color:#171717;font:500 clamp(14px,1.6vw,16px)/1 var(--font-display,inherit);cursor:pointer;transition:background-color .2s ease;text-decoration:none}',
      '@media(min-width:640px){#institutions .inst-pill{padding:14px 32px}}',
      '#institutions .inst-pill:hover{background:#f472b6}',
      '#institutions .inst-pill:active{transform:scale(.97)}',
      '#institutions .inst-pill svg{transition:transform .2s ease}',
      '#institutions .inst-pill:hover svg{transform:translateX(4px)}',
      /* motion-входы (аналог motion.div initial/animate): медиа scale .95→1 .8s; тексты y 20→0 .6s, задержки .2/.3/.4 */
      '#institutions .inst-in{opacity:0}',
      '#institutions .inst-in[data-cv-cta5="media"]{transform:scale(.95)}',
      '#institutions .inst-in[data-cv-cta5="tag"],#institutions .inst-in[data-cv-cta5="h2"],#institutions .inst-in[data-cv-cta5="btn"]{transform:translateY(20px)}',
      '#institutions.inst-live .inst-in{animation:cvCta5In .6s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--cv-cta5-d,0s)}',
      '#institutions.inst-live .inst-in[data-cv-cta5="media"]{animation-duration:.8s}',
      '@keyframes cvCta5In{from{opacity:0;transform:var(--cv-cta5-from,translateY(20px))}to{opacity:1;transform:var(--cv-cta5-to,translateY(0))}}',
      '#institutions.inst-live .inst-in[data-cv-cta5="media"]{--cv-cta5-from:scale(.95);--cv-cta5-to:scale(1)}',
      '@media (prefers-reduced-motion: reduce){#institutions .inst-in{animation:none!important;opacity:1!important;transform:none!important}}'
    ].join('\n');
    return s;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildSection() {
    var sec = el('section', null);
    sec.id = 'institutions';
    sec.setAttribute('aria-labelledby', 'institutions-heading');

    var wrap = el('div', 'inst-wrap');

    /* — медиа под органической маской CTA-5: автоплей-видео дословно из cta-5.tsx — */
    var media = el('div', 'inst-media inst-in');
    media.dataset.cvCta5 = 'media';
    media.style.setProperty('--cv-cta5-d', '0s');
    media.innerHTML =
      '<video autoplay loop muted playsInline preload="metadata" poster="/reel-art-3.jpg" aria-label="Анимация — демонстрация цифрового хранения CIFRA Vault">' +
        '<source src="/cta-5-motion.mp4" type="video/mp4">' +
      '</video>' +
      '<svg viewBox="0 0 1204 845" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="' + MASK_PATH + '" fill="var(--background)"/>' +
      '</svg>';
    wrap.appendChild(media);

    /* — теглайн / заголовок / пилюля — структура и тайминги дословно из cta-5.tsx — */
    var tag = el('p', 'inst-tag inst-in', 'CIFRA Vault · Институции');
    tag.dataset.cvCta5 = 'tag';
    tag.style.setProperty('--cv-cta5-d', '0.2s');
    wrap.appendChild(tag);

    var h2 = el('h2', 'inst-in', 'Музеи, галерея, фонды. Коллекция, которая переживёт смену эпох');
    h2.id = 'institutions-heading';
    h2.dataset.cvCta5 = 'h2';
    h2.style.setProperty('--cv-cta5-d', '0.3s');
    wrap.appendChild(h2);

    var btnWrap = el('div', 'inst-in');
    btnWrap.dataset.cvCta5 = 'btn';
    btnWrap.style.setProperty('--cv-cta5-d', '0.4s');
    btnWrap.innerHTML =
      '<a href="mailto:sales@vault.cifra.com" class="inst-pill"><span>Оставить заявку</span>' + ARROW + '</a>';
    wrap.appendChild(btnWrap);

    sec.appendChild(wrap);
    return sec;
  }

  function wire(sec) {
    /* видео: гарантируем старт автоплея (muted-политика) + reduced-motion — стоп */
    var v = sec.querySelector('video');
    if (v) {
      if (REDUCED) {
        v.removeAttribute('autoplay');
        v.pause();
      } else {
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () {});
      }
    }
    /* motion-входы: класс inst-live ставим при появлении секции в вьюпорте (аналог mount-анимации) */
    function live() {
      if (sec.classList.contains('inst-live')) return;
      sec.classList.add('inst-live');
    }
    if (REDUCED || !('IntersectionObserver' in window)) {
      live();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { live(); io.disconnect(); }
        });
      }, { threshold: 0.15 });
      io.observe(sec);
      /* страховка: если IO не сработал, показываем всё через 3с после вставки */
      setTimeout(live, 3000);
    }

  }

  function insert() {
    var anchor = document.querySelector('main section#faq');
    if (!anchor || document.getElementById('institutions')) return;
    document.head.appendChild(css());
    var sec = buildSection();
    anchor.parentNode.insertBefore(sec, anchor);
    wire(sec);
  }

  if (document.readyState === 'complete') {
    setTimeout(insert, 1400);
  } else {
    window.addEventListener('load', function () { setTimeout(insert, 1400); });
  }
})();
