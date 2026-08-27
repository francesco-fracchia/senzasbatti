/* Senzasbatti — un solo movimento per schermata. Nessuna libreria. */
(function () {
  'use strict';
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('DOMContentLoaded', function () {
    /* rivelazione del titolo: unico movimento della prima schermata */
    requestAnimationFrame(function () { document.body.classList.add('ready'); });
    setTimeout(function () { document.body.classList.add('ready'); }, 1200);

    /* se una foto reale e' presente, nasconde il segnaposto */
    document.querySelectorAll('.ph').forEach(function (p) {
      if (p.querySelector('img')) p.classList.add('has');
    });

    /* preselezione della meta dal pulsante */
    var sel = document.getElementById('f-meta');
    document.querySelectorAll('[data-meta]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!sel) return;
        var v = b.getAttribute('data-meta');
        for (var i = 0; i < sel.options.length; i++)
          if (sel.options[i].value.indexOf(v) === 0) { sel.selectedIndex = i; break; }
      });
    });

    /* ---------- scorrimento morbido ----------
       Attivo solo su puntatore fine, senza preferenza di moto ridotto, e solo
       finche' il browser consegna davvero i frame: se rAF si ferma (scheda in
       secondo piano, risparmio energetico, pannelli di anteprima) si disattiva
       da solo e restituisce lo scorrimento nativo, invece di bloccare la pagina. */
    (function () {
      /* interruttore: aggiungi ?smooth=off all'indirizzo per confrontare con lo scorrimento nativo */
      var q = new URLSearchParams(location.search).get('smooth');
      if (q === 'off') { try { localStorage.setItem('ss-smooth', 'off'); } catch (e) {} }
      if (q === 'on') { try { localStorage.removeItem('ss-smooth'); } catch (e) {} }
      var pref = null; try { pref = localStorage.getItem('ss-smooth'); } catch (e) {}
      if (pref === 'off') return;

      if (REDUCED) return;
      if (!matchMedia('(pointer:fine)').matches) return;
      if (matchMedia('(hover:none)').matches) return;

      var docEl = document.documentElement;
      var target = window.scrollY, current = target;
      var running = false, dead = false, lastSet = -1, lastTick = 0;
      var EASE = 0.16;

      function maxY() { return Math.max(0, docEl.scrollHeight - window.innerHeight); }

      function kill() {                       /* restituisce tutto al browser */
        dead = true; running = false;
        docEl.style.scrollBehavior = '';
      }

      function loop(ts) {
        if (dead) return;
        lastTick = ts;
        var d = target - current;
        if (Math.abs(d) < 0.4) { current = target; running = false; return; }
        current += d * EASE;
        lastSet = Math.round(current);
        window.scrollTo(0, current);
        requestAnimationFrame(loop);
      }

      function start() {
        if (dead || running) return;
        running = true;
        var asked = performance.now();
        requestAnimationFrame(loop);
        /* se entro 300 ms non e' arrivato un frame, il browser non sta animando */
        setTimeout(function () {
          if (!dead && lastTick < asked) { kill(); window.scrollTo(0, target); }
        }, 300);
      }

      addEventListener('wheel', function (e) {
        if (dead || e.ctrlKey || document.hidden) return;   /* zoom e schede nascoste: nativo */
        if (maxY() <= 0) return;                            /* niente da scorrere qui: lascia salire l'evento */
        e.preventDefault();
        var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
        target = Math.min(Math.max(target + dy, 0), maxY());
        start();
      }, { passive: false });

      /* riallinea quando lo scorrimento non e' nostro: barra, tastiera, ricerca */
      addEventListener('scroll', function () {
        if (running && Math.abs(window.scrollY - lastSet) <= 2) return;
        target = current = window.scrollY;
      }, { passive: true });

      addEventListener('resize', function () { target = Math.min(target, maxY()); }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { running = false; }
        else { target = current = window.scrollY; }
      });

      /* ancore interne */
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id === '#' || id.length < 2) return;
          var el = document.querySelector(id);
          if (!el) return;
          var head = document.querySelector('header.site');
          var off = head ? head.getBoundingClientRect().height : 0;
          var to = Math.min(Math.max(window.scrollY + el.getBoundingClientRect().top - off, 0), maxY());
          if (dead) return;                      /* lascia fare al browser */
          e.preventDefault();
          target = to; start();
          history.replaceState(null, '', id);
          el.setAttribute('tabindex', '-1');
          setTimeout(function () { el.focus({ preventScroll: true }); }, 400);
        });
      });

      docEl.style.scrollBehavior = 'auto';
    })();

    /* ---------- totale dei servizi opzionali ---------- */
    document.querySelectorAll('.card').forEach(function (card) {
      var out = card.querySelector('.val');
      if (!out) return;
      var base = parseInt(out.getAttribute('data-base'), 10) || 0;
      var boxes = card.querySelectorAll('.opt input[type=checkbox]');
      function calc() {
        var tot = base;
        boxes.forEach(function (b) { if (b.checked) tot += parseInt(b.getAttribute('data-p'), 10) || 0; });
        out.textContent = '\u20AC ' + tot;
        card.setAttribute('data-tot', tot);
      }
      boxes.forEach(function (b) { b.addEventListener('change', calc); });
      calc();
    });

    /* moduli -> WhatsApp */
    var NUMERO = '393000000000';   /* <- sostituire con il numero reale */
    var f1 = document.getElementById('richiesta-form');
    if (f1) f1.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('f-note').value.trim();
      var t = 'Ciao Senzasbatti! Sono ' + document.getElementById('f-nome').value.trim() + '.' +
        '\nMeta: ' + sel.options[sel.selectedIndex].text +
        (window.__tot ? '\nConfigurazione: ' + window.__tot + ' a testa' : '') +
        '\nSiamo circa ' + document.getElementById('f-pax').value.trim() + ' persone.' +
        (n ? '\n' + n : '') + '\nCi sono ancora posti?';
      open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });

    var f2 = document.getElementById('partner-form');
    if (f2) f2.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('p-note').value.trim();
      var t = 'Buongiorno, vi scrivo dalla pagina Senzasbatti per le strutture.' +
        '\n' + document.getElementById('p-nome').value.trim() +
        '\nZona: ' + document.getElementById('p-zona').value.trim() +
        '\nPosti letto: ' + document.getElementById('p-posti').value.trim() +
        '\nStrutture gestite: ' + document.getElementById('p-quante').value + (n ? '\n' + n : '');
      open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
  });
})();
