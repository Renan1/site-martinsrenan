// Página do Leitor de QR: simula o app real (pastas por refeição, Presença, Rampa, CSV seguro).
// Tudo com textContent/createElement (nada de innerHTML), como no app.
(function () {
  var MEALS = ['Desjejum', 'Café', 'Almoço', 'Jantar', 'Ceia', 'L. Madrugada'];
  // QR Codes de exemplo. Clientes reais NÃO aparecem: viram Cliente A/B/C.
  var QRS = {
    presenca: [
      { code: '0001', lbl: 'Crachá 0001', sub: 'colaborador' },
      { code: '0002', lbl: 'Crachá 0002', sub: 'colaborador' },
      { code: '0003', lbl: 'Crachá 0003', sub: 'colaborador' },
      { code: '=HYPERLINK("x")', lbl: 'QR malicioso', sub: 'tenta virar fórmula' }
    ],
    rampa: [
      { code: '0100 - cliente a', id: 'A', lbl: 'Cliente A', sub: 'cartão 0100', color: '#C8432A' },
      { code: '0101 - cliente b', id: 'B', lbl: 'Cliente B', sub: 'cartão 0101', color: '#C98A1E' },
      { code: '0102 - cliente c', id: 'C', lbl: 'Cliente C', sub: 'cartão 0102', color: '#3D6FB6' },
      { code: '0001', lbl: 'Crachá 0001', sub: 'não é cartão' }
    ]
  };
  var INTERVAL = 1000; // intervalo mínimo entre leituras (o app usa 0,5 a 1,5 s)
  var SHOW = 9;        // linhas visíveis no recibo

  var mealsEl = document.getElementById('meals'), tray = document.getElementById('tray'), out = document.getElementById('out');
  var printer = document.getElementById('printer'), spike = document.getElementById('spike'), status = document.getElementById('status');
  var tally = document.getElementById('tally'), chips = document.getElementById('chips'), undo = document.getElementById('undo');
  var exportBtn = document.getElementById('export'), trayH = document.getElementById('tray-h');

  var mode = 'presenca', meal = 'Almoço', reads = [], last = 0, receipt = null, mealBtns = [];

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function today() { var d = new Date(); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); }
  function clock(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + clock(d); }
  function folder() { return (mode === 'rampa' ? 'Rampa ' : '') + meal + today(); }
  function fileName() { return folder().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/\./g, '_') + '.csv'; }
  // Igual ao app: valor que começa com = + - @ ganha um apóstrofo e não vira fórmula no Excel.
  function safe(v) { return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }

  // QR Code desenhado (decorativo): padrão determinístico a partir do texto.
  function qrSvg(text) {
    var NS = 'http://www.w3.org/2000/svg', n = 21, s = el('span'), seed = 0;
    for (var i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-1 -1 23 23'); svg.setAttribute('aria-hidden', 'true');
    function sq(x, y, w, f) { var r = document.createElementNS(NS, 'rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', w); r.setAttribute('fill', f); svg.appendChild(r); }
    function finder(x, y) { sq(x, y, 7, '#111'); sq(x + 1, y + 1, 5, '#fff'); sq(x + 2, y + 2, 3, '#111'); }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inF && rnd() > 0.5) sq(x, y, 1, '#111');
    }
    finder(0, 0); finder(14, 0); finder(0, 14);
    return svg;
  }

  // Quadro de letras: refeições
  MEALS.forEach(function (m, i) {
    var b = el('button', 'item'); b.type = 'button';
    var l = el('span'); l.appendChild(el('span', 'n', pad(i + 1))); l.appendChild(el('span', '', m));
    b.appendChild(l); b.appendChild(el('span', 'n', '→'));
    b.addEventListener('click', function () { meal = m; openFolder(); });
    mealsEl.appendChild(b); mealBtns.push(b);
  });
  document.querySelectorAll('.mode').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.dataset.mode;
      document.querySelectorAll('.mode').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      openFolder();
    });
  });

  function renderTray() {
    tray.replaceChildren();
    trayH.textContent = mode === 'rampa' ? 'Rampa: toque no cartão de quem passou' : 'Presença: toque num crachá para ler';
    QRS[mode].forEach(function (q) {
      var b = el('button', 'qr'); b.type = 'button';
      b.appendChild(qrSvg(q.code));
      b.appendChild(el('span', 'lbl', q.lbl));
      b.appendChild(el('span', 'sub', q.sub));
      b.addEventListener('click', function () { read(q, b); });
      tray.appendChild(b);
    });
  }

  function spikeIt(node) {
    var t = el('div', 'spiked');
    t.appendChild(el('div', '', node.dataset.title));
    t.appendChild(el('div', '', node.dataset.count + ' leitura(s)'));
    var n = spike.querySelectorAll('.spiked').length;
    t.style.setProperty('bottom', (30 + n * 26) + 'px');
    t.style.setProperty('transform', 'translateY(-200px)');
    spike.appendChild(t);
    requestAnimationFrame(function () { t.style.setProperty('transform', 'rotate(' + (Math.random() * 16 - 8).toFixed(1) + 'deg)'); });
    if (n >= 7) spike.querySelector('.spiked').remove();
  }

  function line(cls, text) { var d = el('div', (cls || '') + ' line', text); receipt.appendChild(d); return d; }
  function row(a, b, c, cls) { var d = el('div', 'row line' + (cls ? ' ' + cls : '')); d.appendChild(el('span', '', a)); d.appendChild(el('span', '', b)); d.appendChild(el('span', '', c)); return d; }

  function openFolder() {
    mealBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(MEALS[i] === meal)); });
    if (receipt && reads.length) spikeIt(receipt);
    reads = [];
    receipt = el('div', 'receipt'); receipt.dataset.title = folder(); receipt.dataset.count = '0';
    out.replaceChildren(receipt);
    tally.hidden = mode !== 'rampa';
    renderTray(); paint();
    status.textContent = 'Pasta ' + folder() + ' aberta.'; status.classList.remove('no');
  }

  // Redesenha o recibo inteiro a partir das leituras (simples e sem estado escondido).
  function paint(extra) {
    receipt.replaceChildren();
    line('c b', 'COUVE FLOR · LEITOR QR');
    line('c', 'pasta ' + folder());
    line('c', 'módulo ' + (mode === 'rampa' ? 'RAMPA' : 'PRESENÇA'));
    line('hr');
    receipt.appendChild(row('TIME', mode === 'rampa' ? 'CLIENTE' : 'CODE', 'QTY', 'head'));
    var hidden = Math.max(0, reads.length - SHOW);
    if (hidden) line('more', '… ' + hidden + ' leitura(s) anteriores');
    reads.slice(-SHOW).forEach(function (r) {
      if (r.rej) receipt.appendChild(row(clock(r.t), 'QR NÃO RECONHECIDO', '0', 'rej'));
      else receipt.appendChild(row(clock(r.t), r.show, '1'));
    });
    if (!reads.length) line('more', '(nenhuma leitura ainda)');
    line('hr');
    var counted = reads.filter(function (r) { return !r.rej; }).length;
    line('b', 'TOTAL: ' + counted + (mode === 'rampa' ? ' pessoa(s)' : ' leitura(s)'));
    if (extra) extra();
    receipt.dataset.count = String(counted);
    exportBtn.disabled = !counted;
    if (mode === 'rampa') paintChips();
  }

  function paintChips() {
    chips.replaceChildren();
    QRS.rampa.filter(function (q) { return q.id; }).forEach(function (q) {
      var c = el('div', 'chip'); c.style.setProperty('--c', q.color);
      c.appendChild(el('b', '', String(reads.filter(function (r) { return r.id === q.id; }).length)));
      c.appendChild(document.createTextNode(q.lbl));
      chips.appendChild(c);
    });
    undo.disabled = !reads.some(function (r) { return !r.rej; });
  }

  function flash(btn, ok) {
    btn.classList.remove('ok', 'no'); void btn.offsetWidth; btn.classList.add(ok ? 'ok' : 'no');
    setTimeout(function () { btn.classList.remove('ok', 'no'); }, 450);
    printer.classList.add('busy'); setTimeout(function () { printer.classList.remove('busy'); }, 250);
    if (navigator.vibrate) { try { navigator.vibrate(ok ? 90 : [60, 40, 60]); } catch (e) {} }
  }

  function read(q, btn) {
    var now = Date.now();
    if (now - last < INTERVAL) { status.textContent = 'Intervalo de leitura: 1,0 s. Aguarde e leia de novo.'; status.classList.add('no'); return; }
    last = now;
    var t = new Date();
    if (mode === 'rampa' && !q.id) {
      reads.push({ t: t, rej: true });
      flash(btn, false);
      status.textContent = 'QR não reconhecido: não foi contado.'; status.classList.add('no');
    } else {
      reads.push({ t: t, code: q.code, id: q.id, show: mode === 'rampa' ? q.lbl.toUpperCase() : q.code });
      flash(btn, true);
      status.textContent = mode === 'rampa' ? '+1 ' + q.lbl : 'Leitura registrada. Repetidos contam: cada leitura é uma linha.';
      status.classList.remove('no');
    }
    paint();
  }

  undo.addEventListener('click', function () {
    for (var i = reads.length - 1; i >= 0; i--) if (!reads[i].rej) { var r = reads.splice(i, 1)[0]; status.textContent = 'Desfeita a última leitura (' + r.show + ').'; status.classList.remove('no'); break; }
    paint();
  });

  exportBtn.addEventListener('click', function () {
    var ok = reads.filter(function (r) { return !r.rej; });
    paint(function () {
      line('hr');
      line('c b', '— EXPORTAR CSV —');
      if (mode === 'rampa') {
        line('csv', 'Resumo_' + fileName());
        line('csv', 'CLIENTE;PESSOAS');
        QRS.rampa.filter(function (q) { return q.id; }).forEach(function (q) {
          line('csv', q.lbl + ';' + ok.filter(function (r) { return r.id === q.id; }).length);
        });
        line('csv', 'TOTAL;' + ok.length);
      } else {
        line('csv', fileName());
        line('csv', 'TIME;CODE;QTY');
        var neutral = false;
        ok.slice(-5).forEach(function (r) {
          var v = safe(r.code), changed = v !== r.code;
          line('csv' + (changed ? ' hl' : ''), iso(r.t) + ';' + v + ';1');
          neutral = neutral || changed;
        });
        if (ok.length > 5) line('more', '… mais ' + (ok.length - 5) + ' linha(s)');
        if (neutral) line('note', "↑ fórmula neutralizada com ' (não executa no Excel)");
      }
    });
    status.textContent = 'CSV pronto (no app real ele é baixado ou enviado por e-mail).'; status.classList.remove('no');
  });

  openFolder();
})();
