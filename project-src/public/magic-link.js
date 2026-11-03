/* CIFRA Vault — демо механики приватности: magic-ссылка.
   Секция вставляется ПОСЛЕ гидрации (вне дерева vdom — как nav7),
   поэтому не влияет на гидрацию и не удаляется React.

   Механика демо:
   1. «Создать magic-ссылку» → токен, ссылка вида …#s/ТОКЕН (hash — работает
      на любом хосте, на проде красиво выглядит как vault.cifra.com/s/ТОКЕН).
   2. «Открыть как зритель» → та же страница с hash: работа раскрыта,
      промокод MAGIC-XXXX (детерминированно из токена), объяснение механики.
   3. «Закрыть доступ» → токен в localStorage-список отозванных: зритель
      по ссылке видит «Ссылка закрыта владельцем» — демонстрация контроля.
   4. При создании выбираются СРОК ЖИЗНИ (1/7/30 дней) и ЛИМИТ ОТКРЫТИЙ
      (1/5/без лимита) — мета в localStorage cv_magic_meta по токену
      {exp: epochMs|null, max: null|1|5, used: n}. Зритель: просроченная
      ссылка → «Срок действия истёк», исчерпан лимит → «Лимит исчерпан»,
      иначе работа раскрывается, used++. Ссылки без меты (до фичи) —
      без ограничений. */
