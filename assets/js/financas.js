// Página do projeto Finanças da Família: simula o "Novo gasto" e o mês reagindo (dados fictícios).
// Regras do app real: valor digitado pelos centavos; crédito conta no mês em que a fatura VENCE,
// parcela por parcela, pelo dia de fechamento do cartão; offline guarda e sincroniza depois; alertas da Saúde.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var TODAY = new Date(2026, 9, 21);                                   // 21/10/2026, como nos prints do guia
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var WAYS = ['PIX', 'Débito', 'Crédito', 'Dinheiro', 'Boleto'];
  var CARDS = [{ id: 'azul', name: 'Azul ••1111', close: 28, due: 6 }, { id: 'roxo', name: 'Roxo ••2222', close: 15, due: 5 }];
  var CATS = [
    { id: 'mercado', name: 'Mercado', c: '#30D158', budget: 1200, used: 396.2 },
    { id: 'rest', name: 'Restaurante', c: '#FF9F0A', budget: 300, used: 267 },
    { id: 'transp', name: 'Transporte', c: '#0A84FF', budget: 400, used: 120 },
    { id: 'lazer', name: 'Lazer', c: '#A970FF', budget: 500, used: 210 },
    { id: 'saude', name: 'Saúde', c: '#FF453A' }, { id: 'casa', name: 'Casa', c: '#64D2FF' },
    { id: 'educ', name: 'Educação', c: '#FFD60A' }, { id: 'outros', name: 'Outros', c: '#8E8E93' }
  ];
  var INCOME = 14550, spentOct = 6167.9;                                // outubro (fictício)
  var BILLS = [2100, 1400, 900, 600, 350, 350], billsNew = [0, 0, 0, 0, 0, 0]; // nov/2026 a abr/2027
  var BILL_START = new Date(2026, 10, 1);

  var cents = '', way = 'PIX', card = 'azul', cat = 'rest', online = true, pending = [];

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function brl(v) { var s = Math.abs(v).toFixed(2).split('.'); return (v < 0 ? '−' : '') + 'R$ ' + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + s[1]; }
  function value() { return (parseInt(cents || '0', 10)) / 100; }
  function catOf(id) { return CATS.filter(function (c) { return c.id === id; })[0]; }
  function cardOf(id) { return CARDS.filter(function (c) { return c.id === id; })[0]; }

  // Fatura: até o dia de fechamento entra na fatura que fecha este mês; depois, na do mês seguinte.
  // Se o vencimento é num dia menor ou igual ao fechamento, ela vence no mês seguinte ao fechamento.
  function firstBill(date, cd) {
    var close = new Date(date.getFullYear(), date.getMonth() + (date.getDate() <= cd.close ? 0 : 1), 1);
    return new Date(close.getFullYear(), close.getMonth() + (cd.due <= cd.close ? 1 : 0), 1);
  }
  function monthIdx(d) { return (d.getFullYear() - BILL_START.getFullYear()) * 12 + d.getMonth() - BILL_START.getMonth(); }

  // ----- Celular -----
  function renderPhone() {
    $('amount').textContent = brl(value());
    $('save').disabled = value() <= 0;
    $('credit').hidden = way !== 'Crédito';
    if (way === 'Crédito') {
      var n = +$('parc').value, fb = firstBill(TODAY, cardOf(card)), last = new Date(fb.getFullYear(), fb.getMonth() + n - 1, 1);
      var note = $('credit-note'); note.replaceChildren();
      note.appendChild(document.createTextNode((n > 1 ? n + 'x de ' + brl(value() / n) + ' · ' : '') + '1ª parcela na fatura de '));
      note.appendChild(el('b', '', MESES[fb.getMonth()]));
      note.appendChild(document.createTextNode((n > 1 ? ' até ' + MESES[last.getMonth()] : '') + ' (fecha dia ' + cardOf(card).close + ', vence dia ' + cardOf(card).due + ').'));
    }
  }
  function seg(box, items, get, set) {
    box.replaceChildren();
    items.forEach(function (it) {
      var b = el('button', '', it.label); b.type = 'button'; b.setAttribute('aria-pressed', String(get() === it.id));
      b.addEventListener('click', function () { set(it.id); seg(box, items, get, set); renderPhone(); });
      box.appendChild(b);
    });
  }
  seg($('ways'), WAYS.map(function (w) { return { id: w, label: w }; }), function () { return way; }, function (v) { way = v; });
  seg($('cards'), CARDS.map(function (c) { return { id: c.id, label: 'Cartão ' + c.name }; }), function () { return card; }, function (v) { card = v; });
  for (var i = 1; i <= 12; i++) { var o = el('option', '', i + 'x'); o.value = i; $('parc').appendChild(o); }
  $('parc').addEventListener('change', renderPhone);
  (function cats() {
    var box = $('cats'); box.replaceChildren();
    CATS.forEach(function (c) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(cat === c.id));
      var dot = el('i'); dot.style.setProperty('--c', c.c); b.appendChild(dot); b.appendChild(document.createTextNode(c.name));
      b.addEventListener('click', function () { cat = c.id; cats(); });
      box.appendChild(b);
    });
  })();
  // Teclado: o valor entra pelos centavos (4 → 5 → 9 → 0 = R$ 45,90).
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].forEach(function (k) {
    var b = el('button', '', k); b.type = 'button'; b.setAttribute('aria-label', k === '⌫' ? 'Apagar' : k);
    b.addEventListener('click', function () {
      if (k === '⌫') cents = cents.slice(0, -1);
      else if ((cents + k).replace(/^0+/, '').length <= 7) cents = (cents + k).replace(/^0+/, '');
      renderPhone();
    });
    $('keys').appendChild(b);
  });

  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 3200); }

  function apply(g) {
    if (g.way !== 'Crédito') {
      spentOct += g.v; var c = catOf(g.cat); if (c.budget) c.used += g.v;
      return 'Gasto de ' + brl(g.v) + ' em ' + catOf(g.cat).name + ' lançado em outubro.';
    }
    var fb = monthIdx(firstBill(TODAY, cardOf(g.card))), part = Math.round(g.v / g.n * 100) / 100;
    for (var k = 0; k < g.n; k++) {
      var p = k === g.n - 1 ? Math.round((g.v - part * (g.n - 1)) * 100) / 100 : part;
      if (fb + k < BILLS.length) { BILLS[fb + k] += p; billsNew[fb + k] += p; }
    }
    var m = MESES[(BILL_START.getMonth() + fb) % 12];
    return 'Compra de ' + brl(g.v) + (g.n > 1 ? ' em ' + g.n + 'x (' + brl(part) + '/mês)' : '') + ' a partir da fatura de ' + m + '. Não pesa em outubro.';
  }

  $('save').addEventListener('click', function () {
    var g = { v: value(), way: way, cat: cat, card: card, n: way === 'Crédito' ? +$('parc').value : 1 };
    if (!(g.v > 0)) return;
    cents = ''; billsNew = billsNew.map(function () { return 0; });
    if (!online) { pending.push(g); toast('Sem sinal: guardado no celular. Sobe sozinho quando a internet voltar.'); }
    else { toast(apply(g)); flash(); }
    renderPhone(); render();
  });

  function flush() {
    if (!online || !pending.length) return;
    var n = pending.length; billsNew = billsNew.map(function () { return 0; });
    pending.forEach(apply); pending = [];
    toast(n + ' lançamento(s) enviado(s) ao voltar o sinal.'); flash(); render();
  }
  $('plane').addEventListener('click', function () {
    online = !online;
    this.setAttribute('aria-pressed', String(!online));
    $('plane-t').textContent = online ? 'Simular modo avião (sem sinal)' : 'Modo avião ligado · toque para voltar o sinal';
    $('signal-bars').classList.toggle('off', !online);
    if (online) flush(); else render();
  });
  $('sync').addEventListener('click', flush);                          // tocar no selo tenta enviar na hora

  function flash() { document.querySelectorAll('.month, .card').forEach(function (c) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }); }

  // ----- Painel do mês -----
  function render() {
    var s = $('sync');
    s.textContent = pending.length ? pending.length + ' aguardando sinal' : '✓ Tudo sincronizado';
    s.classList.toggle('wait', !!pending.length);
    var bal = INCOME - spentOct, rate = bal / INCOME * 100;
    $('k-in').textContent = brl(INCOME); $('k-out').textContent = brl(spentOct); $('k-bal').textContent = brl(bal);
    $('k-rate').textContent = rate.toFixed(1).replace('.', ',') + '%';
    $('k-rate-box').classList.toggle('bad', rate < 10);

    var limit = INCOME * 0.3, max = Math.max(limit * 1.15, Math.max.apply(null, BILLS));
    var bills = $('bills'); bills.replaceChildren();
    BILLS.forEach(function (v, i) {
      var d = new Date(BILL_START.getFullYear(), BILL_START.getMonth() + i, 1);
      var col = el('div', 'bill' + (billsNew[i] ? ' hit' : ''));
      col.appendChild(el('b', '', brl(v).replace(',00', '').replace('R$ ', '')));
      var area = el('div', 'area'), bar = el('div', 'bar'); bar.style.setProperty('height', (v / max * 100).toFixed(1) + '%');
      var nw = el('div', 'new'); nw.style.setProperty('height', (billsNew[i] / v * 100 || 0).toFixed(1) + '%'); bar.appendChild(nw);
      area.appendChild(bar); col.appendChild(area); col.appendChild(el('span', '', MESES[d.getMonth()].slice(0, 3)));
      bills.appendChild(col);
    });
    var lim = el('div', 'limit'); lim.appendChild(el('span', '', '30% da renda'));
    lim.style.setProperty('bottom', (22 + limit / max * 110).toFixed(1) + 'px');            // 22px do rótulo + altura proporcional na área de 110px
    bills.appendChild(lim);

    var bud = $('budgets'); bud.replaceChildren();
    CATS.filter(function (c) { return c.budget; }).forEach(function (c) {
      var p = c.used / c.budget * 100, box = el('div', 'bud' + (p >= 100 ? ' over' : p >= 80 ? ' warn' : ''));
      var row = el('div', 'row'); row.appendChild(el('span', '', c.name)); row.appendChild(el('small', '', brl(c.used) + ' de ' + brl(c.budget) + ' · ' + Math.round(p) + '%'));
      var tr = el('div', 'track'), fl = el('div', 'fill'); fl.style.setProperty('width', Math.min(p, 100).toFixed(1) + '%'); tr.appendChild(fl);
      box.appendChild(row); box.appendChild(tr); bud.appendChild(box);
    });

    // Saúde: as regras do app real
    var out = [];
    CATS.filter(function (c) { return c.budget; }).forEach(function (c) {
      var p = c.used / c.budget * 100;
      if (p >= 100) out.push(['over', 'Orçamento estourado: ' + c.name + ' em ' + Math.round(p) + '%.', 'Definir um teto menor ou rever os gastos dessa categoria.']);
      else if (p >= 80) out.push(['warn', 'Orçamento chegando ao limite: ' + c.name + ' em ' + Math.round(p) + '%.', 'Faltam ' + brl(c.budget - c.used) + ' até o teto do mês.']);
    });
    if (rate < 10) out.push(['over', 'Poupança do mês em ' + rate.toFixed(1).replace('.', ',') + '% (abaixo de 10%).', 'Guardar um valor fixo no início do mês.']);
    if (BILLS[0] > limit) out.push(['warn', 'Parcelas de novembro somam ' + brl(BILLS[0]) + ' (' + Math.round(BILLS[0] / INCOME * 100) + '% da renda, acima de 30%).', 'Evitar novas compras parceladas até a fatura baixar.']);
    var ul = $('alerts'); ul.replaceChildren();
    if (!out.length) ul.appendChild(el('li', 'calm', 'Nenhum alerta neste mês.'));
    out.forEach(function (a) { var li = el('li', a[0]); li.appendChild(el('b', '', a[1])); li.appendChild(document.createTextNode(a[2])); ul.appendChild(li); });
  }

  renderPhone(); render();
})();
