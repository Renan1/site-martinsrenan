// Página inicial: patch panel. Dados em assets/js/projects.js.
(function () {
  var DATA = window.PROJECTS;
  var ORDER = [7, 3, 10, 0, 5, 11, 2, 8, 4, 1, 9, 6]; // soluções embaralhadas

  var frame = document.getElementById('frame'), svg = document.getElementById('cables'), lcd = document.getElementById('lcd');
  var probs = document.getElementById('probs'), sysEl = document.getElementById('sys'), countEl = document.getElementById('count');
  var NS = 'http://www.w3.org/2000/svg', links = {}, drag = null, armed = null, hover = null;

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function byId(id) { return DATA.filter(function (x) { return x.id === id; })[0]; }
  function q(kind, id) { return document.querySelector('.port[data-kind="' + kind + '"][data-id="' + id + '"]'); }

  function port(d, kind, n) {
    var b = el('button', 'port' + (d.cta ? ' cta' : '')); b.type = 'button'; b.dataset.kind = kind; b.dataset.id = d.id;
    var label = el('span', 'lbl', kind === 'p' ? d.p : d.s);
    // O LED fica do lado oposto ao cabo, para o cabo nunca cobri-lo.
    if (kind === 'p') { b.style.setProperty('--c', d.color); b.appendChild(label); b.appendChild(el('span', 'led')); b.appendChild(el('span', 'jack')); b.appendChild(el('span', 'num', String(n).padStart(2, '0'))); }
    else { b.appendChild(el('span', 'num', String(n).padStart(2, '0'))); b.appendChild(el('span', 'jack')); b.appendChild(el('span', 'led')); b.appendChild(label); }
    return b;
  }
  DATA.forEach(function (d, i) { probs.appendChild(port(d, 'p', i + 1)); });
  ORDER.forEach(function (i, k) { sysEl.appendChild(port(DATA[i], 's', k + 13)); });

  function center(btn) {
    var j = btn.querySelector('.jack').getBoundingClientRect(), f = frame.getBoundingClientRect();
    return { x: j.left + j.width / 2 - f.left, y: j.top + j.height / 2 - f.top };
  }
  function curve(a, b) {
    var sag = Math.max(60, Math.abs(b.x - a.x) * 0.35);
    return 'M' + a.x + ' ' + a.y + ' C' + a.x + ' ' + (a.y + sag) + ' ' + b.x + ' ' + (b.y - sag) + ' ' + b.x + ' ' + b.y;
  }
  function cable(a, b, color) {
    var g = document.createElementNS(NS, 'g');
    var sh = document.createElementNS(NS, 'path'); sh.setAttribute('class', 'shadow'); sh.setAttribute('d', curve({ x: a.x + 3, y: a.y + 5 }, { x: b.x + 3, y: b.y + 5 }));
    var w = document.createElementNS(NS, 'path'); w.setAttribute('class', 'wire'); w.setAttribute('stroke', color); w.setAttribute('d', curve(a, b));
    g.appendChild(sh); g.appendChild(w);
    [a, b].forEach(function (p) { var c = document.createElementNS(NS, 'rect'); c.setAttribute('class', 'plug'); c.setAttribute('x', p.x - 9); c.setAttribute('y', p.y - 8); c.setAttribute('width', 18); c.setAttribute('height', 16); c.setAttribute('rx', 3); c.setAttribute('fill', color); g.appendChild(c); });
    return g;
  }
  function redraw() {
    svg.replaceChildren();
    Object.keys(links).forEach(function (id) { svg.appendChild(cable(center(q('p', id)), center(q('s', id)), byId(id).color)); });
    if (drag) svg.appendChild(cable(drag.from, drag.to, drag.color));
    countEl.replaceChildren(el('b', '', String(Object.keys(links).length)), document.createTextNode('/' + DATA.length + ' links ativos'));
  }
  addEventListener('resize', redraw);

  // LEDs
  // Porta sob o cabo: só um contorno (não pisca, para não confundir com a dica).
  function setHover(b) {
    if (hover && hover !== b) hover.classList.remove('hover');
    hover = b;
    if (b) b.classList.add('hover');
  }
  // Ao puxar o cabo: pisca a origem e, como dica, a solução certa, na cor do cabo.
  function blinkSource(id, on) {
    var s = q('s', id);
    q('p', id).classList.toggle('blink', on);
    if (s.classList.contains('up')) return;
    if (on) { s.style.setProperty('--c', byId(id).color); s.classList.add('blink'); }
    else { s.classList.remove('blink'); s.style.removeProperty('--c'); }
  }

  // Display
  function screen(rows) {
    lcd.replaceChildren();
    rows.forEach(function (r) {
      var line = el('div', 'ln ' + (r.c || ''));
      if (r.href) { var a = el('a', r.cls || '', r.t); a.href = r.href; if (/^https?:/.test(r.href)) { a.target = '_blank'; a.rel = 'noopener'; } line.appendChild(a); }
      else line.textContent = r.t;
      lcd.appendChild(line);
    });
    lcd.lastChild.appendChild(el('span', 'cursor'));
  }
  function idle() {
    screen([{ t: 'rm-patch v2 · ' + DATA.length + ' portas · aguardando', c: 'dim' }, { t: '> puxe um cabo de um problema até a solução certa.' }, { t: '> dica: comece por "DIGITALIZAR DOCUMENTOS".', c: 'dim' }]);
  }
  function linkUp(id) {
    var d = byId(id), s = q('s', id);
    links[id] = true;
    s.style.setProperty('--c', d.color);
    [q('p', id), s].forEach(function (b) { b.classList.remove('blink', 'armed'); b.classList.add('up'); });
    var rows = [{ t: 'LINK UP · porta ' + id + ' · 1 Gbps' }, { t: 'problema : ' + d.p }, { t: 'solução  : ' + d.name }, { t: '           ' + d.d, c: 'dim' }, { t: 'stack    : ' + d.st, c: 'dim' }];
    if (d.page) rows.push({ t: '[ abrir projeto → ]', href: 'projetos/' + d.page + '/', cls: 'open' });
    else if (d.cta) rows.push({ t: '> contato: em breve', c: 'dim' });
    else if (d.soon) rows.push({ t: '> projeto em construção · veja em futuros projetos', href: 'futuros/' });
    else rows.push({ t: '> página do projeto em construção', c: 'dim' });
    if (d.repo) rows.push({ t: '> ver código no GitHub ↗', href: d.repo });
    else if (d.priv) rows.push({ t: '> código privado (só descrição)', c: 'dim' });
    screen(rows);
    redraw();
    if (innerWidth < 640) lcd.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function fail(pid, sid) {
    var p = q('p', pid), s = q('s', sid);
    [p, s].forEach(function (b) { b.classList.remove('blink'); b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); if (b.dataset.kind === 's' && !b.classList.contains('up')) b.style.removeProperty('--c'); }, 900); });
    redraw();
    screen([{ t: 'NO CARRIER · porta errada', c: 'warn' }, { t: '> "' + byId(pid).p + '" não se resolve com "' + byId(sid).s + '".' }, { t: '> tente outra porta.', c: 'dim' }]);
  }
  function tryConnect(pid, sid) { if (links[sid]) { redraw(); return; } if (pid === sid) linkUp(pid); else fail(pid, sid); }

  function solutionAt(x, y) {
    return document.elementsFromPoint(x, y).map(function (n) { return n.closest && n.closest('.port[data-kind="s"]'); }).filter(Boolean)[0] || null;
  }

  // Arrastar (mouse e toque)
  probs.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.port'); if (!b || links[b.dataset.id]) return;
    var d = byId(b.dataset.id), f = frame.getBoundingClientRect();
    drag = { id: d.id, from: center(b), to: { x: e.clientX - f.left, y: e.clientY - f.top }, color: d.color, sx: e.clientX, sy: e.clientY, moved: false };
    try { b.setPointerCapture(e.pointerId); } catch (err) {}
    blinkSource(d.id, true);
  });
  probs.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var f = frame.getBoundingClientRect();
    drag.to = { x: e.clientX - f.left, y: e.clientY - f.top };
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) drag.moved = true;
    setHover(solutionAt(e.clientX, e.clientY));
    redraw();
  });
  // Se o navegador cancelar o arrasto (rolagem, troca de aba...), o cabo volta.
  function cancelDrag() {
    if (!drag) return;
    blinkSource(drag.id, false); drag = null; setHover(null); redraw();
  }
  probs.addEventListener('pointercancel', cancelDrag);
  addEventListener('blur', cancelDrag);
  probs.addEventListener('pointerup', function (e) {
    if (!drag) return;
    var d = drag; drag = null; setHover(null);
    if (!d.moved) { // toque simples: arma a porta e espera o toque na solução
      if (armed && armed !== d.id) blinkSource(armed, false);
      armed = d.id; redraw();
      screen([{ t: '> porta "' + byId(d.id).p + '" selecionada' }, { t: '> agora toque na solução que resolve.', c: 'dim' }]);
      return;
    }
    blinkSource(d.id, false);
    var hit = solutionAt(e.clientX, e.clientY);
    if (hit) tryConnect(d.id, hit.dataset.id); else redraw();
  });
  sysEl.addEventListener('click', function (e) {
    var b = e.target.closest('.port'); if (!b || !armed) return;
    var a = armed; armed = null; blinkSource(a, false);
    tryConnect(a, b.dataset.id);
  });

  document.getElementById('auto').addEventListener('click', function () {
    DATA.map(function (d) { return d.id; }).filter(function (id) { return !links[id]; })
      .forEach(function (id, i) { setTimeout(function () { linkUp(id); }, i * 180); });
  });
  document.getElementById('reset').addEventListener('click', function () {
    links = {}; armed = null;
    document.querySelectorAll('.port[data-kind="s"]').forEach(function (b) { b.style.removeProperty('--c'); });
    document.querySelectorAll('.port').forEach(function (b) { b.classList.remove('up', 'blink', 'bad', 'hover'); });
    idle(); redraw();
  });

  idle(); redraw();
})();
