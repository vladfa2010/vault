/* ============================================================
   CIFRA Vault — ВЕРНЫЙ ПОРТ блока pricing-6 (React Bits Pro;
   исходник pricing-6.tsx скачан из лицензионного реестра,
   /api/r/pro/pricing-6). Структура, классы и тайминги —
   дословно: h2 text-4xl/6xl font-medium, общий тоггл месяц/год
   с бегунком (spring stiffness 500 damping 35 mass 0.8 →
   аналог на CSS transition), сетка 3 карточек lg:grid-cols-3
   gap-6 items-center max-w-6xl, популярная середина приподнята
   (lg:-my-4, градиент from-blue-brand/25 to-transparent,
   ring-blue-brand/20, shadow-xl), чек-иконки lucide Check
   strokeWidth 3 в круге, кнопки bg-blue-brand hover:scale-[1.02].
   ЕДИНСТВЕННОЕ ОТСТУПЛЕНИЕ ОТ ОРИГИНАЛА: фиолетовый purple-500 (#a855f7)
   перекрашен в брендовый синий #2f6bff (hover #1d5bef, градиенты и
   кольцо rgba(47,107,255,…)) — решение владельца 2026-11-02, фиолетовый
   не входил в палитру сайта (синий/циан узла света, розовая пилюля CTA-5).
   Motion-входы: контейнер staggerChildren 0.15 delayChildren
   0.1, карточки y 30→0 .5s cubic-bezier(.25,.1,.25,1) → CSS-
   анимации с задержками 0.1/0.25/0.4s. Контент — тарифы сайта
   (Студия/Коллекция/Институции, цены и фичи прежние).
   SSR-заголовок секции и сноска «Цены в USD» сохранены.
   Вставка ПОСЛЕ гидрации (та же защита от #418).
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;display:block" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  var PLANS = [
    {
      name: 'Студия',
      price: { monthly: '19.99', annual: '15.99' },
      note: { monthly: 'в месяц', annual: 'в месяц, оплата за год' },
      description: '5 ТБ хранения, без ограничения на число работ.',
      features: [
        'Всё из «Старта»',
        'Сертификаты подлинности и договоры',
        'Тиражи «N из M» под контролем',
        'Защищённая передача покупателю',
        'Роялти при вторичных продажах',
        'Виртуальный зал',
      ],
      cta: 'Выбрать «Студию»',
      href: 'https://vault.cifra.com/sign-up?plan=studio',
      popular: false,
    },
    {
      name: 'Коллекция',
      price: { monthly: '80', annual: '64' },
      note: { monthly: 'в месяц', annual: 'в месяц, оплата за год' },
      description: '20 ТБ хранения, каталог коллекции и оценка.',
      features: [
        'Всё из «Студии», плюс:',
        'Провенанс и смена владельца',
        'Каталог коллекции с оценкой',
        'Приоритетная миграция архива',
        'Именный куратор',
      ],
      cta: 'Выбрать «Коллекцию»',
      href: 'https://vault.cifra.com/sign-up?plan=collection',
      popular: true,
    },
    {
      name: 'Институции',
      price: null,
      note: null,
      description: 'Для музеев, фондов и университетов — на ваших условиях и под ваши регламенты.',
      features: [
        'Индивидуальные условия для институтов',
        'Музеи, фонды и университеты',
        'Миграция существующего архива',
        'SLA и приоритетная поддержка',
        'API и интеграция с каталогом',
        'Обучение команды',
        'Именный менеджер',
        'Инвойсы и закупочные документы',
      ],
      cta: 'Обсудить условия',
      href: '#institutions',
      popular: false,
    },
  ];

  function css() {
    var s = document.createElement('style');
    s.textContent = [
      /* motion: staggerChildren .15 delayChildren .1 → задержки карточек */
      '@keyframes cvP6In{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
      /* тоггл: p-1 rounded-full border w-60 — дословно */
      '#pricing .cv-p6-toggle{display:flex;align-items:center;justify-content:center;margin-top:56px;margin-bottom:64px}',
      '#pricing .cv-p6-switch{position:relative;display:flex;align-items:center;width:240px;padding:4px;border-radius:9999px;border:1px solid var(--border,#262626);background:transparent;box-sizing:border-box}',
      /* бегунок: absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-purple-500 rounded-full shadow-sm;
         spring stiffness 500/damping 35/mass 0.8 ≈ быстрый доводка без перелёта — cubic-bezier(.3,1.2,.4,1) */
      '#pricing .cv-p6-thumb{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:9999px;background:#2f6bff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .45s cubic-bezier(.3,1.2,.4,1)}',
      '#pricing .cv-p6-thumb.annual{transform:translateX(100%)}',
      '#pricing .cv-p6-switch button{position:relative;z-index:1;flex:1;cursor:pointer;border:0;background:transparent;padding:8px 0;border-radius:9999px;font:500 14px/1 var(--font-display,inherit);text-align:center;color:#a3a3a3;transition:color .2s}',
      '#pricing .cv-p6-switch button.on{color:#fff}',
      /* сетка: grid-cols-1 lg:grid-cols-3 gap-6 items-center w-full max-w-6xl — дословно */
      '#pricing .cv-p6-grid{display:grid;grid-template-columns:1fr;gap:24px;align-items:center;width:100%;max-width:72rem;margin:0 auto}',
      '@media(min-width:1024px){#pricing .cv-p6-grid{grid-template-columns:repeat(3,1fr)}}',
      /* карточка: relative p-6 rounded-2xl flex flex-col overflow-hidden — дословно */
      '#pricing .cv-p6-card{position:relative;display:flex;flex-direction:column;overflow:hidden;padding:24px;border-radius:16px;background:#171717;color:#fff;border:1px solid #262626;box-shadow:0 1px 2px rgba(0,0,0,.3);opacity:0}',
      '@media (prefers-reduced-motion: reduce){#pricing .cv-p6-card{opacity:1}}',
      '#pricing .cv-p6-card.in{animation:cvP6In .5s cubic-bezier(.25,.1,.25,1) both;animation-delay:var(--cv-p6-d,0s)}',
      /* популярная: bg-linear-to-t from-purple-500/25 to-transparent lg:py-6 lg:-my-4 shadow-xl z-10 ring-1 ring-purple-500/20 — дословно */
      '#pricing .cv-p6-card.popular{background:linear-gradient(to top,rgba(47,107,255,.25),transparent);border:0;box-shadow:0 20px 25px -5px rgba(0,0,0,.5);z-index:10;--tw-ring-inset:0;--tw-ring-color:rgba(47,107,255,.2);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 0 calc(1px + 0px) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),0 20px 25px -5px rgba(0,0,0,.5)}',
      '@media(min-width:1024px){#pricing .cv-p6-card.popular{padding-top:24px;padding-bottom:24px;margin-top:-16px;margin-bottom:-16px}}',
      /* шапка карточки: flex justify-between items-center mb-4 */
      '#pricing .cv-p6-head{position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
      '#pricing .cv-p6-head h3{margin:0;font:500 20px/1.4 var(--font-display,inherit);color:#a3a3a3}',
      '#pricing .cv-p6-card.popular .cv-p6-head h3{color:#2f6bff}',
      /* бейдж Most Popular: bg-purple-500/20 text-purple-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide — дословно */
      '#pricing .cv-p6-badge{background:rgba(47,107,255,.2);color:#2f6bff;padding:4px 12px;border-radius:9999px;font:600 12px/1 var(--font-display,inherit);text-transform:uppercase;letter-spacing:.025em;white-space:nowrap}',
      /* цена: flex items-baseline gap-1 mb-4, text-4xl font-medium tracking-tight */
      '#pricing .cv-p6-price{position:relative;z-index:10;display:flex;align-items:baseline;gap:4px;margin-bottom:16px}',
      '#pricing .cv-p6-price b{font:500 36px/1.1 var(--font-display,inherit);letter-spacing:-.02em;color:#fff}',
      '#pricing .cv-p6-price small{font:400 13px/1.5 var(--font-display,inherit);color:#a3a3a3;margin-left:6px}',
      /* описание: text-sm mb-8 leading-relaxed */
      '#pricing .cv-p6-desc{position:relative;z-index:10;margin:0 0 32px;font-size:14px;line-height:1.625;color:#a3a3a3}',
      '#pricing .cv-p6-card.popular .cv-p6-desc{color:#d4d4d4}',
      /* кнопка: w-full py-3.5 rounded-xl font-medium transition-all duration-200 mb-8 — дословно */
      '#pricing .cv-p6-btn{position:relative;z-index:10;display:block;width:100%;box-sizing:border-box;padding:14px 24px;border:0;border-radius:12px;background:#2f6bff;color:#fff;font:500 15px/1 var(--font-display,inherit);text-align:center;text-decoration:none;cursor:pointer;transition:background-color .2s,transform .2s;margin-bottom:32px}',
      '#pricing .cv-p6-btn:hover{background:#1d5bef;transform:scale(1.02)}',
      /* фичи: space-y-4, lead text-sm font-medium, ul space-y-3, li flex gap-3 */
      '#pricing .cv-p6-feats{position:relative;z-index:10;display:flex;flex-direction:column;gap:16px}',
      '#pricing .cv-p6-lead{margin:0;font:500 14px/1 var(--font-display,inherit);color:#fff}',
      '#pricing .cv-p6-feats ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}',
      '#pricing .cv-p6-feats li{display:flex;align-items:center;gap:12px;margin:0}',
      '#pricing .cv-p6-ck{flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:9999px;padding:4px;background:#fff;color:#000}',
      '#pricing .cv-p6-card.popular .cv-p6-ck{background:#2f6bff;color:#fff}',
      '#pricing .cv-p6-feats span{font-size:14px;color:#a3a3a3}',
      '#pricing .cv-p6-card.popular .cv-p6-feats span{color:#d4d4d4}',
      '@media (prefers-reduced-motion: reduce){#pricing .cv-p6-card.in{animation:none}}',
    ].join('\n');
    return s;
  }

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function buildToggle() {
    var wrap = el(
      '<div class="cv-p6-toggle">' +
        '<div class="cv-p6-switch" role="tablist" aria-label="Период оплаты">' +
          '<div class="cv-p6-thumb"></div>' +
          '<button type="button" data-cycle="monthly">Месяц</button>' +
          '<button type="button" data-cycle="annual">Год</button>' +
        '</div>' +
      '</div>');
    return wrap;
  }

  function buildCard(plan, index, cycle) {
    var priceHtml = plan.price
      ? '<div class="cv-p6-price"><b>$ <span class="cv-p6-num">' + plan.price[cycle] + '</span></b><small class="cv-p6-note">' + plan.note[cycle] + '</small></div>'
      : '';
    var badge = plan.popular ? '<div class="cv-p6-badge">Популярный</div>' : '';
    var card = el(
      '<div class="cv-p6-card' + (plan.popular ? ' popular' : '') + '" style="--cv-p6-d:' + (0.1 + index * 0.15).toFixed(2) + 's">' +
        '<div class="cv-p6-head"><h3>' + plan.name + '</h3>' + badge + '</div>' +
        priceHtml +
        '<p class="cv-p6-desc">' + plan.description + '</p>' +
        '<a class="cv-p6-btn" href="' + plan.href + '">' + plan.cta + '</a>' +
        '<div class="cv-p6-feats">' +
          '<p class="cv-p6-lead">Что включено:</p>' +
          '<ul>' + plan.features.map(function (f) {
            return '<li><span class="cv-p6-ck">' + CHECK + '</span><span>' + f + '</span></li>';
          }).join('') + '</ul>' +
        '</div>' +
      '</div>');
    return card;
  }

  function init() {
    var sec = document.getElementById('pricing');
    if (!sec || sec.dataset.p6 === 'real') return;
    var container = sec.querySelector('.mx-auto');
    if (!container) return;
    var grid = container.querySelector('ul');
    if (!grid) return;
    sec.dataset.p6 = 'real';

    document.head.appendChild(css());

    /* удаляем прежнюю сетку (SSR или порт pricing-1), сноску сохраняем */
    var footnote = null;
    var idx = Array.prototype.indexOf.call(container.children, grid);
    var toRemove = [grid];
    for (var i = idx + 1; i < container.children.length; i++) {
      var node = container.children[i];
      if (node.textContent && node.textContent.indexOf('Цены в USD') !== -1) { footnote = node; break; }
      toRemove.push(node);
    }
    toRemove.forEach(function (n) { n.remove(); });

    var state = { cycle: 'annual' }; /* сайт показывает годовые цены по умолчанию */
    var toggle = buildToggle();
    var cards = el('<div class="cv-p6-grid"></div>');

    function render() {
      cards.innerHTML = '';
      PLANS.forEach(function (plan, index) {
        cards.appendChild(buildCard(plan, index, state.cycle));
      });
      /* motion-входы карточек (stagger .15, delayChildren .1) */
      Array.prototype.forEach.call(cards.children, function (card) {
        if (REDUCED) { card.style.opacity = '1'; return; }
        requestAnimationFrame(function () { card.classList.add('in'); });
      });
    }

    function syncToggle() {
      var thumb = toggle.querySelector('.cv-p6-thumb');
      var btns = toggle.querySelectorAll('button');
      thumb.classList.toggle('annual', state.cycle === 'annual');
      Array.prototype.forEach.call(btns, function (b) {
        b.classList.toggle('on', b.dataset.cycle === state.cycle);
        b.setAttribute('aria-selected', b.dataset.cycle === state.cycle ? 'true' : 'false');
      });
    }

    toggle.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cycle]');
      if (!b || b.dataset.cycle === state.cycle) return;
      state.cycle = b.dataset.cycle;
      syncToggle();
      var nums = cards.querySelectorAll('.cv-p6-num');
      var notes = cards.querySelectorAll('.cv-p6-note');
      Array.prototype.forEach.call(nums, function (n, i) {
        if (PLANS[i].price) n.textContent = PLANS[i].price[state.cycle];
      });
      Array.prototype.forEach.call(notes, function (n, i) {
        if (PLANS[i].note) n.textContent = PLANS[i].note[state.cycle];
      });
    });

    syncToggle();
    render();
    container.insertBefore(toggle, footnote || null);
    container.insertBefore(cards, footnote || null);
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 1500);
  } else {
    window.addEventListener('load', function () { setTimeout(init, 1500); });
  }
})();
