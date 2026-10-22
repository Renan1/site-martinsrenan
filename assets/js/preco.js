// Página do Gerador de preço: as mesmas fórmulas do app (calc e Simples Anexo I), com produtos fictícios do guia.
// Cada produto é uma etiqueta de gôndola; clicar abre a memória de cálculo. Só textContent.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PRODUCTS = [
    { name: 'Bala Menta Exemplo', cost: 39.00, q: 21 },
    { name: 'Chiclete Exemplo', cost: 9.39, q: 12 },
    { name: 'Pirulito Exemplo', cost: 91.65, q: 160 },
    { name: 'Chocolate Exemplo', cost: 54.90, q: 20 },
    { name: 'Paçoca Exemplo', cost: 22.50, q: 50 }
  ];
  // Simples Nacional, Anexo I: [teto RBT12, nominal %, dedução R$, % de ICMS na alíquota]
  var FX = [[180000, 4, 0, 34], [360000, 7.3, 5940, 34], [720000, 9.5, 13860, 33.5], [1800000, 10.7, 22500, 33.5], [3600000, 14.3, 87300, 33.5], [4800000, 19, 378000, 0]];
  var cfg = { unidade: 'un', base: 'venda' }, sel = 0, simplesOk = null, simplesCalc = null;

  var r2 = function (x) { return Math.round((x + 1e-9) * 100) / 100; };
  var brl = function (x, d) { return 'R$ ' + x.toLocaleString('pt-BR', { minimumFractionDigits: d || 2, maximumFractionDigits: d || 2 }); };
  var num = function (x, d) { return x.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var pct = function (x) { return num(x * 100, 2) + '%'; };
  var val = function (id) { var v = parseFloat($(id).value); return isFinite(v) ? v : 0; };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  // Igual ao calc() do app. modo "preco" = preço fixado pelo usuário (por unidade).
  function calc(r) {
    var cx = cfg.unidade === 'cx', q = r.q, t = val('imposto') / 100, tx = val('taxas') / 100, m = val('margem') / 100, step = parseFloat($('round').value);
    if (!(r.cost > 0) || !(q > 0)) return { vazio: true };
    var custo = cx ? r.cost : r.cost / q, preco, d = null, bruto = null;
    if (r.fixo != null) preco = r2(r.fixo * (cx ? q : 1));
    else if (cfg.base === 'venda') { d = 1 - t - tx - m; if (d <= 0.0001) return { erro: 'Margem, imposto e taxas somam 100% ou mais do preço. Reduza um deles.' }; bruto = custo / d; preco = r2(bruto); }
    else { d = 1 - t - tx; if (d <= 0.0001) return { erro: 'Imposto e taxas somam 100% ou mais do preço.' }; bruto = custo * (1 + m) / d; preco = r2(bruto); }
    var arred = false;
    if (r.fixo == null && step > 0) { var up = Math.ceil(preco / step - 1e-9) * step; arred = Math.abs(up - preco) > 1e-9; preco = r2(up); }
    var vImp = preco * t, vTx = preco * tx, lucro = preco - vImp - vTx - custo;
    return { custo: custo, preco: preco, bruto: bruto, d: d, t: t, tx: tx, m: m, vImp: vImp, vTx: vTx, lucro: lucro, mVenda: lucro / preco, mCusto: lucro / custo, arred: arred, fixo: r.fixo != null, step: step };
  }

  // Etiquetas
  var tags = PRODUCTS.map(function (p, i) {
    var b = el('div', 'tag'); b.setAttribute('role', 'button'); b.tabIndex = 0;
    var name = el('b', 'name', p.name);
    var box = el('div', 'box');
    var lc = el('label', '', 'Custo da caixa'), ic = el('input'); ic.inputMode = 'decimal'; ic.value = num(p.cost, 2); lc.appendChild(ic);
    var lq = el('label', '', 'Un./cx'), iq = el('input'); iq.inputMode = 'numeric'; iq.value = p.q; lq.appendChild(iq);
    box.appendChild(lc); box.appendChild(lq);
    var price = el('div', 'price'), cur = el('span', 'cur', 'R$'), ip = el('input', 'pv'); ip.inputMode = 'decimal'; ip.setAttribute('aria-label', 'Preço de venda de ' + p.name);
    price.appendChild(cur); price.appendChild(ip);
    var per = el('span', 'per'), note = el('span', 'note'), reset = el('button', 'reset', 'usar margem padrão'); reset.type = 'button'; reset.hidden = true;
    b.appendChild(name); b.appendChild(box); b.appendChild(price); b.appendChild(per); b.appendChild(note); b.appendChild(reset);
    var parse = function (s) { return parseFloat(String(s).replace(/\./g, '').replace(',', '.')); };
    ic.addEventListener('input', function () { p.cost = parse(ic.value); render(); });
    iq.addEventListener('input', function () { p.q = Math.floor(parse(iq.value)); render(); });
    ip.addEventListener('input', function () { var v = parse(ip.value); p.fixo = v > 0 ? v / (cfg.unidade === 'cx' ? p.q : 1) : null; render(ip); });
    reset.addEventListener('click', function (e) { e.stopPropagation(); p.fixo = null; render(); });
    b.addEventListener('click', function () { pick(i); });
    b.addEventListener('focusin', function () { pick(i); });
    b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === b) { e.preventDefault(); pick(i); } });
    $('shelf').appendChild(b);
    return { el: b, ip: ip, per: per, note: note, reset: reset };
  });
  function pick(i) { if (sel === i) return; sel = i; render(); }

  function render(typing) {
    var tot = { fat: 0, lucro: 0, ok: 0 };
    PRODUCTS.forEach(function (p, i) {
      var t = tags[i], r = calc(p); t.el.classList.toggle('on', i === sel); t.el.classList.toggle('err', !!r.erro); t.el.classList.toggle('fix', !!r.fixo);
      t.reset.hidden = !r.fixo;
      if (r.erro || r.vazio) { if (t.ip !== typing) t.ip.value = r.erro ? 'erro' : '—'; t.per.textContent = cfg.unidade === 'cx' ? 'a caixa' : 'a unidade'; t.note.textContent = r.erro ? 'margem + imposto + taxas ≥ 100%' : 'preencha o custo'; return; }
      if (t.ip !== typing) t.ip.value = num(r.preco, 2);
      t.per.textContent = cfg.unidade === 'cx' ? 'a caixa com ' + p.q : 'a unidade';
      t.note.textContent = (r.fixo ? 'preço fixado · ' : '') + 'margem real ' + pct(r.mVenda);
      var k = cfg.unidade === 'cx' ? 1 : p.q; tot.fat += r.preco * k; tot.lucro += r.lucro * k; tot.ok++;
    });
    $('total').textContent = 'Vendendo uma caixa de cada produto: faturamento ' + brl(tot.fat) + ' · lucro ' + brl(tot.lucro) + ' (depois de custo, imposto e taxas; sem custos fixos).';
    memo(PRODUCTS[sel], calc(PRODUCTS[sel]));
    $('warn').hidden = simplesOk != null && Math.abs(simplesOk - val('imposto')) < 1e-9;
    $('warn').textContent = 'Imposto provisório: ' + num(val('imposto'), 2) + '% é uma estimativa. Use o assistente do Simples para aplicar a alíquota real (e confirme com o contador).';
  }

  // Memória de cálculo + conferência (como o botão "Cálculo" do app)
  function memo(p, r) {
    var m = $('memo'); m.replaceChildren();
    m.appendChild(el('div', 'mh', 'MEMÓRIA DE CÁLCULO'));
    m.appendChild(el('div', 'mp', p.name));
    if (r.vazio) { m.appendChild(el('p', '', 'Preencha o custo da caixa e as unidades.')); return; }
    if (r.erro) { m.appendChild(el('p', 'bad', r.erro)); m.appendChild(el('p', '', 'Divisor = 1 − imposto − taxas − margem ≤ 0: não existe preço que pague tudo isso.')); return; }
    var cx = cfg.unidade === 'cx', L = [];
    L.push(cx ? 'Custo = caixa inteira = ' + brl(r.custo, 4) : 'Custo un. = ' + brl(p.cost) + ' ÷ ' + p.q + ' = ' + brl(r.custo, 4));
    if (r.fixo) L.push('Preço fixado em ' + brl(r.preco) + ': a margem vira resultado.');
    else if (cfg.base === 'venda') {
      L.push('Divisor = 1 − ' + num(r.t, 2) + ' − ' + num(r.tx, 2) + ' − ' + num(r.m, 2) + ' = ' + num(r.d, 2));
      L.push('Preço = ' + num(r.custo, 4) + ' ÷ ' + num(r.d, 2) + ' = ' + num(r.bruto, 4) + ' → ' + brl(r2(r.bruto)));
    } else {
      L.push('Markup: ' + num(r.custo, 4) + ' × ' + num(1 + r.m, 2) + ' ÷ ' + num(r.d, 2) + ' = ' + num(r.bruto, 4) + ' → ' + brl(r2(r.bruto)));
    }
    if (r.arred) L.push('Arredondado para cima (passo ' + brl(r.step) + '): ' + brl(r.preco));
    L.forEach(function (x) { m.appendChild(el('div', 'ml', x)); });
    var tb = el('table'), rows = [['Preço de venda', brl(r.preco)], ['− Imposto (' + num(r.t * 100, 2) + '%)', brl(r.vImp)], ['− Taxas (' + num(r.tx * 100, 1) + '%)', brl(r.vTx)], ['− Custo', brl(r.custo, 4)], ['= Lucro', brl(r.lucro, 4)]];
    rows.forEach(function (x, i) { var tr = el('tr', i === 4 ? 'sum' : ''); tr.appendChild(el('td', '', x[0])); tr.appendChild(el('td', '', x[1])); tb.appendChild(tr); });
    m.appendChild(tb);
    m.appendChild(el('div', 'mf', 'Margem real: ' + pct(r.mVenda) + ' da venda · ' + pct(r.mCusto) + ' sobre o custo.'));
    var pedida = cfg.base === 'venda' ? r.mVenda - r.m : r.mCusto - r.m;
    if (!r.fixo && Math.abs(pedida) > 0.00005) m.appendChild(el('div', 'dim', 'Difere da margem pedida por causa do arredondamento do preço. É esperado.'));
  }

  // Simples Nacional, Anexo I
  function simples() {
    var s = $('sres'); s.replaceChildren(); simplesCalc = null;
    var rbt = parseFloat($('rbt').value.replace(/\./g, '').replace(',', '.'));
    if (!(rbt > 0)) { s.appendChild(el('p', 'dim', 'Informe a receita bruta dos últimos 12 meses.')); $('apply').disabled = true; return; }
    if (rbt > 4800000) { s.appendChild(el('p', 'bad', 'Acima de R$ 4,8 milhões a empresa sai do Simples Nacional. A página só avisa: fale com o contador.')); $('apply').disabled = true; return; }
    var f = FX.filter(function (x) { return rbt <= x[0]; })[0], fx = FX.indexOf(f) + 1;
    var ef = (rbt * f[1] / 100 - f[2]) / rbt * 100, st = $('st').checked, fin = st ? ef * (1 - f[3] / 100) : ef;
    s.appendChild(el('div', 'ml', 'Faixa ' + fx + ' · nominal ' + num(f[1], 1) + '% · dedução ' + brl(f[2])));
    s.appendChild(el('div', 'ml', '(' + num(rbt, 0) + ' × ' + num(f[1], 1) + '% − ' + num(f[2], 0) + ') ÷ ' + num(rbt, 0) + ' = ' + num(ef, 2) + '%'));
    if (st) s.appendChild(el('div', 'ml', 'Com ICMS-ST: ' + num(ef, 2) + '% × (1 − ' + num(f[3], 1) + '%) = ' + num(fin, 2) + '%'));
    s.appendChild(el('div', 'big', num(fin, 2) + '%'));
    simplesCalc = r2(fin); $('apply').disabled = false;
  }
  $('apply').addEventListener('click', function () { if (simplesCalc == null) return; $('imposto').value = simplesCalc; simplesOk = simplesCalc; render(); });

  // Parâmetros
  ['margem', 'imposto', 'taxas', 'round'].forEach(function (id) { $(id).addEventListener('input', function () { render(); }); });
  document.querySelectorAll('[data-base]').forEach(function (b) { b.addEventListener('click', function () { cfg.base = b.dataset.base; document.querySelectorAll('[data-base]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
  document.querySelectorAll('[data-un]').forEach(function (b) { b.addEventListener('click', function () { cfg.unidade = b.dataset.un; document.querySelectorAll('[data-un]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }); });
  $('rbt').addEventListener('input', simples); $('st').addEventListener('change', simples);

  simples(); render();
})();
