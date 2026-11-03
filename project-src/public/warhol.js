/* CIFRA Vault — «Двенадцать версий» в стиле Энди Уорхола
   Шелкографный эффект: SVG-фильтры с feComponentTransfer (type="discrete")
   квантуют каждый канал в 4 тона и раскрашивают в свою палитру — как серия
   Мэрилин/супов Кэмпбелла: один сюжет, кислотные цветовые решения.
   Подлинник (6-я плитка, KEPT=5) не трогаем — остаётся оригиналом.
   Применяем inline-style после гидрации React (style.filter перекрывает
   классовые фильтры Tailwind, DOM-атрибуты не меняем — гидрация не ломается). */
(function () {
  'use strict';

  // 11 палитр × 3 канала × 4 тона (тёмный → светлый)
  var PALETTES = [
    /* p0 розовая */    [0.20, 0.90, 1.00, 1.00,  0.03, 0.12, 0.45, 0.92,  0.14, 0.50, 0.78, 0.95],
    /* p1 жёлтая */     [0.28, 0.95, 1.00, 1.00,  0.10, 0.50, 0.88, 1.00,  0.00, 0.05, 0.15, 0.55],
    /* p2 бирюзовая */  [0.03, 0.06, 0.35, 0.85,  0.22, 0.78, 0.95, 1.00,  0.28, 0.88, 1.00, 1.00],
    /* p3 фиолетовая */ [0.18, 0.60, 0.88, 1.00,  0.02, 0.10, 0.32, 0.78,  0.32, 0.88, 1.00, 1.00],
    /* p4 зелёная */    [0.06, 0.18, 0.55, 0.95,  0.18, 0.68, 0.95, 1.00,  0.06, 0.28, 0.48, 0.80],
    /* p5 красная */    [0.32, 0.90, 1.00, 1.00,  0.02, 0.10, 0.30, 0.75,  0.05, 0.15, 0.32, 0.68],
    /* p6 синяя */      [0.05, 0.10, 0.32, 0.80,  0.12, 0.38, 0.68, 0.95,  0.32, 0.90, 1.00, 1.00],
    /* p7 лаймовая */   [0.22, 0.78, 0.95, 1.00,  0.32, 0.92, 1.00, 1.00,  0.02, 0.16, 0.38, 0.62],
    /* p8 оранжевая */  [0.28, 0.88, 1.00, 1.00,  0.10, 0.42, 0.78, 0.95,  0.00, 0.08, 0.25, 0.68],
    /* p9 лазурная */   [0.06, 0.22, 0.58, 0.95,  0.22, 0.68, 0.92, 1.00,  0.32, 0.95, 1.00, 1.00],
    /* p10 ультрафиолет*/[0.28, 0.92, 1.00, 1.00,  0.02, 0.22, 0.58, 0.90,  0.38, 0.88, 1.00, 1.00]
  ];

  var KEPT = 5; // индекс плитки-подлинника (оригинал не перекрашиваем)

  function buildSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    PALETTES.forEach(function (p, i) {
      var f = document.createElementNS(ns, 'filter');
      f.setAttribute('id', 'cifra-warhol-' + i);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      var ct = document.createElementNS(ns, 'feComponentTransfer');
      ['R', 'G', 'B'].forEach(function (ch, k) {
        var fn = document.createElementNS(ns, 'feFunc' + ch);
        fn.setAttribute('type', 'discrete');
        fn.setAttribute('tableValues', p.slice(k * 4, k * 4 + 4).join(' '));
        ct.appendChild(fn);
      });
      f.appendChild(ct);
      svg.appendChild(f);
    });
    document.body.insertBefore(svg, document.body.firstChild);
  }

  function apply() {
    var ul = document.querySelector('section#features ul');
    if (!ul) return;
    var lis = ul.querySelectorAll(':scope > li');
    var pi = 0;
    for (var i = 0; i < lis.length; i++) {
      if (i === KEPT) continue;
      var img = lis[i].querySelector('img');
      if (!img) continue;
      var v = 'url(#cifra-warhol-' + (pi % PALETTES.length) + ')';
      img.style.filter = v;
      img.style.webkitFilter = v;
      pi++;
    }
  }

  function init() {
    buildSvg();
    apply();
  }

  window.addEventListener('load', function () {
    // после гидрации React — как и остальные эффекты сайта
    setTimeout(init, 1200);
  });
})();
