// Página do projeto Dashboard: simulação com dados 100% fictícios (Cliente A, B, C).
// Arquivos importados liberam partes do painel; filtros cruzados; Leitura Estratégica com as regras do app real.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';
  var MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];
  var CLIENTS = ['A', 'B', 'C'];
  var COLOR = { A: 'var(--cA)', B: 'var(--cB)', C: 'var(--cC)' };
  var TICKET = { A: 15.6, B: 22.0, C: 19.0 };                       // R$ por refeição (fictício)
  var BASE = { A: [150, 142, 160, 166, 172, 176, 181, 186], B: [78, 76, 82, 80, 84, 87, 86, 90], C: [38, 41, 40, 44, 43, 45, 47, 46] }; // mil R$
  var BALCAO = [40, 39, 42, 41, 43, 42, 44, 44];                     // vendas de balcão (só no Financeiro)
  var FOOD = [31.5, 32.4, 30.8, 31.9, 32.6, 31.2, 31.8];             // food cost dos meses anteriores (%)
  var FINEXP = [2.6, 2.9, 2.7, 3.1, 2.8, 3.0, 2.9];                  // despesa financeira ÷ receita (%)
  var FOLHA = 25.5, OUTRAS = 27.0;                                   // % da receita
  var LAST = MONTHS.length - 1;

  var imported = {}, filters = { client: null, month: null };
  var sim = { food: 32, share: 52, fin: false };

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function mil(v) { return v >= 1000 ? 'R$ ' + (v / 1000).toFixed(2).replace('.', ',') + ' mi' : 'R$ ' + v.toFixed(1).replace('.', ',') + ' mil'; }
  function brl(v) { return 'R$ ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pct(v) { return v.toFixed(1).replace('.', ',').replace('-', '−') + '%'; }

  // Peso do maior cliente: ajusta o Cliente A para que, em agosto, ele represente sim.share% da receita total.
  function data() {
    var restAgo = BASE.B[LAST] + BASE.C[LAST] + BALCAO[LAST];
    var aAgo = sim.share / 100 * restAgo / (1 - sim.share / 100), k = aAgo / BASE.A[LAST];
    return { A: BASE.A.map(function (v) { return v * k; }), B: BASE.B, C: BASE.C };
  }

  // ---------- Operação (PDV) ----------
  function filtered(d) {
    var rows = [];
    MONTHS.forEach(function (m, i) { CLIENTS.forEach(function (c) {
      if ((!filters.client || filters.client === c) && (!filters.month || filters.month === m)) rows.push({ m: i, c: c, v: d[c][i] });
    }); });
    return rows;
  }
  function renderKpis(d) {
    var rows = filtered(d), tag = filters.client || filters.month ? ' (filtrado)' : '';
    var fat = rows.reduce(function (s, r) { return s + r.v; }, 0);
    var meals = rows.reduce(function (s, r) { return s + r.v * 1000 / TICKET[r.c]; }, 0);
    var byC = {}; rows.forEach(function (r) { byC[r.c] = (byC[r.c] || 0) + r.v; });
    var top = Object.keys(byC).sort(function (a, b) { return byC[b] - byC[a]; })[0];
    // variação: mês filtrado (ou o último) contra o anterior
    var mi = filters.month ? MONTHS.indexOf(filters.month) : LAST;
    function monthSum(i) { return CLIENTS.filter(function (c) { return !filters.client || filters.client === c; }).reduce(function (s, c) { return s + d[c][i]; }, 0); }
    var varTxt = mi > 0 ? (monthSum(mi) / monthSum(mi - 1) - 1) * 100 : null;
    var k = $('kpis'); k.replaceChildren();
    [['Faturamento' + tag, mil(fat), varTxt == null ? 'início do período' : (varTxt >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(varTxt)) + ' vs ' + MONTHS[mi - 1], varTxt == null ? '' : varTxt >= 0 ? 'up' : 'down'],
     ['Refeições' + tag, Math.round(meals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 'servidas no recorte', ''],
     ['Ticket médio', 'R$ ' + (fat * 1000 / meals).toFixed(2).replace('.', ','), 'faturamento ÷ refeições', ''],
     ['Maior cliente', top ? 'Cliente ' + top : '—', top ? pct(byC[top] / fat * 100) + ' do recorte' : '', '']].forEach(function (x) {
      var c = el('div', 'kpi'); c.appendChild(el('span', '', x[0])); c.appendChild(el('b', '', x[1])); c.appendChild(el('small', x[3], x[2])); k.appendChild(c);
    });
  }
  function renderBars(d) {
    var s = $('bars'); s.replaceChildren();
    var W = 640, H = 220, padL = 40, padB = 26, bw = (W - padL) / MONTHS.length * 0.62;
    var max = Math.max.apply(null, MONTHS.map(function (m, i) { return d.A[i] + d.B[i] + d.C[i]; })) * 1.08;
    [0, 0.5, 1].forEach(function (f) {
      var y = H - padB - (H - padB - 10) * f;
      svg('line', { x1: padL, x2: W, y1: y, y2: y, 'class': 'axis' }, s);
      svg('text', { x: 4, y: y + 4, 'class': 'tick' }, s).textContent = Math.round(max * f) + 'k';
    });
    MONTHS.forEach(function (m, i) {
      var x = padL + (W - padL) / MONTHS.length * i + ((W - padL) / MONTHS.length - bw) / 2, y = H - padB;
      CLIENTS.forEach(function (c) {
        var h = d[c][i] / max * (H - padB - 10);
        var dim = (filters.client && filters.client !== c) || (filters.month && filters.month !== m);
        var r = svg('rect', { x: x, y: y - h, width: bw, height: Math.max(h - 1, 0), rx: 2, fill: COLOR[c], 'class': 'seg' + (dim ? ' dim' : '') }, s);
        var t = svg('title', {}, r); t.textContent = 'Cliente ' + c + ' · ' + m + ' · ' + mil(d[c][i]);
        r.addEventListener('click', function () { setFilter('client', c); setFilter('month', m); });
        y -= h;
      });
      var lb = svg('text', { x: x + bw / 2, y: H - 8, 'class': 'mlabel' + (filters.month === m ? ' on' : '') }, s);
      lb.textContent = m; lb.addEventListener('click', function () { setFilter('month', m); });
    });
    var lg = $('legend'); lg.replaceChildren();
    CLIENTS.forEach(function (c) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(filters.client === c));
      var i = el('i'); i.style.setProperty('--c', COLOR[c]); b.appendChild(i); b.appendChild(document.createTextNode('Cliente ' + c));
      b.addEventListener('click', function () { setFilter('client', c); }); lg.appendChild(b);
    });
  }
  // Clicar de novo no mesmo item desfaz o filtro (como no painel real).
  function setFilter(k, v) { filters[k] = filters[k] === v ? null : v; renderAll(); }
  function renderChips() {
    var c = $('chips'); c.replaceChildren();
    if (filters.client) chip('Cliente: ' + filters.client + ' ×', function () { filters.client = null; });
    if (filters.month) chip('Mês: ' + filters.month + ' ×', function () { filters.month = null; });
    if (filters.client || filters.month) chip('Limpar filtros', function () { filters.client = filters.month = null; }, 'clear');
    function chip(t, fn, cls) { var b = el('button', 'chip' + (cls ? ' ' + cls : ''), t); b.type = 'button'; b.addEventListener('click', function () { fn(); renderAll(); }); c.appendChild(b); }
  }

  // ---------- Financeiro (Plano de Contas) ----------
  function fin(d) {
    return MONTHS.map(function (m, i) {
      var rec = d.A[i] + d.B[i] + d.C[i] + BALCAO[i];
      var food = i === LAST ? sim.food : FOOD[i];
      var fexp = i === LAST ? (sim.fin ? 9.6 : 3.0) : FINEXP[i];
      var desp = rec * (food + FOLHA + OUTRAS + fexp) / 100;
      return { rec: rec, food: food, fexp: fexp, margem: (rec - desp) / rec * 100, share: d.A[i] / rec * 100 };
    });
  }
  function renderPocket(f) {
    var a = f[LAST], p = $('pocket'); p.replaceChildren();
    [['Food cost · Ago', pct(a.food), 'referência 28–35%', a.food >= 28 && a.food <= 35],
     ['Margem líquida · Ago', pct(a.margem), 'quanto sobra de R$ 100', a.margem >= 8],
     ['Maior cliente', pct(a.share), 'referência abaixo de 30%', a.share < 30],
     ['Desp. financeira', pct(a.fexp), 'juros, tarifas e cartão', a.fexp <= 5]].forEach(function (x) {
      var c = el('div', 'pk ' + (x[3] ? 'ok' : 'bad')); c.appendChild(el('span', '', x[0])); c.appendChild(el('b', '', x[1])); c.appendChild(el('small', '', x[2])); p.appendChild(c);
    });
  }
  // As 4 regras da Leitura Estratégica do painel real.
  function renderReads(f) {
    var a = f[LAST], prev = f[LAST - 1], out = [];
    if (a.share >= 40) out.push(['crit', 'Risco crítico: Cliente A concentra ' + pct(a.share) + ' da receita.', 'Prospectar 2 ou 3 contratos médios e rever as cláusulas de reajuste e rescisão do contrato principal.']);
    var dm = a.margem - prev.margem;
    if (Math.abs(dm) >= 5) out.push(dm < 0 ? ['att', 'Margem caiu de ' + pct(prev.margem) + ' para ' + pct(a.margem) + ' (' + dm.toFixed(1).replace('.', ',') + ' p.p.).', 'Abrir o detalhamento de despesas do mês e achar a categoria que mais cresceu.']
                                          : ['good', 'Margem subiu de ' + pct(prev.margem) + ' para ' + pct(a.margem) + ' (+' + dm.toFixed(1).replace('.', ',') + ' p.p.).', 'Entender o que mudou (preço, insumo, volume) e repetir.']);
    if (a.food > 35) out.push(['att', 'Food cost em ' + pct(a.food) + ', acima de 35%.', 'Revisar fichas técnicas, desperdício e cotações dos principais insumos.']);
    var avg = FINEXP.reduce(function (s, v) { return s + v; }, 0) / FINEXP.length;
    if (a.fexp > avg * 1.5 && a.fexp > 8) out.push(['att', 'Despesa financeira disparou: ' + pct(a.fexp) + ' da receita (média ' + pct(avg) + ').', 'Conferir taxas de cartão e antecipações e renegociar com a adquirente.']);
    var ul = $('reads'); ul.replaceChildren();
    if (!out.length) { ul.appendChild(el('li', 'calm', 'Nenhum alerta neste mês.')); return; }
    out.forEach(function (o) { var li = el('li', o[0]); li.appendChild(el('b', '', o[1])); li.appendChild(el('span', 'todo', o[2])); ul.appendChild(li); });
  }

  // ---------- Conciliação (Medição × PDV × Financeiro, Cliente A) ----------
  function renderConc(d) {
    var t = $('conc'); t.replaceChildren();
    var hr = el('tr'); ['Mês', 'Medição', 'PDV', 'Financeiro', 'Diferença'].forEach(function (h) { hr.appendChild(el('th', '', h)); }); t.appendChild(hr);
    var gap = { 5: -3120, 6: 210 };                                  // jun: servido e não faturado; jul: dentro da tolerância
    [4, 5, 6, 7].forEach(function (i) {
      var pdv = d.A[i] * 1000, med = pdv * 1.004, finv = med + (gap[i] || 0), diff = finv - med, ok = Math.abs(diff) <= med * 0.01;
      var tr = el('tr'); tr.appendChild(el('td', '', MONTHS[i]));
      var md = el('td', '', brl(med)); if (i === LAST) md.appendChild(el('span', 'prov', 'provisório'));
      tr.appendChild(md); tr.appendChild(el('td', '', brl(pdv))); tr.appendChild(el('td', '', brl(finv)));
      tr.appendChild(el('td', ok ? 'ok' : 'bad', (diff >= 0 ? '+' : '−') + brl(Math.abs(diff)).replace('R$ ', 'R$ ') + (ok ? '' : ' servido, não faturado')));
      t.appendChild(tr);
    });
    var tr = el('tr'); tr.appendChild(el('td', '', 'Set')); var w = el('td', 'wait', 'Sem dado — aguardando Medição'); w.colSpan = 4; tr.appendChild(w); t.appendChild(tr);
  }

  function renderAll() {
    var d = data();
    document.querySelectorAll('.mod').forEach(function (m) { m.classList.toggle('locked', !imported[m.dataset.need]); });
    $('sim').classList.toggle('off', !imported.plano);
    renderChips(); renderKpis(d); renderBars(d);
    var f = fin(d); renderPocket(f); renderReads(f); renderConc(d);
  }

  function importFile(src) {
    if (imported[src]) return;
    imported[src] = true;
    var b = document.querySelector('.file[data-src="' + src + '"]'); b.classList.add('done'); b.querySelector('i').textContent = '✓ importado';
    renderAll();
    var m = document.querySelector('.mod[data-need="' + src + '"]'); m.classList.remove('lit'); void m.offsetWidth; m.classList.add('lit');
  }
  document.querySelectorAll('.file').forEach(function (b) { b.addEventListener('click', function () { importFile(b.dataset.src); }); });
  $('all').addEventListener('click', function () { ['pdv', 'plano', 'medicao'].forEach(importFile); });

  $('fc').addEventListener('input', function () { sim.food = +this.value; $('fc-v').textContent = this.value + '%'; renderAll(); });
  $('sh').addEventListener('input', function () { sim.share = +this.value; $('sh-v').textContent = this.value + '%'; renderAll(); });
  $('fin').addEventListener('change', function () { sim.fin = this.checked; renderAll(); });

  renderAll();
})();
