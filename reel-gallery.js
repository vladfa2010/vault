/* CIFRA Vault — Reel Gallery (React Bits reel-gallery-tw, ручной порт)
   Конфигурация из запроса: rows 5, rowHeight 74, maxAspect 2.2, tilt 3.5,
   остальное — дефолты из доков. Фоновый режим: дрейф без wheel/drag-хайджека
   (галерея — декоративный слой за заголовком CTA). Инициализация после
   window.load → после гидрации React, вмешательства в DOM безопасны. */
(function () {
  'use strict';

  var CFG = {
    rows: 5,
    rowHeight: 74,
    rowGap: 20,
    itemGap: 16,
    minAspect: 0.6,
    maxAspect: 2.2,
    tilt: 3.5,
    arch: 48,
    autoScroll: 26,
    speedVariance: 0.55,
    radius: 10,
    grayscale: 0.55,
    focusRadius: 210,
    focusStrength: 0.85,
    fade: 0.12,
    dim: 0.35,
    taper: 0.12,
    dpr: 1.25,
    centerY: 0.34          // доля высоты секции — центр стопки барабанов
  };

  var IMAGES = [
    '/reel-art-1.jpg',
    '/reel-art-2.jpg',
    '/reel-art-3.jpg',
    '/reel-art-4.jpg',
    'https://images.unsplash.com/photo-1756992293716-b843700b5ab0?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1776662958125-893f153f592a?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1752350434967-29fe9a749b37?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1785403241652-5289a59f6f86?w=800&q=80&auto=format&fit=crop'
  ];

  var SECTION_SELECTOR = 'section[aria-labelledby="cta-heading"]';

  function init() {
    var section = document.querySelector(SECTION_SELECTOR);
    if (!section) return;

    // прячем прежний фон-канвас (однорядная арка из шаблона) — его заменяет барабанная галерея
    var oldBackdrops = section.querySelectorAll(':scope > div[aria-hidden="true"]');
    if (oldBackdrops[0]) oldBackdrops[0].style.display = 'none';

    var content = section.querySelector('#cta-copy');
    if (!content) return;

    var holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;left:0;right:0;overflow:hidden;pointer-events:none;';
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    holder.appendChild(canvas);
    section.insertBefore(holder, content);

    var ctx = canvas.getContext('2d');
    var FILTER_OK = (typeof ctx.filter === 'string');

    // фон за секцией — для краевых затуханий
    function backdropColor() {
      var el = section, c = 'rgba(0,0,0,0)';
      while (el && el !== document.documentElement) {
        c = getComputedStyle(el).backgroundColor;
        var m = c.match(/rgba?\(([^)]+)\)/);
        if (m) {
          var parts = m[1].split(',').map(function (s) { return parseFloat(s); });
          if (parts.length === 4 && parts[3] === 0) { el = el.parentElement; continue; }
          if (parts.length === 3) return 'rgb(' + parts.join(',') + ')';
          if (parts.length === 4) return 'rgba(' + parts.join(',') + ')';
        }
        el = el.parentElement;
      }
      return '#ffffff';
    }
    var bg = backdropColor();

    var imgs = [];
    var loaded = 0;
    IMAGES.forEach(function (src) {
      var im = new Image();
      im.onload = function () { loaded++; };
      im.onerror = function () { loaded++; };
      im.src = src;
      imgs.push(im);
    });

    var dpr = 1, W = 0, H = 0, dprScale = 1;
    var rows = [];
    var stackH = CFG.rows * CFG.rowHeight + (CFG.rows - 1) * CFG.rowGap;
    var cursorX = -1e9, cursorY = -1e9;

    window.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      cursorX = (e.clientX - r.left);
      cursorY = (e.clientY - r.top);
    }, { passive: true });

    function maxPlateW() { return CFG.maxAspect * CFG.rowHeight; }

    function buildRows() {
      rows = [];
      var need = W + maxPlateW() * 2 + CFG.itemGap * 2;
      for (var i = 0; i < CFG.rows; i++) {
        var plates = [];
        var x = 0;
        var guard = 0;
        while (x < need && guard++ < 500) {
          var aspect = CFG.minAspect + Math.random() * (CFG.maxAspect - CFG.minAspect);
          var w = Math.round(aspect * CFG.rowHeight);
          plates.push({ x: x, w: w, img: (Math.random() * imgs.length) | 0 });
          x += w + CFG.itemGap;
        }
        rows.push({
          plates: plates,
          totalW: x,
          offset: Math.random() * x,
          mult: 1 - CFG.speedVariance * Math.random() // 0.45..1
        });
      }
    }

    function resize() {
      var secH = section.clientHeight;
      var holderH = stackH + CFG.arch + CFG.rowHeight * 1.6;
      holder.style.height = Math.round(holderH) + 'px';
      W = holder.clientWidth;
      // на мобильном заголовок занимает большую долю секции — поднимаем стопку выше
      var cy = W < 640 ? 0.23 : CFG.centerY;
      holder.style.top = Math.round(secH * cy - holderH / 2) + 'px';
      dpr = Math.min(window.devicePixelRatio || 1, CFG.dpr);
      H = holder.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      dprScale = dpr;
      buildRows();
    }

    // cover-кроп источника под пропорции плашки (в пикселах источника)
    function coverCrop(im, aspect) {
      var iw = im.naturalWidth, ih = im.naturalHeight;
      if (!iw || !ih) return null;
      var ia = iw / ih;
      var sw, sh, sx, sy;
      if (ia > aspect) { sh = ih; sw = ih * aspect; sx = (iw - sw) / 2; sy = 0; }
      else { sw = iw; sh = iw / aspect; sx = 0; sy = (ih - sh) / 2; }
      return { sx: sx, sy: sy, sw: sw, sh: sh };
    }

    function drawPlate(im, x, y, w, h, focus) {
      var crop = coverCrop(im, w / h);
      if (!crop) return;
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, CFG.radius);
      else ctx.rect(x, y, w, h);
      ctx.clip();
      if (FILTER_OK) ctx.filter = 'grayscale(' + CFG.grayscale + ')';
      ctx.drawImage(im, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
      if (focus > 0) {
        ctx.filter = 'none';
        ctx.globalAlpha = CFG.focusStrength * focus;
        ctx.drawImage(im, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
        ctx.globalAlpha = 1;
      }
      ctx.filter = 'none';
      ctx.restore();
    }

    var running = false, rafId = 0, lastT = 0;

    function frame(now) {
      if (!running) return;
      var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0.016;
      lastT = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);

      // наклон всей стопки
      ctx.translate(W / 2, H / 2);
      ctx.rotate(CFG.tilt * Math.PI / 180);
      ctx.translate(-W / 2, -H / 2);

      var padY = (H - stackH - CFG.arch) / 2 + CFG.arch;
      var mid = (CFG.rows - 1) / 2;

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        row.offset = (row.offset + CFG.autoScroll * row.mult * dt) % row.totalW;

        var f = Math.abs(i - mid) / mid;          // 0 центр → 1 край
        var s = 1 - CFG.taper * f;                 // taper
        var h = CFG.rowHeight * s;
        var rowTop = padY + i * (CFG.rowHeight + CFG.rowGap) + (CFG.rowHeight - h) / 2;

        for (var p = 0; p < row.plates.length; p++) {
          var plate = row.plates[p];
          var w = plate.w * s;
          var xr = ((plate.x - row.offset) % row.totalW + row.totalW) % row.totalW - w - CFG.itemGap;
          // два прохода для бесшовности
          for (var k = 0; k < 2; k++) {
            var px = xr + k * row.totalW;
            if (px > W + CFG.itemGap || px + w < -CFG.itemGap) continue;
            var cxp = px + w / 2;
            var u = cxp / W;
            var archY = CFG.arch * (1 - Math.pow(2 * u - 1, 2)); // арка-«долина»
            var py = rowTop + archY * (0.4 + 0.6 * s);

            // фокус-подсветка под курсором
            var f2 = 0;
            if (cursorX > -1e8) {
              var dx = cxp - cursorX, dy = (py + h / 2) - cursorY;
              var d = Math.sqrt(dx * dx + dy * dy);
              if (d < CFG.focusRadius) { var t = 1 - d / CFG.focusRadius; f2 = t * t; }
            }

            var im = imgs[plate.img];
            if (!im || !im.naturalWidth) continue;
            drawPlate(im, px, py, w, h, f2);

            if (f > 0) { // притемнение крайних барабанов
              ctx.save();
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(px, py, w, h, CFG.radius);
              else ctx.rect(px, py, w, h);
              ctx.fillStyle = 'rgba(0,0,0,' + (CFG.dim * f).toFixed(3) + ')';
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }

      // затухание кромок
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
      var fw = W * CFG.fade;
      var g1 = ctx.createLinearGradient(0, 0, fw, 0);
      g1.addColorStop(0, bg); g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, fw, H);
      var g2 = ctx.createLinearGradient(W, 0, W - fw, 0);
      g2.addColorStop(0, bg); g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2; ctx.fillRect(W - fw, 0, fw, H);
      // мягкое растворение сверху и снизу holder-а
      var fh = H * 0.18;
      var g3 = ctx.createLinearGradient(0, 0, 0, fh);
      g3.addColorStop(0, bg); g3.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g3; ctx.fillRect(0, 0, W, fh);
      var g4 = ctx.createLinearGradient(0, H, 0, H - fh);
      g4.addColorStop(0, bg); g4.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g4; ctx.fillRect(0, H - fh, W, fh);

      rafId = requestAnimationFrame(frame);
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { lastT = 0; rafId = requestAnimationFrame(frame); }
      else cancelAnimationFrame(rafId);
    }

    resize();
    window.addEventListener('resize', function () { resize(); });

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // статичный кадр без дрейфа
      var t0 = 0;
      running = true;
      frame(16);
      running = false;
      cancelAnimationFrame(rafId);
      return;
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        setRunning(!!(es[0] && es[0].isIntersecting) && !document.hidden);
      }, { rootMargin: '150px' });
      io.observe(section);
    } else setRunning(true);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) setRunning(false);
    });
  }

  window.addEventListener('load', function () {
    // небольшая задержка: гарантируем, что гидрация React завершилась
    // (вставка узлов в середину дерева до гидрации даёт ошибку #418)
    setTimeout(init, 1500);
  });
})();
