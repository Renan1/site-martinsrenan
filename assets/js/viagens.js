// Página do projeto Viagens: simula motorista ↔ planilha ↔ gestor com as regras do app real.
// Dados fictícios. Tudo com textContent/createElement (nada de innerHTML).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var fare = 50, online = true, seq = 0, trips = [], pays = [];
  var yesterday = new Date(Date.now() - 864e5);

  // Fundo: cidade em SVG. Camadas: quarteirões/praças → calçadas → ruas → faixas → carrinhos (sempre por cima).
  // Os carrinhos andam pelas ruas com animateMotion (seguem as curvas) e param juntos quando o sinal cai.
  var citySvg = (function city() {
    var NS = 'http://www.w3.org/2000/svg', seed = 7;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    function node(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
    var wrap = document.createElement('div'); wrap.className = 'city'; wrap.setAttribute('aria-hidden', 'true');
    var svg = node('svg', { viewBox: '0 0 1600 1000', preserveAspectRatio: 'xMidYMid slice' });
    var ground = node('g', {}, svg), walks = node('g', {}, svg), roads = node('g', {}, svg), lanes = node('g', {}, svg), cars = node('g', { 'class': 'cars' }, svg);

    // Quarteirões (alguns viram praça com árvores). As ruas, desenhadas por cima, "recortam" os quarteirões.
    for (var y = -40; y < 1040; y += 170) for (var x = -60; x < 1660; x += 180) {
      var bx = x + rnd() * 16, by = y + rnd() * 12, bw = 140 + rnd() * 20, bh = 120 + rnd() * 18;
      if (rnd() < 0.22) {
        node('rect', { x: bx, y: by, width: bw, height: bh, rx: 14, 'class': 'park' }, ground);
        for (var t = 0; t < 6; t++) node('circle', { cx: bx + 18 + rnd() * (bw - 36), cy: by + 18 + rnd() * (bh - 36), r: 9 + rnd() * 9, 'class': 'tree' }, ground);
      } else {
        node('rect', { x: bx, y: by, width: bw, height: bh, rx: 10, 'class': 'block' }, ground);
        for (var b = 0; b < 3; b++) node('rect', { x: bx + 10 + rnd() * (bw - 60), y: by + 10 + rnd() * (bh - 50), width: 26 + rnd() * 24, height: 20 + rnd() * 20, rx: 4, 'class': 'roof' }, ground);
      }
    }

    // Ruas: avenida sinuosa, retas, curvas, uma diagonal que dobra numa rua e uma rotatória.
    var ROADS = {
      av:    'M -140 430 C 300 430 520 360 845 400',                              // até a rotatória
      av2:   'M 955 400 S 1400 480 1740 450',                                    // sai da rotatória
      west:  'M 320 -140 L 320 1140',
      east:  'M 1200 -140 C 1185 250 1225 650 1200 1140',
      top:   'M -140 190 C 400 190 900 150 1740 170',
      curve: 'M 700 -140 Q 730 150 1200 240 T 1740 300',
      low:   'M -140 800 C 400 760 800 860 1740 780',
      diag:  'M -140 1100 L 320 640 L 320 -140',                                  // diagonal que dobra na rua oeste
      ring:  'M 845 400 A 55 55 0 1 1 955 400 A 55 55 0 1 1 845 400',
      north: 'M 900 -140 L 900 345',                                              // entra na rotatória por cima
      south: 'M 900 455 C 900 600 860 700 900 1140'                               // sai por baixo
    };
    Object.keys(ROADS).forEach(function (id) {
      node('path', { d: ROADS[id], 'class': 'walk' }, walks);
      node('path', { id: 'rd-' + id, d: ROADS[id], 'class': 'road' }, roads);
      node('path', { d: ROADS[id], 'class': 'lane' }, lanes);
    });
    node('circle', { cx: 900, cy: 400, r: 30, 'class': 'hub' }, lanes);

    // Rotas invisíveis que passam pela rotatória (sentido anti-horário) em vez de terminar nela.
    var defs = node('defs', {}, svg);
    node('path', { id: 'rt-av', d: 'M -140 430 C 300 430 520 360 845 400 A 55 55 0 0 0 955 400 S 1400 480 1740 450' }, defs);
    node('path', { id: 'rt-ns', d: 'M 900 -140 L 900 345 A 55 55 0 0 0 900 455 C 900 600 860 700 900 1140' }, defs);

    // Carrinhos: todo caminho começa e termina fora da tela. Atravessam em 45% do ciclo e esperam fora da tela.
    var COLORS = ['#F5C518', '#12857A', '#E08A12', '#F5C518', '#8FA3A0', '#B3261E', '#F5C518', '#12857A', '#E08A12'];
    [['rt-av', 0], ['rt-av', 3], ['rt-ns', 8], ['rd-west', 2], ['rd-east', 1], ['rd-top', 4], ['rd-curve', 5], ['rd-low', 6], ['rd-diag', 7]].forEach(function (c) {
      var g = node('g', {}, cars);
      node('rect', { x: -14, y: -6, width: 30, height: 15, rx: 4, 'class': 'car-shadow' }, g);
      node('rect', { x: -15, y: -8, width: 30, height: 16, rx: 4, fill: COLORS[c[1]] }, g);
      node('rect', { x: 4, y: -6, width: 7, height: 12, rx: 2, 'class': 'glass' }, g);
      var dur = 16 + rnd() * 12;
      var m = node('animateMotion', { dur: dur.toFixed(1) + 's', repeatCount: 'indefinite', rotate: 'auto', begin: (-rnd() * dur).toFixed(1) + 's' }, g);
      m.setAttribute('keyPoints', '0;1;1'); m.setAttribute('keyTimes', '0;0.45;1'); m.setAttribute('calcMode', 'linear');
      node('mpath', { href: '#' + c[0] }, m);
    });

    wrap.appendChild(svg);
    document.body.insertBefore(wrap, document.body.firstChild);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) svg.pauseAnimations();
    return svg;
  })();

  function at(d, h, m) { var x = new Date(d); x.setHours(h, m, 0, 0); return x; }
  function trip(type, value, desc, t, today) { return { id: ++seq, type: type, value: value, desc: desc || '', t: t, today: today, synced: true, paid: null }; }
  // Duas viagens de ontem, já enviadas: mostram a regra "só cancela o que lançou hoje".
  trips.push(trip('IDA', 50, '', at(yesterday, 7, 10), false), trip('VOLTA', 50, '', at(yesterday, 17, 40), false));

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function brl(v) { return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function ddmm(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
  function maskE2E(c) { return c.slice(0, 9) + '…' + c.slice(-4); }

  // Relógio do motorista
  function tick() {
    var d = new Date();
    $('clock').textContent = hhmm(d);
    $('date').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  tick(); setInterval(tick, 15000);

  var toastTimer;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // Estrada: o carrinho leva a viagem até a planilha (ou para no "sem sinal").
  function drive(ok) {
    var c = $('truck'); c.classList.remove('go', 'stuck'); void c.offsetWidth; c.classList.add(ok ? 'go' : 'stuck');
  }

  function register(type, value, desc) {
    var t = trip(type, value, desc, new Date(), true);
    t.synced = online;
    trips.push(t);
    drive(online);
    toast(online ? (type === 'EXTRA' ? 'Viagem EXTRA registrada às ' : (type === 'IDA' ? 'Levar equipe registrada às ' : 'Trazer equipe registrada às ')) + hhmm(t.t) + '.'
                 : 'Sem internet: a viagem ficou guardada no celular.');
    render();
  }

  document.querySelectorAll('.trip').forEach(function (b) { b.addEventListener('click', function () { register(b.dataset.type, fare); }); });

  // EXTRA exige valor e descrição.
  $('extra-open').addEventListener('click', function () { $('extra').hidden = !$('extra').hidden; $('extra-err').textContent = ''; });
  $('extra').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = parseFloat(($('extra-val').value || '').replace(',', '.')), d = $('extra-desc').value.trim();
    if (!(v > 0) || !d) { $('extra-err').textContent = 'EXTRA exige valor e descrição.'; return; }
    register('EXTRA', v, d);
    $('extra-val').value = ''; $('extra-desc').value = ''; $('extra').hidden = true;
  });

  // Sinal: offline guarda na fila; quando volta, a fila sobe sozinha.
  $('signal').addEventListener('click', function () {
    online = !online;
    var s = $('signal'); s.setAttribute('aria-pressed', String(online)); s.querySelector('b').textContent = online ? 'online' : 'offline';
    document.querySelector('.road').classList.toggle('off', !online);
    // Sem sinal: todos os carrinhos da cidade param na hora.
    if (online) citySvg.unpauseAnimations(); else citySvg.pauseAnimations();
    $('road-note').textContent = online ? 'As viagens sobem para a planilha' : 'Sem sinal: as viagens esperam no celular';
    if (online) {
      var q = trips.filter(function (t) { return !t.synced; });
      if (q.length) { q.forEach(function (t) { t.synced = true; }); drive(true); toast(q.length + ' viagem(ns) enviada(s) sozinha(s) ao voltar a internet.'); }
    }
    render();
  });

  function cancel(t) {
    trips = trips.filter(function (x) { return x !== t; });
    toast('Viagem cancelada.'); render();
  }

  // Gestor: fechar PIX
  function open() { return trips.filter(function (t) { return t.synced && !t.paid; }); }
  function sum(list) { return list.reduce(function (s, t) { return s + t.value; }, 0); }
  $('pix-open').addEventListener('click', function () {
    var o = open(); if (!o.length) return;
    $('pix').hidden = !$('pix').hidden; $('pix-err').textContent = '';
    $('pix-sum').textContent = 'Entram no pagamento: ' + o.length + ' viagem(ns) · ' + brl(sum(o));
  });
  $('e2e-fake').addEventListener('click', function () {
    var d = new Date(), abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', r = '';
    for (var i = 0; i < 11; i++) r += abc[Math.floor(Math.random() * abc.length)];
    $('e2e').value = 'E' + '00000000' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + r;
  });
  $('pix').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('e2e').value.trim().toUpperCase(), o = open(), err = $('pix-err');
    if (!/^E[0-9A-Z]{31}$/.test(code)) { err.textContent = 'O código E2E começa com E e tem 32 caracteres.'; return; }
    var dup = pays.filter(function (p) { return p.e2e === code; })[0];
    if (dup) { err.textContent = 'Esse E2E já está no pagamento de ' + ddmm(dup.at) + '. Confira se não está pagando duas vezes.'; return; }
    if (!o.length) { err.textContent = 'Nada em aberto para fechar.'; return; }
    var p = { e2e: code, at: new Date(), n: o.length, total: sum(o) };
    o.forEach(function (t) { t.paid = p; });
    pays.unshift(p);
    $('e2e').value = ''; $('pix').hidden = true;
    toast('Pagamento PIX recebido: ' + brl(p.total) + '.');
    render();
  });

  // Tarifa: vale só para as próximas viagens; o valor fica gravado em cada viagem.
  $('fare-btn').addEventListener('click', function () {
    fare = fare === 50 ? 55 : 50;
    $('fare-btn').textContent = 'mudar para ' + brl(fare === 50 ? 55 : 50).replace(',00', '');
    toast('Tarifa agora é ' + brl(fare) + '. Viagens já lançadas não mudam.');
    render();
  });

  function payItem(p, mine) {
    var li = el('li');
    var left = el('span'); left.appendChild(el('b', '', 'PIX ')); left.appendChild(document.createTextNode(ddmm(p.at) + ' · ' + p.n + ' viagem(ns)'));
    left.appendChild(el('br')); left.appendChild(el('small', 'mono', 'E2E ' + maskE2E(p.e2e)));
    li.appendChild(left); li.appendChild(el('b', '', brl(p.total)));
    return li;
  }

  function render() {
    // Motorista
    document.querySelectorAll('.fare').forEach(function (b) { b.textContent = brl(fare); });
    var q = trips.filter(function (t) { return !t.synced; });
    $('queue').hidden = !q.length;
    $('queue').textContent = q.length + ' viagem(ns) aguardando internet — enviará sozinha';
    var due = trips.filter(function (t) { return t.synced && !t.paid; });
    $('due').textContent = brl(sum(due));
    $('due-n').textContent = due.length + ' viagem(ns) a receber';
    var ul = $('trips'); ul.replaceChildren();
    trips.slice().reverse().slice(0, 6).forEach(function (t) {
      var li = el('li');
      li.appendChild(el('span', 'tag ' + t.type, t.type));
      li.appendChild(el('span', 'meta', (t.today ? 'Hoje ' : 'Ontem ') + hhmm(t.t) + ' · ' + brl(t.value) + (t.desc ? ' · ' + t.desc : '')));
      if (t.paid) li.appendChild(el('span', 'paid', 'pago'));
      else if (!t.synced) li.appendChild(el('span', 'pend', 'aguardando'));
      else if (t.today) { var b = el('button', 'cancel', 'cancelar'); b.type = 'button'; b.addEventListener('click', function () { cancel(t); }); li.appendChild(b); }
      else li.appendChild(el('small', '', 'só o gestor cancela'));
      ul.appendChild(li);
    });
    if (!trips.length) ul.appendChild(el('li', 'none', 'nenhuma viagem'));
    [$('pays'), $('g-pays')].forEach(function (list) {
      list.replaceChildren();
      if (!pays.length) list.appendChild(el('li', 'none', 'nenhum ainda'));
      pays.forEach(function (p) { list.appendChild(payItem(p)); });
    });
    // Gestor (só vê o que já subiu para a planilha)
    var o = open();
    $('g-open').textContent = brl(sum(o));
    $('g-n').textContent = String(trips.filter(function (t) { return t.synced; }).length);
    $('g-driver').textContent = o.length ? o.length + ' viagem(ns) · ' + brl(sum(o)) + ' em aberto' : 'nada em aberto';
    $('pix-open').disabled = !o.length;
    if (!o.length) $('pix').hidden = true;
    else $('pix-sum').textContent = 'Entram no pagamento: ' + o.length + ' viagem(ns) · ' + brl(sum(o));
    $('g-fare').textContent = brl(fare);
  }
  render();
})();