(function () {
  'use strict';

  var TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
  var LS_LINK = 'cv_magic_link';
  var LS_REVOKED = 'cv_magic_revoked';
  var LS_META = 'cv_magic_meta';
  var DAY = 864e5;

  function randToken() {
    var t = '';
    for (var i = 0; i < 8; i++) t += TOKEN_ALPHABET[(Math.random() * TOKEN_ALPHABET.length) | 0];
    return t;
  }
  function promoOf(token) {
    return 'MAGIC-' + token.slice(0, 4).toUpperCase();
  }
  function getRevoked() {
    try { return JSON.parse(localStorage.getItem(LS_REVOKED) || '[]'); } catch (e) { return []; }
  }
  function isRevoked(token) { return getRevoked().indexOf(token) !== -1; }
  function revoke(token) {
    var r = getRevoked();
    if (r.indexOf(token) === -1) r.push(token);
    try { localStorage.setItem(LS_REVOKED, JSON.stringify(r)); } catch (e) {}
  }
  /* мета ссылки: {exp: epochMs|null, max: null|1|5, used: n} — по токену */
  function getMetas() {
    try { return JSON.parse(localStorage.getItem(LS_META) || '{}'); } catch (e) { return {}; }
  }
  function getMeta(token) {
    var m = getMetas();
    return m[token] || null;
  }
  function saveMeta(token, meta) {
    var m = getMetas();
    m[token] = meta;
    try { localStorage.setItem(LS_META, JSON.stringify(m)); } catch (e) {}
  }
  function fmtExp(exp) {
    try {
      return new Date(exp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } catch (e) { return ''; }
  }
  /* выбранное значение сегментного селектора внутри панели */
  function optVal(root, name) {
    var on = root.querySelector('.ml-chips[data-opt="' + name + '"] .ml-chip.on');
    return on ? on.getAttribute('data-v') : null;
  }

  var CHECK = '<span class="ml-circ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>';

  var CSS = [
    '.ml-wrap{scroll-margin-top:6rem;padding:6rem 0}',
    '@media(min-width:640px){.ml-wrap{padding:8rem 0}}',
    '.ml-inner{max-width:1440px;margin:0 auto;padding:0 1rem}',
    '@media(min-width:640px){.ml-inner{padding:0 1.5rem}}',
    '.ml-h2{max-width:48rem;font-family:var(--font-display,serif);font-size:clamp(2.25rem,4.5vw,3.5rem);line-height:1.02;letter-spacing:-.02em;text-wrap:balance}',
    '.ml-lead{margin-top:1.25rem;max-width:36rem;font-size:15px;line-height:1.75;color:var(--muted-foreground)}',
    '@media(min-width:640px){.ml-lead{font-size:16px}}',
    '.ml-steps{margin-top:3rem;display:grid;gap:1.25rem}',
    '@media(min-width:768px){.ml-steps{grid-template-columns:repeat(3,1fr)}}',
    '.ml-step{display:flex;gap:.9rem;align-items:flex-start}',
    '.ml-num{flex:none;width:2rem;height:2rem;border-radius:999px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600}',
    '.ml-step-t{font-size:15px;font-weight:600;line-height:1.4}',
    '.ml-step-d{margin-top:.2rem;font-size:13.5px;line-height:1.6;color:var(--muted-foreground)}',
    '.ml-card{margin-top:2.5rem;overflow:hidden;border-radius:.9rem;border:1px solid var(--border);background:var(--background)}',
    '.ml-stage{position:relative;width:100%;height:clamp(200px,45vw,420px);overflow:hidden;background:#0a0a0b}',
    '.ml-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:filter .7s ease,transform .7s ease}',
    '.ml-art.locked{filter:blur(22px) saturate(.7);transform:scale(1.06)}',
    '.ml-veil{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:rgba(0,0,0,.25);transition:opacity .5s ease}',
    '.ml-veil.hidden{opacity:0;pointer-events:none}',
    '.ml-lock{width:3.5rem;height:3.5rem;border-radius:999px;background:rgba(255,255,255,.1);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;color:#fff}',
    '.ml-veil-t{color:rgba(255,255,255,.85);font-size:14px;letter-spacing:.02em}',
    '.ml-badge{position:absolute;top:1rem;left:1rem;display:inline-flex;align-items:center;gap:.45rem;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;font-size:12.5px;padding:.4rem .85rem}',
    '.ml-badge-dot{width:.45rem;height:.45rem;border-radius:999px;background:#57e6a8}',
    '.ml-panel{padding:1.5rem}',
    '@media(min-width:640px){.ml-panel{padding:2rem}}',
    '.ml-url{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;border:1px solid var(--border);border-radius:.7rem;padding:.8rem 1rem;background:var(--background)}',
    '.ml-url-t{font-family:ui-monospace,monospace;font-size:13.5px;word-break:break-all;color:var(--foreground)}',
    '.ml-url-t b{color:var(--muted-foreground);font-weight:400}',
    '.ml-grow{flex:1 1 auto}',
    '.ml-btn{display:inline-flex;align-items:center;gap:.5rem;height:2.5rem;padding:0 1.1rem;border-radius:.65rem;font-size:14px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--background);color:var(--foreground);transition:opacity .2s;white-space:nowrap}',
    '.ml-btn:hover{opacity:.8}',
    '.ml-btn.primary{background:var(--foreground);color:var(--background);border-color:var(--foreground)}',
    '.ml-actions{margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:.6rem}',
    '.ml-opts{margin-top:1.25rem;display:grid;gap:1rem}',
    '@media(min-width:640px){.ml-opts{grid-template-columns:auto auto;justify-content:start;column-gap:2rem}}',
    '.ml-opt-l{display:block;font-size:13px;color:var(--muted-foreground);margin-bottom:.5rem}',
    '.ml-chips{display:inline-flex;gap:.4rem;flex-wrap:wrap}',
    '.ml-chip{height:2.15rem;padding:0 1rem;border-radius:999px;border:1px solid var(--border);background:var(--background);color:var(--muted-foreground);font:500 13px/1 var(--font-display,inherit);cursor:pointer;transition:background-color .2s,color .2s,border-color .2s}',
    '.ml-chip:hover{color:var(--foreground)}',
    '.ml-chip.on{background:var(--foreground);color:var(--background);border-color:var(--foreground)}',
    '.ml-params{margin-top:.9rem;font-size:13.5px;color:var(--muted-foreground)}',
    '.ml-params b{color:var(--foreground);font-weight:600}',
    '.ml-note{margin-top:1rem;font-size:13px;line-height:1.6;color:var(--muted-foreground);max-width:44rem}',
    '.ml-promo{margin-top:1.25rem;display:flex;flex-wrap:wrap;align-items:center;gap:.9rem;border:1px dashed var(--border);border-radius:.7rem;padding:1rem 1.25rem}',
    '.ml-promo-code{font-family:ui-monospace,monospace;font-size:1.15rem;font-weight:700;letter-spacing:.08em}',
    '.ml-circ{flex:none;width:1.25rem;height:1.25rem;border-radius:999px;background:color-mix(in srgb,var(--foreground) 10%,transparent);display:inline-flex;align-items:center;justify-content:center}',
    '.ml-cta{margin-top:1.25rem;display:inline-flex;align-items:center;gap:.5rem;height:2.75rem;padding:0 1.4rem;border-radius:.7rem;background:var(--foreground);color:var(--background);font-size:14.5px;font-weight:500;text-decoration:none}',
    '.ml-exp{margin-top:1.25rem;font-size:14px;line-height:1.7;color:var(--muted-foreground);max-width:44rem}',
    '.ml-revoked{margin-top:1.25rem;display:flex;align-items:center;gap:.7rem;color:var(--muted-foreground);font-size:14.5px}'
  ].join('\n');

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function viewerUrl(token) {
    return location.origin + location.pathname + '#s/' + token;
  }
  function displayUrl(token) {
    return 'vault.cifra.com/s/' + token;
  }

  function buildSection() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var sec = el(
      '<section id="magic" aria-labelledby="magic-heading">' +
        '<div class="ml-inner">' +
          '<h2 id="magic-heading" class="ml-h2">Попробуйте механику приватности — здесь и сейчас</h2>' +
          '<p class="ml-lead">Magic-ссылка открывает работу конкретному зрителю без регистрации и паролей. Создайте её, поделитесь — и по ссылке зритель увидит работу, промокод и то, как устроен контроль доступа.</p>' +
          '<div class="ml-steps">' +
            '<div class="ml-step"><span class="ml-num">1</span><div><div class="ml-step-t">Создайте magic-ссылку</div><div class="ml-step-d">Один клик — и работа доступна только по этой ссылке.</div></div></div>' +
            '<div class="ml-step"><span class="ml-num">2</span><div><div class="ml-step-t">Поделитесь работой</div><div class="ml-step-d">Отправьте ссылку коллекционеру, куратору или другу.</div></div></div>' +
            '<div class="ml-step"><span class="ml-num">3</span><div><div class="ml-step-t">По ссылке — работа и промокод</div><div class="ml-step-d">Зритель видит работу, промокод и объяснение механики приватности.</div></div></div>' +
          '</div>' +
          '<div class="ml-card">' +
            '<div class="ml-stage">' +
              '<img class="ml-art locked" src="/reel-art-1.jpg" alt="Цифровое произведение из коллекции — демо доступа по magic-ссылке.">' +
              '<span class="ml-badge" hidden><span class="ml-badge-dot"></span><span class="ml-badge-t">Доступ открыт по magic-ссылке</span></span>' +
              '<div class="ml-veil">' +
                '<span class="ml-lock"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>' +
                '<span class="ml-veil-t">Работа скрыта — доступ только по ссылке</span>' +
              '</div>' +
            '</div>' +
            '<div class="ml-panel"></div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );

    var panel = sec.querySelector('.ml-panel');
    var art = sec.querySelector('.ml-art');
    var veil = sec.querySelector('.ml-veil');
    var badge = sec.querySelector('.ml-badge');

    function renderOwner() {
      var token = null;
      try { token = localStorage.getItem(LS_LINK); } catch (e) {}
      if (!token) {
        panel.innerHTML =
          '<div class="ml-opts">' +
            '<div class="ml-opt"><span class="ml-opt-l">Срок жизни ссылки</span>' +
              '<div class="ml-chips" data-opt="ttl">' +
                '<button type="button" class="ml-chip" data-v="1">1 день</button>' +
                '<button type="button" class="ml-chip on" data-v="7">7 дней</button>' +
                '<button type="button" class="ml-chip" data-v="30">30 дней</button>' +
              '</div></div>' +
            '<div class="ml-opt"><span class="ml-opt-l">Количество открытий</span>' +
              '<div class="ml-chips" data-opt="max">' +
                '<button type="button" class="ml-chip" data-v="1">1</button>' +
                '<button type="button" class="ml-chip" data-v="5">5</button>' +
                '<button type="button" class="ml-chip on" data-v="0">Без лимита</button>' +
              '</div></div>' +
          '</div>' +
          '<div class="ml-actions">' +
            '<button type="button" class="ml-btn primary" data-act="create">Создать magic-ссылку</button>' +
          '</div>' +
          '<p class="ml-note">Демо работает без регистрации. Ссылку можно открыть на любом устройстве — срок и лимит работают по-настоящему: истёкшая ссылка и исчерпанный лимит покажут зрителю закрытый доступ.</p>';
      } else {
        var url = viewerUrl(token);
        var meta = getMeta(token);
        var params = '';
        if (meta) {
          var ttlTxt = meta.exp ? 'до ' + fmtExp(meta.exp) : 'без срока';
          var usedTxt = meta.used || 0;
          var maxTxt = meta.max ? usedTxt + ' из ' + meta.max : usedTxt + ' (без лимита)';
          params = '<p class="ml-params">Срок: <b>' + ttlTxt + '</b> &nbsp;·&nbsp; Открытий: <b>' + maxTxt + '</b></p>';
        }
        panel.innerHTML =
          '<div class="ml-url"><span class="ml-url-t"><b>https://</b>' + displayUrl(token) + '</span><span class="ml-grow"></span>' +
            '<button type="button" class="ml-btn" data-act="copy">Копировать</button>' +
            '<a class="ml-btn primary" href="' + url + '" target="_blank" rel="noreferrer">Открыть как зритель</a>' +
          '</div>' +
          params +
          '<div class="ml-actions">' +
            '<button type="button" class="ml-btn" data-act="new">Новая ссылка</button>' +
            '<button type="button" class="ml-btn" data-act="revoke">Закрыть доступ</button>' +
          '</div>' +
          '<p class="ml-note">Ссылка живёт до конца срока или пока вы её не закроете — что наступит раньше. Каждое открытие по ссылке считается. Так владелец коллекции управляет каждым просмотром.</p>';
      }
      art.classList.add('locked');
      veil.classList.remove('hidden');
      badge.hidden = true;
    }

    function renderViewer(token) {
      var promo = promoOf(token);
      /* общий «закрытый» вид: работа скрыта, причина — в заголовке */
      function closedView(title, note) {
        panel.innerHTML =
          '<div class="ml-revoked">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
            '<span>' + title + '</span>' +
          '</div>' +
          '<p class="ml-note">' + note + '</p>' +
          '<a class="ml-cta" href="#pricing">Попробовать в CIFRA Vault — бесплатно</a>';
        art.classList.add('locked');
        veil.classList.remove('hidden');
        badge.hidden = true;
      }
      if (isRevoked(token)) {
        closedView(
          'Ссылка закрыта владельцем. Доступ можно открыть снова — или оставить коллекцию приватной.',
          'Это и есть контроль доступа: владелец решает, кто видит работу, — в один клик, без паролей и пересылки файлов.'
        );
        return;
      }
      var meta = getMeta(token);
      if (meta && meta.exp && Date.now() > meta.exp) {
        closedView(
          'Срок действия ссылки истёк' + (meta.exp ? ' (' + fmtExp(meta.exp) + ')' : '') + '. Владелец может создать новую ссылку за минуту.',
          'Доступ по ссылке ограничен во времени: после окончания срока работа снова приватна. Полный контроль у владельца коллекции.'
        );
        return;
      }
      if (meta && meta.max && (meta.used || 0) >= meta.max) {
        closedView(
          'Лимит открытий исчерпан (' + meta.max + ' из ' + meta.max + '). Попросите владельца открыть доступ снова.',
          'Ссылка с ограниченным числом просмотров: после последнего открытия доступ автоматически закрывается.'
        );
        return;
      }
      /* успешное открытие — считаем просмотр */
      if (meta) {
        meta.used = (meta.used || 0) + 1;
        saveMeta(token, meta);
      }
      panel.innerHTML =
        '<div class="ml-promo"><span class="ml-promo-code">' + promo + '</span><span class="ml-grow"></span>' +
          '<button type="button" class="ml-btn" data-act="copy-promo">Скопировать промокод</button>' +
        '</div>' +
        '<p class="ml-note">Промокод на бесплатный месяц — активируйте при регистрации в CIFRA Vault.</p>' +
        '<p class="ml-exp">Владелец открыл вам доступ к этой работе одной ссылкой — вы ничего не скачивали, нигде не регистрировались. Закрыть доступ он может в один клик. Так работает гибкий контроль доступа: от полной приватности до полной публичности с роялти.</p>' +
        '<a class="ml-cta" href="#pricing">Начать бесплатно</a>';
      art.classList.remove('locked');
      veil.classList.add('hidden');
      badge.hidden = false;
    }

    panel.addEventListener('click', function (e) {
      /* сегментные селекторы срока/лимита */
      var chip = e.target.closest('.ml-chip');
      if (chip) {
        var group = chip.closest('.ml-chips');
        if (group) {
          group.querySelectorAll('.ml-chip').forEach(function (c) { c.classList.remove('on'); });
          chip.classList.add('on');
        }
        return;
      }
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      var token;
      if (act === 'new') {
        /* «Новая ссылка» → экран создания с выбором срока и лимита */
        try { localStorage.removeItem(LS_LINK); } catch (err) {}
        renderOwner();
        return;
      }
      if (act === 'create') {
        var ttl = optVal(panel, 'ttl');
        var max = optVal(panel, 'max');
        token = randToken();
        try { localStorage.setItem(LS_LINK, token); } catch (err) {}
        saveMeta(token, {
          exp: ttl ? Date.now() + (+ttl) * DAY : null,
          max: max ? +max : null,
          used: 0
        });
        renderOwner();
        var urlT = panel.querySelector('.ml-url-t');
        if (urlT) urlT.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (act === 'copy') {
        token = localStorage.getItem(LS_LINK);
        if (token) copyText(viewerUrl(token), btn);
      } else if (act === 'copy-promo') {
        var m = location.hash.match(/^#s\/([a-z2-9]{8})$/);
        if (m) copyText(promoOf(m[1]), btn);
      } else if (act === 'revoke') {
        token = localStorage.getItem(LS_LINK);
        if (token) revoke(token);
        try { localStorage.removeItem(LS_LINK); } catch (err) {}
        renderOwner();
      }
    });

    // режим: владелец или зритель по ссылке
    var m = location.hash.match(/^#s\/([a-z2-9]{8})$/);
    if (m) {
      renderViewer(m[1]);
      setTimeout(function () {
        sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 600);
    } else {
      renderOwner();
    }

    return sec;
  }

  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = 'Скопировано';
      setTimeout(function () { btn.textContent = old; }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      ta.remove();
    }
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      var anchor = document.querySelector('main section[aria-labelledby="nonstandard-heading"]');
      if (!anchor) return;
      anchor.parentNode.insertBefore(buildSection(), anchor);
    }, 1400);
  });
})();
