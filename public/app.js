/* Potensverkstaden — grundpotensform och prefix, matematik åk 7–9.
   En mekanik: välj siffran framför tian, stega exponenten, tryck Kolla.
   Ingen tid, inga liv, fel svar kostar ingen stjärna. */
(function () {
  'use strict';
  var S = {
    ljud: true, niva: 1, index: 0, stjarnor: 0, totala: 0,
    siffra: null, exp: 0, expSatt: false, forsta: true,
    kollat: 0, last: false, rader: []
  };
  window.__pv = S;

  function dt() {
    var p = S.rader[S.index]; if (!p) return null;
    return p;
  }

  var $ = function (s) { return document.querySelector(s); };
  var el = {
    start: $('#startskarm'), spel: $('#spel'), fraga: $('#fraga'),
    fragTexte: $('#fragTexte'), talStort: $('#talStort'), talPre: $('#talPre'),
    slot: $('#siffraSlot'), expTal: $('#expTal'), expUpp: $('#expUpp'), expNer: $('#expNer'),
    enhet: $('#enhet'), kolla: $('#kolla'), alt: $('#alternativ'),
    aterkoppling: $('#aterkoppling'), visning: $('#visning'),
    nivaText: $('#nivaText'), stjarnText: $('#stjarnText'), prickar: $('#prickar'),
    klart: $('#klart'), klartTitel: $('#klartTitel'), klartText: $('#klartText'),
    klartStjarnor: $('#klartStjarnor'), klartKnapp: $('#klartKnapp'), klartIgen: $('#klartIgen'),
    ljud: $('#ljud'), framsteg: $('#framsteg'), kotten: $('#kotten')
  };
  var reducerad = false;
  try { reducerad = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- ljud ---------- */
  var ljudCtx = null;
  function blipp(freq, slag, tid, volym) {
    if (!S.ljud) return;
    try {
      if (!ljudCtx) ljudCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ljudCtx.createOscillator(), g = ljudCtx.createGain();
      o.type = slag || 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ljudCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(volym || 0.14, ljudCtx.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, ljudCtx.currentTime + (tid || 0.2));
      o.connect(g); g.connect(ljudCtx.destination);
      o.start(); o.stop(ljudCtx.currentTime + (tid || 0.2) + 0.03);
    } catch (e) {}
  }
  function tal(text) {
    if (!S.ljud) return;
    try { if (typeof window.__rost === 'function' && window.__rost(text)) return; } catch (e) {}
        console.warn('saknar mp3:', text);
  }
  window.addEventListener('pointerdown', function enGang() {
    try { if (ljudCtx && ljudCtx.state === 'suspended') ljudCtx.resume(); } catch (e) {}
    window.removeEventListener('pointerdown', enGang);
  });

  /* ---------- Kotten ---------- */
  function kottenSvg(slag) {
    var kunskap = {
      glad:      { ov: 0,  mun: 'le'   },
      funderar:  { ov: 1,  mun: 'krok' },
      firar:     { ov: -1, mun: 'gap'  },
      nyfiken:   { ov: -1, mun: 'o'    },
      imponerad: { ov: 0,  mun: 'le'   }
    };
    var t = kunskap[slag] || kunskap.glad;
    var spridd = t.ov === 1 ? 4 : 0;
    var mun = t.mun;
    return '' +
      '<ellipse cx="60" cy="86" rx="38" ry="42" fill="#8C5A34"/>' +
      '<path d="M26 96 q34 -14 68 0" stroke="#6E4225" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M30 78 q30 -13 60 0" stroke="#6E4225" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M36 62 q24 -11 48 0" stroke="#6E4225" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M44 122 q16 -7 32 0" stroke="#6E4225" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      (slag === 'imponerad' ? '<path d="M60 34 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2z" fill="#E9B23C"/>' : '') +
      '<circle cx="46" cy="66" r="13" fill="#FFFDF7" stroke="#3A2718" stroke-width="3"/>' +
      '<circle cx="76" cy="66" r="13" fill="#FFFDF7" stroke="#3A2718" stroke-width="3"/>' +
      '<circle cx="' + (46 + (slag === 'nyfiken' ? 4 : 0)) + '" cy="' + (66 + (t.ov === 1 ? 3 : 0)) + '" r="6" fill="#222"/>' +
      '<circle cx="' + (76 + (slag === 'nyfiken' ? 4 : 0)) + '" cy="' + (66 + (t.ov === 1 ? 3 : 0)) + '" r="6" fill="#222"/>' +
      '<path d="M33 ' + (52 - spridd) + ' q13 -7 25 ' + (t.ov > 0 ? 5 : (t.ov < 0 ? -4 : 0)) + '" stroke="#3A2718" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M89 ' + (52 - spridd) + ' q-13 -7 -25 ' + (t.ov > 0 ? 5 : (t.ov < 0 ? -4 : 0)) + '" stroke="#3A2718" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      (mun === 'le'   ? '<path d="M46 86 q14 14 28 0" stroke="#3A2718" stroke-width="4.5" fill="none" stroke-linecap="round"/>' : '') +
      (mun === 'o'    ? '<ellipse cx="60" cy="88" rx="7" ry="9" fill="#3A2718"/>' : '') +
      (mun === 'krok' ? '<path d="M47 90 q8 -7 16 1 q5 5 11 -2" stroke="#3A2718" stroke-width="4.5" fill="none" stroke-linecap="round"/>' : '') +
      (mun === 'gap'  ? '<path d="M44 82 q16 24 32 0 z" fill="#3A2718"/>' : '');
  }
  function sattKotten(slag) { el.kotten.innerHTML = kottenSvg(slag); }

  /* ---------- tal och text ---------- */
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) {
    return String(n).split('').map(function (c) { return SUP[c] || c; }).join('');
  }
  function krivTal(siffra, exp) {
    return siffra + ' × 10' + sup(exp);
  }
  /* 6,8 -> 68 och 0,68 ; används för felkorten */
  function skala(a, f) {
    var v = Number(String(a).replace(',', '.')) * f;
    return v.toLocaleString('sv-SE', { maximumFractionDigits: 6 });
  }
  function blanda(arr) {
    var b = arr.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  function visaPrickar() {
    var n = S.rader.length, i, d;
    el.prickar.innerHTML = '';
    for (i = 0; i < n; i++) {
      d = document.createElement('span');
      d.className = 'prick' + (i < S.index ? ' klar' : '') + (i === S.index ? ' nu' : '');
      el.prickar.appendChild(d);
    }
    el.framsteg.style.width = Math.round((S.index / n) * 100) + '%';
  }

  function intro(n) {
    if (n === 1) return 'Nivå 1. Skriv talet i grundpotensform. Välj siffran framför tian och stega exponenten.';
    if (n === 2) return 'Nivå 2. Nu är talen små, så exponenten blir negativ.';
    return 'Nivå 3. Läs prefixet och skriv talet i grundenheten. Giga är tio upphöjt till nio, mikro tio upphöjt till minus sex.';
  }
  function fragaText(n) {
    if (n === 1) return 'Skriv talet i grundpotensform';
    if (n === 2) return 'Skriv det lilla talet i grundpotensform';
    return 'Skriv i grundenheten, i grundpotensform';
  }

  function visaFraga() {
    var p = dt();
    S.siffra = null; S.exp = 0; S.expSatt = false; S.forsta = true; S.kollat = 0; S.last = false;
    el.fraga.classList.remove('svarad');
    el.aterkoppling.textContent = ''; el.aterkoppling.className = '';
    el.visning.textContent = ''; el.visning.className = '';
    el.slot.className = 'slot'; el.slot.textContent = '?';
    el.slot.setAttribute('aria-label', 'siffran framför tian, inte vald');
    el.expTal.className = 'exp'; el.expTal.textContent = '?';
    el.expUpp.classList.remove('puls'); el.expNer.classList.remove('puls');
    el.kolla.disabled = true;
    el.fragTexte.textContent = fragaText(S.niva);
    el.talStort.textContent = p.n;
    el.talPre.hidden = !p.pre;
    if (p.pre) el.talPre.textContent = p.pre;
    el.enhet.hidden = !p.unit;
    if (p.unit) el.enhet.textContent = p.unit;
    el.nivaText.textContent = 'Nivå ' + S.niva;
    el.stjarnText.textContent = S.stjarnor;
    sattKotten('nyfiken');
    tal(intro(S.niva));

    var rätt = p.a;
    var korten = blanda([rätt, skala(rätt, 10), skala(rätt, 0.1)]);
    el.alt.innerHTML = '';
    korten.forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'kort';
      b.innerHTML = '<span class="sym">' + v + '</span>';
      b.setAttribute('aria-label', 'siffran ' + v);
      b.dataset.v = v;
      b.addEventListener('click', function () { valjSiffra(v, b); });
      el.alt.appendChild(b);
    });

    visaPrickar();
    if (window.skolappar && window.skolappar.event) window.skolappar.event('round_start');
  }

  function valjSiffra(v, b) {
    if (S.last) return;
    S.siffra = v;
    Array.prototype.forEach.call(el.alt.children, function (k) {
      k.classList.remove('vald');
      k.setAttribute('aria-pressed', 'false');
    });
    b.classList.add('vald');
    b.setAttribute('aria-pressed', 'true');
    el.slot.textContent = v;
    el.slot.className = 'slot vald';
    el.slot.setAttribute('aria-label', 'siffran framför tian är ' + v);
    el.kolla.disabled = !S.expSatt;
    blipp(520, 'sine', 0.09, 0.08);
  }

  function stegExp(d) {
    if (S.last) return;
    S.exp = Math.max(-12, Math.min(12, S.exp + d));
    S.expSatt = true;
    el.expTal.textContent = sup(S.exp);
    el.expTal.className = 'exp' + (S.exp > 0 ? ' upp' : '');
    el.kolla.disabled = S.siffra === null;
    blipp(d > 0 ? 620 : 480, 'sine', 0.06, 0.07);
  }

  function kolla() {
    if (S.last || S.siffra === null || !S.expSatt) return;
    var p = dt();
    var rattSiffra = S.siffra === p.a;
    var rattExp = S.exp === p.e;
    if (rattSiffra && rattExp) { ratt(p); return; }

    S.kollat++; S.forsta = false;
    if (window.skolappar && window.skolappar.event) window.skolappar.event('hint');
    blipp(230, 'sine', 0.18, 0.1);
    if (navigator.vibrate) { try { navigator.vibrate(40); } catch (e) {} }
    el.slot.className = 'slot' + (S.siffra !== null ? (rattSiffra ? ' ratt' : ' fel') : ' vald');
    el.expTal.className = 'exp' + (S.exp > 0 ? ' upp' : '') + (rattExp ? '' : ' fel');
    if (!rattSiffra) {
      el.aterkoppling.textContent = 'Siffran framför tian ska vara minst 1 och mindre än 10.';
      sattKotten('funderar');
      tal('Nästan. Siffran framför tian ska vara minst ett och mindre än tio.');
    } else {
      el.aterkoppling.textContent = 'Rätt siffra! Räkna hur många steg kommatecknet flyttas.';
      sattKotten('funderar');
      tal('Nästan. Rätt siffra! Räkna hur många steg kommatecknet flyttas.');
    }
    el.aterkoppling.className = 'visa';
    if (S.kollat >= 2) {
      if (!rattSiffra) {
        Array.prototype.forEach.call(el.alt.children, function (k) {
          if (k.dataset.v === p.a) k.classList.add('traad');
        });
      } else {
        el.slot.className = 'slot ratt';
        (S.exp > p.e ? el.expNer : el.expUpp).classList.add('puls');
        el.aterkoppling.textContent = 'Rätt siffra. Exponenten är antalet steg som kommatecknet flyttas.';
      }
      if (!rattSiffra) {
        el.aterkoppling.textContent = 'Den här siffran ska stå framför tian. Välj den och stega exponenten.';
        tal('Titta på den bricka som lyser.');
      }
    }
    setTimeout(function () { el.slot.classList.remove('fel'); }, 1200);
  }

  function ratt(p) {
    S.last = true;
    el.slot.className = 'slot ratt';
    el.expTal.className = 'exp' + (S.exp > 0 ? ' upp' : '');
    el.fraga.classList.add('svarad');
    el.kolla.disabled = true;
    Array.prototype.forEach.call(el.alt.children, function (k) {
      k.disabled = true;
      if (k.dataset.v !== p.a) k.classList.add('slocknad');
      else k.classList.add('ratt');
    });
    if (S.forsta) { S.stjarnor++; S.totala++; }
    el.stjarnText.textContent = S.stjarnor;
    el.aterkoppling.textContent = 'Rätt!';
    el.aterkoppling.className = 'visa';
    var rad = krivTal(p.a, p.e) + ' = ' + p.n + (p.unit ? ' ' + p.unit : (p.pre || ''));
    el.visning.textContent = rad;
    el.visning.className = 'visa';
    sattKotten(S.stjarnor >= 6 ? 'imponerad' : 'glad');
    blipp(660, 'triangle', 0.16); setTimeout(function () { blipp(880, 'triangle', 0.22); }, 120);
    tal('Rätt!');
    if (window.skolappar && window.skolappar.event) window.skolappar.event('round_done', 100);
    setTimeout(nasta, 2400);
  }

  function nasta() {
    S.index++;
    if (S.index >= S.rader.length) { klart(); return; }
    visaFraga();
  }

  function klart() {
    var n = S.rader.length;
    var antal = S.stjarnor;
    el.klartStjarnor.textContent = antal > 0 ? '⭐'.repeat(antal) : '–';
    el.klartTitel.textContent = 'Nivå ' + S.niva + ' klar!';
    el.klartText.textContent = antal + ' av ' + n + ' stjärnor. ' +
      (S.niva < 3 ? 'Nästa nivå väntar.' : 'Du har klarat alla tre nivåerna – ' + S.totala + ' stjärnor.');
    el.klartKnapp.textContent = S.niva < 3 ? 'Nästa nivå' : 'Spela igen';
    el.klart.hidden = false;
    sattKotten(antal >= 6 ? 'imponerad' : 'firar');
    blipp(523, 'triangle', 0.18); setTimeout(function () { blipp(784, 'triangle', 0.3); }, 150);
    if (S.niva === 3) tal('Alla tre nivåerna är klara!');
    else tal('Nivå ' + S.niva + ' klar. Du fick ' + antal + (antal === 1 ? ' stjärna.' : ' stjärnor.'));
    if (window.skolappar && window.skolappar.event) window.skolappar.event('level', S.niva);
  }

  function startaNiva(n) {
    S.niva = n; S.index = 0; S.stjarnor = 0;
    S.rader = blanda(BANK['niva' + n]);
    el.klart.hidden = true;
    el.spel.hidden = false;
    el.start.hidden = true;
    if (window.skolappar && window.skolappar.event) window.skolappar.event('level', n);
    visaFraga();
  }

  /* ---------- speltest-hake ---------- */
  window.__pvStarta = startaNiva;
  window.__pvKolla = kolla;
  window.__pvSteg = stegExp;
  window.__pvValj = function (v) {
    var b = null;
    Array.prototype.forEach.call(el.alt.children, function (k) { if (k.dataset.v === v) b = k; });
    if (b) { b.click(); return true; }
    return false;
  };

  /* ---------- start ---------- */
  $('#kottenStart').innerHTML = kottenSvg('nyfiken');
  $('#play').addEventListener('click', function () { startaNiva(1); });
  el.klartKnapp.addEventListener('click', function () {
    if (S.niva < 3) startaNiva(S.niva + 1); else startaNiva(1);
  });
  el.klartIgen.addEventListener('click', function () { startaNiva(S.niva); });
  el.slot.addEventListener('click', function () {
    var f = el.alt.querySelector('.kort');
    if (f) f.focus();
  });
  el.expUpp.addEventListener('click', function () { stegExp(1); });
  el.expNer.addEventListener('click', function () { stegExp(-1); });
  el.kolla.addEventListener('click', kolla);
  el.ljud.addEventListener('click', function () {
    S.ljud = !S.ljud;
    el.ljud.textContent = S.ljud ? '🔊' : '🔇';
    el.ljud.setAttribute('aria-pressed', String(S.ljud));
    el.ljud.setAttribute('aria-label', S.ljud ? 'Stäng av ljudet' : 'Slå på ljudet');
    if (!S.ljud) {
      try { if (window.__rostStopp) window.__rostStopp(); } catch (e) {}
      if (typeof window.__rostStopp === 'function') window.__rostStopp();
      if (window.skolappar && window.skolappar.event) window.skolappar.event('sound_off');
    }
    blipp(600, 'triangle', 0.12);
  });
  document.addEventListener('keydown', function (ev) {
    if (el.start.hidden === false) return;
    if (!el.klart.hidden) return;
    if (ev.key === 'ArrowUp') { stegExp(1); ev.preventDefault(); }
    if (ev.key === 'ArrowDown') { stegExp(-1); ev.preventDefault(); }
    if (ev.key === 'Enter') { kolla(); ev.preventDefault(); }
    var i = ['1', '2', '3'].indexOf(ev.key);
    if (i >= 0 && el.alt.children[i]) el.alt.children[i].click();
  });
})();
