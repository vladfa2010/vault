/* ============================================================
   CIFRA Vault — порядок секций (патч без пересборки).
   CTA «Ваше искусство — под защитой музейного стандарта»
   перемещается НАД секцией #benchmarks («Надежнее, чем жесткий
   диск в вашем сейфе»). Перестановка делается скриптом ПОСЛЕ
   гидрации: правка статического HTML ломает гидрацию React
   (#418 — клиентское дерево не совпало с серверным, React
   восстанавливает свой порядок и затирает правку).
   ============================================================ */
(function () {
  'use strict';

  function move() {
    var main = document.querySelector('main');
    var cta = document.querySelector('section[aria-labelledby="cta-heading"]');
    var benchmarks = document.querySelector('#benchmarks');
    if (!main || !cta || !benchmarks) return;
    if (cta.dataset.cvOrder === 'moved') return;
    if (cta.nextElementSibling === benchmarks) {
      cta.dataset.cvOrder = 'moved';
      return;
    }
    main.insertBefore(cta, benchmarks);
    cta.dataset.cvOrder = 'moved';
  }

  function boot() {
    setTimeout(move, 1500);
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot, { once: true });
})();
