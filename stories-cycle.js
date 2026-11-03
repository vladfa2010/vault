/* CIFRA Vault — секция «Те, кто уже хранит искусство у нас».
   ВЕРНЫЙ ПОРТ блока Social Proof 5 (React Bits Pro, registry: @reactbits-pro/social-proof-5,
   исходник social-proof-5.tsx скачан из лицензионного реестра pro.reactbits.dev).
   Структура дословно: h2 (text-4xl→6xl font-medium, mb-16/20, opacity 0→1 .4s whileInView once) →
   grid lg:grid-cols-2 (gap-8/12, mb-16/20): слева ряд аватаров (круг 48/64/80px, активный scale 1.1/opacity 1
   + цветная подложка, остальные .9/.6, переход .5s easeInOut; у активного SVG-кольцо -inset-2, r=48,
   dasharray 2π·48, прогресс 10s linear), справа цитата (AnimatePresence mode="wait": вход y 20→0,
   выход y 0→-20, .5s; blockquote text-xl leading-relaxed mb-6; имя font-medium + роль muted) →
   нижний ряд wordmark'ов (flex justify-between, opacity .6→1 при ховере, вход .4s с задержкой index*.1s).
   Цикл: setInterval 10 000 мс (дословно из оригинала). SSR-секция историй удаляется целиком,
   вставка — ПОСЛЕ гидрации React (защита от #418, как у pricing-1). */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CYCLE_MS = 10000; /* дословно из оригинала */
  var CIRC = 2 * Math.PI * 48; /* 301.59 — дословно */

  var COLORS = ['#fde047', '#d8b4fe', '#67e8f9', '#5eead4']; /* дословно из оригинала */

  function av(id) {
    return 'https://images.unsplash.com/photo-' + id + '?w=160&h=160&q=80&auto=format&fit=crop';
  }

  var STORIES = [
    {
      quote: 'Раньше мои работы жили на внешних дисках и в переписках. Теперь у каждой есть сертификат, история и витрина: я продаю тиражи прямо с платформы, а роялти приходит с каждой сделки и каждой перепродажи.',
      name: 'Анна Соколова',
      title: 'Художница, медиаарт',
      photo: av('1785403241652-5289a59f6f86'),
      color: COLORS[0]
    },
    {
      quote: 'Покупая цифровую работу, я покупаю не файл, а уверенность. Провенанс виден целиком — от первого хеша до моего имени владельца.',
      name: 'Дмитрий Волков',
      title: 'Коллекционер · Частная коллекция',
      photo: av('1756992293716-b843700b5ab0'),
      color: COLORS[1]
    },
    {
      quote: 'Мы перевели архив новых медиа в CIFRA Vault за один семестр. Интеграция с каталогом заняла недели, а не годы — и провенанс больше не ведётся вручную.',
      name: 'Марина Огнева',
      title: 'Куратор отдела новых медиа · Музей современного искусства',
      photo: av('1776662958125-893f153f592a'),
      color: COLORS[2]
    },
    {
      quote: 'Передача работы покупателю стала делом пяти минут: права переходят вместе с файлом, а галерея получает документ, который не оспорить.',
      name: 'Игорь Савельев',
      title: 'Директор галереи · Галерея Точка',
      photo: av('1731635793329-0fdd79d179db'),
      color: COLORS[3]
    }
  ];

  /* ряд «trusted by» — категории тех, кто хранит (из историй выше) */
  var COMPANIES = ['Художники', 'Коллекционеры', 'Музеи', 'Галереи'];

  function css() {
    var s = document.createElement('style');
    s.textContent = [
      '/* ===== Social Proof 5: секция (паддинги и сетка дословно) ===== */',
      '#stories{background:var(--background);padding:32px clamp(16px,3vw,32px);scroll-margin-top:80px}',
      '@media(min-width:640px){#stories{padding:64px clamp(24px,4vw,48px)}}',
      '#stories .sp5-in{max-width:1400px;margin:0 auto}',
      /* h2: text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight, mb-16 lg:mb-20, вход opacity .4s once */
      '#stories h2#stories-heading{font-family:var(--font-display,inherit);font-weight:500;font-size:clamp(36px,6vw,60px);line-height:1.1;letter-spacing:-.01em;color:var(--foreground);margin:0 0 clamp(48px,7vw,72px);max-width:none;opacity:0;transform:none;transition:opacity .4s ease}',
      '@media(min-width:1024px){#stories h2#stories-heading{font-size:60px;margin-bottom:80px}}',
      '#stories h2#stories-heading.sp5-in{opacity:1}',
      /* grid: gap-8 lg:gap-12, mb-16 lg:mb-20 */
      '#stories .sp5-grid{display:grid;gap:32px;margin-bottom:clamp(48px,7vw,72px)}',
      '@media(min-width:1024px){#stories .sp5-grid{grid-template-columns:1fr 1fr;gap:48px;margin-bottom:80px}}',
      /* аватары: flex gap-4 lg:gap-6; scale active 1.1 / .9, opacity 1 / .6, .5s easeInOut (монтажный вход .8/0) */
      '#stories .sp5-avs{display:flex;align-items:center;justify-content:flex-start;gap:16px}',
      '@media(min-width:1024px){#stories .sp5-avs{gap:24px}}',
      '#stories .sp5-av{position:relative;transform:scale(.9);opacity:.6;transition:transform .5s ease-in-out,opacity .5s ease-in-out;cursor:pointer;border:0;background:none;padding:0}',
      '#stories .sp5-av.sp5-mount{transform:scale(.8);opacity:0}',
      '#stories .sp5-av.active{transform:scale(1.1);opacity:1}',
      '#stories .sp5-circle{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:50%;width:48px;height:48px;transition:background-color .5s ease}',
      '@media(min-width:640px){#stories .sp5-circle{width:64px;height:64px}}',
      '@media(min-width:1024px){#stories .sp5-circle{width:80px;height:80px}}',
      '#stories .sp5-circle img{width:32px;height:32px;border-radius:50%;object-fit:cover;filter:grayscale(1)}',
      '@media(min-width:640px){#stories .sp5-circle img{width:48px;height:48px}}',
      '@media(min-width:1024px){#stories .sp5-circle img{width:64px;height:64px}}',
      /* кольцо прогресса активного: -inset-2, rotate -90, r=48, прогресс 10s linear */
      '#stories .sp5-ring{position:absolute;top:-8px;left:-8px;width:calc(100% + 16px);height:calc(100% + 16px);transform:rotate(-90deg);pointer-events:none}',
      '#stories .sp5-ring .sp5-base{fill:none;stroke-width:1.5;opacity:.2}',
      '#stories .sp5-ring .sp5-prog{fill:none;stroke-width:1.5;stroke-linecap:round;stroke-dasharray:' + CIRC.toFixed(2) + ';animation:sp5Prog ' + (CYCLE_MS / 1000) + 's linear forwards}',
      '@keyframes sp5Prog{from{stroke-dashoffset:' + CIRC.toFixed(2) + '}to{stroke-dashoffset:0}}',
      /* цитата: режим wait — выход y→-20, вход y 20→0, .5s */
      '#stories .sp5-quote-col{display:flex;flex-direction:column;justify-content:center}',
      '#stories .sp5-quote{transition:opacity .5s ease,transform .5s ease}',
      '#stories .sp5-quote.sp5-exit{opacity:0;transform:translateY(-20px)}',
      '#stories .sp5-quote.sp5-enter{opacity:0;transform:translateY(20px);transition:none}',
      '#stories .sp5-quote blockquote{margin:0 0 24px;font-size:20px;line-height:1.625;color:#d4d4d4;quotes:none}',
      '#stories .sp5-quote blockquote::before{content:"\\201C"}',
      '#stories .sp5-quote blockquote::after{content:"\\201D"}',
      ':root:not(.dark) #stories .sp5-quote blockquote{color:#525252}',
      '#stories .sp5-who{font-size:18px;font-weight:500;color:var(--foreground)}',
      '@media(min-width:640px){#stories .sp5-who{font-size:20px}}',
      '#stories .sp5-who .sp5-role{color:#a3a3a3;font-weight:400}',
      /* ряд wordmark'ов: justify-between, opacity .6→1 hover, вход .4s delay index*.1s */
      '#stories .sp5-orgs{display:flex;align-items:center;justify-content:space-between;gap:24px}',
      '#stories .sp5-org{font:600 clamp(11px,1.8vw,17px)/1 var(--font-display,inherit);letter-spacing:.12em;text-transform:uppercase;color:var(--foreground);opacity:0;transition:opacity .3s ease;white-space:nowrap}',
      '@media(min-width:640px){#stories .sp5-org{letter-spacing:.18em}}',
      '#stories .sp5-org.sp5-in{opacity:.6}',
      '#stories .sp5-org:hover{opacity:1}',
      '@media(max-width:639px){#stories .sp5-orgs{gap:12px}}',
      '@media (prefers-reduced-motion: reduce){#stories .sp5-ring .sp5-prog{animation:none;stroke-dashoffset:0}#stories .sp5-av,#stories h2#stories-heading,#stories .sp5-org{transition:none}#stories .sp5-quote{transition:opacity .01s linear}}'
    ].join('\n');
    return s;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var state = { index: 0, timer: null, swapping: false };

  function ringSvg(color) {
    return '<svg class="sp5-ring" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle class="sp5-base" cx="50" cy="50" r="48" stroke="' + color + '"/>' +
      '<circle class="sp5-prog" cx="50" cy="50" r="48" stroke="' + color + '"/>' +
    '</svg>';
  }

  function quoteHtml(story) {
    return '<blockquote>' + story.quote + '</blockquote>' +
      '<div class="sp5-who">' + story.name + ', <span class="sp5-role">' + story.title + '</span></div>';
  }

  function buildSection() {
    var sec = el('section', null);
    sec.id = 'stories';
    sec.setAttribute('aria-labelledby', 'stories-heading');

    var inner = el('div', 'sp5-in');

    var h2 = el('h2', null, 'Те, кто уже хранит искусство у нас');
    h2.id = 'stories-heading';
    inner.appendChild(h2);

    var grid = el('div', 'sp5-grid');

    /* левая колонка — аватары */
    var avs = el('div', 'sp5-avs');
    avs.setAttribute('role', 'tablist');
    avs.setAttribute('aria-label', 'Истории');
    STORIES.forEach(function (story, i) {
      var b = el('button', 'sp5-av sp5-mount');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.index = String(i);
      b.setAttribute('aria-label', story.name + ', ' + story.title);
      b.innerHTML =
        '<span class="sp5-circle" style="background-color:' + (i === 0 ? story.color : 'transparent') + '">' +
          '<img src="' + story.photo + '" alt="" loading="lazy">' +
        '</span>';
      avs.appendChild(b);
    });
    grid.appendChild(avs);

    /* правая колонка — цитата */
    var qcol = el('div', 'sp5-quote-col');
    var q = el('div', 'sp5-quote', quoteHtml(STORIES[0]));
    q.setAttribute('aria-live', 'polite');
    qcol.appendChild(q);
    grid.appendChild(qcol);
    inner.appendChild(grid);

    /* нижний ряд wordmark'ов */
    var orgs = el('div', 'sp5-orgs');
    COMPANIES.forEach(function (name) {
      orgs.appendChild(el('span', 'sp5-org', name));
    });
    inner.appendChild(orgs);

    sec.appendChild(inner);
    return sec;
  }

  function paintAvatars(sec) {
    var avs = sec.querySelectorAll('.sp5-av');
    avs.forEach(function (b, i) {
      var active = i === state.index;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
      var circle = b.querySelector('.sp5-circle');
      circle.style.backgroundColor = active ? STORIES[i].color : 'transparent';
      /* кольцо только у активного — пересоздаётся при каждой активации,
         поэтому анимация прогресса стартует заново (key={progress-activeIndex} в оригинале) */
      var old = b.querySelector('.sp5-ring');
      if (old) old.remove();
      if (active) b.appendChild(ringWrap(STORIES[i].color));
    });
  }

  function ringWrap(color) {
    var span = el('span');
    span.innerHTML = ringSvg(color);
    return span.firstChild;
  }

  function swapQuote(sec) {
    var q = sec.querySelector('.sp5-quote');
    var story = STORIES[state.index];
    if (REDUCED) {
      q.innerHTML = quoteHtml(story);
      return;
    }
    state.swapping = true;
    q.classList.add('sp5-exit');
    setTimeout(function () {
      q.innerHTML = quoteHtml(story);
      q.classList.remove('sp5-exit');
      q.classList.add('sp5-enter');
      void q.offsetWidth; /* reflow — сброс перехода перед входом */
      q.classList.remove('sp5-enter');
      setTimeout(function () { state.swapping = false; }, 500);
    }, 500); /* длительность выхода .5s — дословно */
  }

  function activate(sec, i, user) {
    if (state.swapping || i === state.index) return;
    state.index = i;
    paintAvatars(sec);
    swapQuote(sec);
    if (user) restartTimer(sec);
  }

  function restartTimer(sec) {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(function () {
      activate(sec, (state.index + 1) % STORIES.length, false);
    }, CYCLE_MS);
  }

  function wire(sec) {
    /* вход h2 при появлении (whileInView once, .4s) */
    var h2 = sec.querySelector('#stories-heading');
    if ('IntersectionObserver' in window && !REDUCED) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { h2.classList.add('sp5-in'); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(h2);
    } else {
      h2.classList.add('sp5-in');
    }

    /* монтажный вход аватаров: .8/0 → состояние active/idle, .5s easeInOut — дословно initial/animate */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sec.querySelectorAll('.sp5-mount').forEach(function (b) { b.classList.remove('sp5-mount'); });
      });
    });

    /* вход ряда wordmark'ов: opacity .4s, задержка index*.1s — дословно */
    var orgs = sec.querySelectorAll('.sp5-org');
    if ('IntersectionObserver' in window && !REDUCED) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          orgs.forEach(function (o, i) {
            setTimeout(function () { o.classList.add('sp5-in'); }, i * 100);
          });
          io2.disconnect();
        });
      }, { threshold: 0.4 });
      io2.observe(sec.querySelector('.sp5-orgs'));
    } else {
      orgs.forEach(function (o) { o.classList.add('sp5-in'); });
    }

    /* первый аватар активен с кольцом с момента вставки */
    paintAvatars(sec);

    /* клик по аватару — выбор истории */
    sec.querySelector('.sp5-avs').addEventListener('click', function (e) {
      var b = e.target.closest('.sp5-av');
      if (!b) return;
      activate(sec, Number(b.dataset.index), true);
    });

    /* автосмена каждые 10s — дословно setInterval оригинала */
    if (!REDUCED) restartTimer(sec);
  }

  function insert() {
    var old = document.getElementById('stories');
    if (!old || old.dataset.sp5 === 'real') return;
    document.head.appendChild(css());
    var sec = buildSection();
    sec.dataset.sp5 = 'real';
    old.parentNode.replaceChild(sec, old);
    wire(sec);
  }

  if (document.readyState === 'complete') {
    setTimeout(insert, 1500);
  } else {
    window.addEventListener('load', function () { setTimeout(insert, 1500); });
  }
})();
