/* CIFRA Vault — Navigation 7 (React Bits Pro navigation-7, ручной порт)
   «Rounded top nav with dropdowns»: плавающая скруглённая тёмная панель,
   пилюли с мега-дропдаунами (hover/клик), справа auth + CTA.
   Панель вешается на document.body ВНЕ корня React — конфликтов
   гидрации нет в принципе. Старый header скрывается (см. <style> в index.html). */
(function () {
  'use strict';

  var MENUS = [
    {
      label: 'Возможности', href: '#features', tag: 'ХРАНИЛИЩЕ',
      items: [
        { t: 'Хранение оригиналов', d: 'Файлы как есть — без пережатия и потерь качества', h: '#features' },
        { t: 'Верификация и провенанс', d: 'Криптографическая подпись и непрерывная история владения', h: '#features' },
        { t: 'Нестандартное хранение', d: 'Генеративный арт, гейм-арт, код и сцены', h: '#nonstandard' },
        { t: 'Мобильное приложение', d: 'Вся коллекция под контролем — iOS, Android, веб', h: '#apps-heading' },
        { t: 'Механика приватности — демо', d: 'Создайте magic-ссылку, поделитесь работой, получите промокод', h: '#magic' },
        { t: 'Для институций', d: 'Музеи, галереи и фонды — хранение и контроль доступа коллекции', h: '#institutions' }
      ]
    },
    {
      label: 'Стандарты', href: '#benchmarks', tag: 'МУЗЕЙНЫЙ СТАНДАРТ',
      items: [
        { t: 'Стандарт 3-2-1', d: 'Три копии, два носителя, один офлайн', h: '#benchmarks' },
        { t: 'Форматы', d: 'TIFF, RAW, 16-бит, ProRes и звук без потерь', h: '#formats-heading' },
        { t: 'Факты о нас', d: '240 ТБ под защитой, 6 500 работ, доступность 99,9%', h: '#benchmarks' }
      ]
    },
    {
      label: 'Истории', href: '#stories', tag: 'КЕЙСЫ',
      items: [
        { t: 'Сделка за 5 минут', d: 'Передача прав новому владельцу без бумажной волокиты', h: '#stories' },
        { t: 'Роялти с каждого просмотра', d: 'Доход художника при каждом платном просмотре', h: '#stories' },
        { t: 'Архив без потерь', d: 'Носители меняются, подлинник остаётся', h: '#stories' }
      ]
    },
    { label: 'Тарифы', href: '#pricing' }
  ];

  var LOGO_SVG = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="16" height="16" rx="4"></rect><path d="M10 5.5 14.5 10 10 14.5 5.5 10Z" fill="currentColor" stroke="none"></path></svg>';
  var CHEVRON = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var BURGER = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  var CSS = [
    '.nav7-wrap{position:fixed;inset-inline:0;top:0;z-index:100;display:flex;justify-content:center;padding:16px 16px 0;pointer-events:none;font-family:inherit}',
    '.nav7-bar{pointer-events:auto;display:flex;align-items:center;gap:4px;height:52px;padding:0 6px 0 6px;border-radius:999px;background:rgba(14,14,16,.92);border:1px solid rgba(255,255,255,.09);box-shadow:0 16px 44px -16px rgba(0,0,0,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#fafafa;max-width:calc(100vw - 32px)}',
    '.nav7-logo{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:#fff;color:#101012;flex:none;transition:transform .25s cubic-bezier(.22,1,.36,1)}',
    '.nav7-logo:hover{transform:scale(1.06)}',
    '.nav7-pill{position:relative;display:inline-flex;align-items:center;gap:5px;height:38px;padding:0 15px;border-radius:999px;font-size:13.5px;font-weight:500;color:rgba(250,250,250,.72);text-decoration:none;white-space:nowrap;cursor:pointer;background:transparent;border:0;font-family:inherit;transition:color .2s,background-color .2s}',
    '.nav7-pill:hover,.nav7-pill:focus-visible{color:#fff;background:rgba(255,255,255,.08)}',
    '.nav7-pill:focus-visible{outline:2px solid rgba(255,255,255,.5);outline-offset:2px}',
    '.nav7-pill .nav7-chev{opacity:.45;transition:transform .25s}',
    '.nav7-pill[aria-expanded="true"]{color:#fff;background:rgba(255,255,255,.1)}',
    '.nav7-pill[aria-expanded="true"] .nav7-chev{transform:rotate(180deg)}',
    '.nav7-panel{position:absolute;top:calc(100% + 10px);left:0;min-width:300px;border-radius:18px;background:rgba(18,18,21,.97);border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 70px -20px rgba(0,0,0,.7);padding:20px;opacity:0;transform:translateY(8px) scale(.98);transform-origin:top left;pointer-events:none;transition:opacity .22s cubic-bezier(.22,1,.36,1),transform .22s cubic-bezier(.22,1,.36,1)}',
    '.nav7-panel.open{opacity:1;transform:none;pointer-events:auto}',
    '.nav7-panel-wide{width:520px}',
    '.nav7-tag{display:block;font-size:10.5px;font-weight:600;letter-spacing:.14em;color:rgba(250,250,250,.38);margin:0 0 14px 2px}',
    '.nav7-grid{display:grid;grid-template-columns:1fr;gap:14px 28px}',
    '.nav7-panel-wide .nav7-grid{grid-template-columns:1fr 1fr;gap:16px 28px}',
    '.nav7-item{display:block;text-decoration:none;padding:6px 8px;margin:-6px -8px;border-radius:10px;transition:background-color .18s}',
    '.nav7-item:hover{background:rgba(255,255,255,.06)}',
    '.nav7-item-t{display:block;font-size:13.5px;font-weight:500;color:#fff;margin-bottom:3px}',
    '.nav7-item-d{display:block;font-size:12.5px;line-height:1.45;color:rgba(250,250,250,.5)}',
    '.nav7-right{margin-left:8px;display:flex;align-items:center;gap:4px}',
    '.nav7-ghost{display:inline-flex;align-items:center;height:38px;padding:0 15px;border-radius:999px;font-size:13.5px;font-weight:500;color:rgba(250,250,250,.72);text-decoration:none;white-space:nowrap;transition:color .2s,background-color .2s}',
    '.nav7-ghost:hover{color:#fff;background:rgba(255,255,255,.08)}',
    '.nav7-cta{display:inline-flex;align-items:center;height:38px;padding:0 18px;border-radius:999px;background:#fff;color:#101012;font-size:13.5px;font-weight:600;text-decoration:none;white-space:nowrap;transition:transform .2s cubic-bezier(.22,1,.36,1),opacity .2s}',
    '.nav7-cta:hover{transform:scale(1.03)}',
    '.nav7-sep{width:1px;height:22px;background:rgba(255,255,255,.12);margin:0 6px;flex:none}',
    '.nav7-burger{display:none;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;color:rgba(250,250,250,.8);background:transparent;border:0;cursor:pointer;transition:background-color .2s}',
    '.nav7-burger:hover{background:rgba(255,255,255,.08);color:#fff}',
    '.nav7-mobile{display:none;position:absolute;top:calc(100% + 10px);left:0;right:0;border-radius:18px;background:rgba(18,18,21,.98);border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 70px -20px rgba(0,0,0,.7);padding:10px;opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .22s,transform .22s}',
    '.nav7-mobile.open{opacity:1;transform:none;pointer-events:auto}',
    '.nav7-m-link{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;border-radius:12px;font-size:15px;font-weight:500;color:#fafafa;text-decoration:none;background:transparent;border:0;cursor:pointer;font-family:inherit;text-align:left}',
    '.nav7-m-link:hover{background:rgba(255,255,255,.07)}',
    '.nav7-m-sub{overflow:hidden;max-height:0;transition:max-height .3s cubic-bezier(.22,1,.36,1)}',
    '.nav7-m-sub.open{max-height:600px}',
    '.nav7-m-sub a{display:block;padding:9px 14px 9px 26px;font-size:13.5px;color:rgba(250,250,250,.65);text-decoration:none;border-radius:10px}',
    '.nav7-m-sub a:hover{background:rgba(255,255,255,.06);color:#fff}',
    '.nav7-m-cta{display:block;margin:8px 6px 4px;padding:13px;border-radius:12px;background:#fff;color:#101012;font-size:14px;font-weight:600;text-decoration:none;text-align:center}',
    '@media (max-width: 820px){',
    '  .nav7-pill,.nav7-ghost,.nav7-sep{display:none}',
    '  .nav7-burger{display:inline-flex}',
    '  .nav7-mobile{display:block}',
    '  .nav7-wrap{padding-top:12px}',
    '}',
    '@media (prefers-reduced-motion: reduce){',
    '  .nav7-panel,.nav7-mobile,.nav7-pill .nav7-chev{transition:none}',
    '}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'nav7-css';
  style.textContent = CSS;
  document.head.appendChild(style);

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var wrap = el('nav', 'nav7-wrap');
  wrap.setAttribute('aria-label', 'Основная навигация');
  var bar = el('div', 'nav7-bar');

  // логотип
  var logo = el('a', 'nav7-logo', LOGO_SVG);
  logo.href = '#top';
  logo.setAttribute('aria-label', 'CIFRA Vault — на главную');
  bar.appendChild(logo);

  var openPanel = null;
  var closeTimer = 0;

  function closeAll() {
    if (openPanel) {
      openPanel.classList.remove('open');
      var b = openPanel._trigger;
      if (b) b.setAttribute('aria-expanded', 'false');
      openPanel = null;
    }
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    [].forEach.call(mobileMenu.querySelectorAll('.nav7-m-sub'), function (s) { s.classList.remove('open'); });
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeAll, 140);
  }
  function cancelClose() {
    clearTimeout(closeTimer);
  }

  // пункты с дропдаунами и простые ссылки
  MENUS.forEach(function (m) {
    if (!m.items) {
      var a = el('a', 'nav7-pill', m.label);
      a.href = m.href;
      bar.appendChild(a);
      return;
    }
    var holder = el('div');
    holder.style.position = 'relative';
    var pill = el('button', 'nav7-pill', m.label + ' <span class="nav7-chev">' + CHEVRON + '</span>');
    pill.type = 'button';
    pill.setAttribute('aria-expanded', 'false');
    pill.setAttribute('aria-haspopup', 'true');

    var panel = el('div', 'nav7-panel' + (m.items.length > 3 ? ' nav7-panel-wide' : ''));
    panel.setAttribute('role', 'menu');
    var tag = el('span', 'nav7-tag', m.tag || '');
    panel.appendChild(tag);
    var grid = el('div', 'nav7-grid');
    m.items.forEach(function (it) {
      var a = el('a', 'nav7-item', '<span class="nav7-item-t">' + it.t + '</span><span class="nav7-item-d">' + it.d + '</span>');
      a.href = it.h;
      grid.appendChild(a);
    });
    panel.appendChild(grid);
    panel._trigger = pill;

    pill.addEventListener('mouseenter', function () {
      cancelClose();
      if (openPanel && openPanel !== panel) {
        openPanel.classList.remove('open');
        openPanel._trigger.setAttribute('aria-expanded', 'false');
      }
      panel.classList.add('open');
      pill.setAttribute('aria-expanded', 'true');
      openPanel = panel;
    });
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      cancelClose();
      var willOpen = !panel.classList.contains('open');
      if (openPanel && openPanel !== panel) {
        openPanel.classList.remove('open');
        openPanel._trigger.setAttribute('aria-expanded', 'false');
      }
      panel.classList.toggle('open', willOpen);
      pill.setAttribute('aria-expanded', String(willOpen));
      openPanel = willOpen ? panel : null;
    });
    pill.addEventListener('focus', function () {
      cancelClose();
      if (openPanel && openPanel !== panel) openPanel.classList.remove('open');
      panel.classList.add('open');
      pill.setAttribute('aria-expanded', 'true');
      openPanel = panel;
    });
    panel.addEventListener('mouseenter', cancelClose);
    panel.addEventListener('mouseleave', scheduleClose);
    pill.addEventListener('mouseleave', scheduleClose);
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeAll();
    });

    holder.appendChild(pill);
    holder.appendChild(panel);
    bar.appendChild(holder);
  });

  // правая часть
  var right = el('div', 'nav7-right');
  var sep = el('span', 'nav7-sep');
  var login = el('a', 'nav7-ghost', 'Войти');
  login.href = 'https://vault.cifra.com/login';
  var cta = el('a', 'nav7-cta', 'Начать бесплатно');
  cta.href = '#pricing';

  var burger = el('button', 'nav7-burger', BURGER);
  burger.type = 'button';
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Меню');

  var mobileMenu = el('div', 'nav7-mobile');
  MENUS.forEach(function (m) {
    if (!m.items) {
      var a = el('a', 'nav7-m-link', m.label);
      a.href = m.href;
      mobileMenu.appendChild(a);
      return;
    }
    var btn = el('button', 'nav7-m-link', '<span>' + m.label + '</span><span class="nav7-chev">' + CHEVRON + '</span>');
    btn.type = 'button';
    var sub = el('div', 'nav7-m-sub');
    m.items.forEach(function (it) {
      var ia = el('a', null, it.t);
      ia.href = it.h;
      sub.appendChild(ia);
    });
    btn.addEventListener('click', function () { sub.classList.toggle('open'); });
    mobileMenu.appendChild(btn);
    mobileMenu.appendChild(sub);
  });
  var mCta = el('a', 'nav7-m-cta', 'Начать бесплатно');
  mCta.href = '#pricing';
  mobileMenu.appendChild(mCta);

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    var willOpen = !mobileMenu.classList.contains('open');
    closeAll();
    mobileMenu.classList.toggle('open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
  });

  right.appendChild(sep);
  right.appendChild(login);
  right.appendChild(cta);
  right.appendChild(burger);
  bar.appendChild(right);
  wrap.appendChild(bar);
  wrap.appendChild(mobileMenu);
  document.body.appendChild(wrap);

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav7-bar') && !e.target.closest('.nav7-mobile')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) mobileMenu.classList.remove('open');
  });

  // подписываемся на якорные переходы: плавный скролл для ссылок nav7
  wrap.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeAll();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
})();
