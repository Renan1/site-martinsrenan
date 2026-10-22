// Página da Apuração 2026: simulação da noite da eleição com candidatos e votos FICTÍCIOS.
// As regras são as do app: líderes por cargo (Senado com 2 vagas), avisos de troca de liderança, resumo dos deputados a cada 10 min,
// vagas por partido pelos mais votados. Só textContent.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var fmt = function (n) { return Math.round(n).toLocaleString('pt-BR'); };
  var pc = function (n) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'; };

  // Corridas: [nome, partido, % dos válidos no começo da apuração, % no fim]. Tudo inventado.
  var RACES = [
    { id: 'pres', cargo: 'Presidente', local: 'Brasil', vagas: 1, aviso: true, total: 118e6, cands: [['Candidata A', 'Partido Azul', 47.5, 45.1], ['Candidato B', 'Partido Verde', 42.5, 47.3], ['Candidata C', 'Partido Laranja', 6.8, 5.2], ['Candidato D', 'Partido Cinza', 3.2, 2.4]] },
    { id: 'gov', cargo: 'Governador', local: 'Seu estado', vagas: 1, aviso: true, total: 11.2e6, cands: [['Candidato E', 'Partido Roxo', 54.0, 51.6], ['Candidata F', 'Partido Azul', 36.5, 39.8], ['Candidato G', 'Partido Verde', 9.5, 8.6]] },
    { id: 'sen', cargo: 'Senado', local: 'Seu estado', vagas: 2, aviso: true, total: 21.5e6, cands: [['Candidata H', 'Partido Verde', 31.0, 28.6], ['Candidato I', 'Partido Roxo', 28.0, 25.9], ['Candidata J', 'Partido Azul', 24.0, 29.4], ['Candidato K', 'Partido Cinza', 17.0, 16.1]] },
    { id: 'presc', cargo: 'Presidente', local: 'Sua cidade', vagas: 1, aviso: false, total: 3.3e5, cands: [['Candidata A', 'Partido Azul', 41.0, 43.5], ['Candidato B', 'Partido Verde', 50.0, 49.0], ['Candidata C', 'Partido Laranja', 6.0, 5.1], ['Candidato D', 'Partido Cinza', 3.0, 2.4]] }
  ];
  // Deputado federal no seu estado: vagas por partido (votos do partido), eleitos = os mais votados de cada um.
  var DEP = { vagas: 12, partidos: [['Partido Azul', '#3B82F6', 27, 25], ['Partido Verde', '#22C55E', 20, 23.5], ['Partido Roxo', '#A855F7', 19, 18], ['Partido Laranja', '#F97316', 14, 15.5], ['Partido Cinza', '#94A3B8', 12, 10], ['Outros', '#64748B', 8, 8]] };

  var p = 0, playing = null, bell = false, prevLead = {}, lastSummary = -1, prevDep = null, tab = 'inicio', toastT = null;
  var ease = function (x) { return x * x * (3 - 2 * x); };
  var minutes = function () { return Math.round(p / 100 * 360); };
  var clock = function (m) { var h = 17 + Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; };

  function state(r) {
    var k = ease(p / 100), raw = r.cands.map(function (c) { return c[2] + (c[3] - c[2]) * k; }), sum = raw.reduce(function (a, b) { return a + b; }, 0);
    var counted = r.total * p / 100;
    var list = r.cands.map(function (c, i) { var sh = raw[i] / sum * 100; return { nome: c[0], partido: c[1], pct: p > 0 ? sh : 0, votos: counted * sh / 100 }; });
    if (p > 0) list.sort(function (a, b) { return b.votos - a.votos; });
    return list;
  }
  function seats() {
    var k = ease(p / 100), sh = DEP.partidos.map(function (x) { return x[2] + (x[3] - x[2]) * k; }), sum = sh.reduce(function (a, b) { return a + b; }, 0);
    // maiores restos, só para a simulação (o app usa as vagas que o TSE publica)
    var q = sh.map(function (s) { return s / sum * DEP.vagas; }), n = q.map(Math.floor), left = DEP.vagas - n.reduce(function (a, b) { return a + b; }, 0);
    q.map(function (x, i) { return [x - n[i], i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, left).forEach(function (x) { n[x[1]]++; });
    return DEP.partidos.map(function (x, i) { return { nome: x[0], cor: x[1], vagas: n[i], pct: sh[i] / sum * 100 }; });
  }

  // ---------- Telas do celular ----------
  function race(r) {
    var list = state(r), box = el('div', 'race');
    var h = el('div', 'rh'); h.appendChild(el('b', '', r.cargo)); h.appendChild(el('span', '', r.local)); box.appendChild(h);
    list.slice(0, r.vagas === 2 ? 4 : 3).forEach(function (c, i) {
      var row = el('div', 'cand' + (p > 0 && i < r.vagas ? ' lead' : ''));
      var nm = el('div', 'nm'); nm.appendChild(el('b', '', c.nome)); nm.appendChild(el('small', '', c.partido + ' · ' + fmt(c.votos) + ' votos')); row.appendChild(nm);
      row.appendChild(el('span', 'pc', pc(c.pct)));
      var bar = el('i', 'bar'); bar.style.setProperty('--w', c.pct.toFixed(2) + '%'); row.appendChild(bar);
      box.appendChild(row);
    });
    if (p >= 100) box.appendChild(el('div', 'fin', verdict(r, list)));
    return box;
  }
  function verdict(r, list) {
    if (r.id === 'presc') return 'Mais votado na cidade: ' + list[0].nome;
    if (r.vagas === 2) return 'Eleitos: ' + list[0].nome + ' e ' + list[1].nome;
    return list[0].pct > 50 ? 'Eleito no 1º turno: ' + list[0].nome : '2º turno: ' + list[0].nome + ' × ' + list[1].nome;
  }
  function paint() {
    var m = minutes(), v = $('v-inicio'); v.replaceChildren();
    var s = el('div', 'secoes'); s.appendChild(el('span', '', 'Seções totalizadas')); s.appendChild(el('b', '', pc(p)));
    var sb = el('i', 'bar'); sb.style.setProperty('--w', p + '%'); s.appendChild(sb); v.appendChild(s);
    RACES.forEach(function (r) { v.appendChild(race(r)); });

    var e = $('v-eleitos'); e.replaceChildren();
    e.appendChild(el('div', 'rh2', 'Deputado federal · Seu estado · ' + DEP.vagas + ' vagas'));
    var st = seats(), strip = el('div', 'seats');
    st.forEach(function (x) { for (var i = 0; i < x.vagas; i++) { var d = el('i', ''); d.style.setProperty('--c', x.cor); d.title = x.nome; strip.appendChild(d); } });
    e.appendChild(strip);
    st.forEach(function (x) { var row = el('div', 'party'); var dot = el('i', ''); dot.style.setProperty('--c', x.cor); row.appendChild(dot); row.appendChild(el('span', '', x.nome)); row.appendChild(el('b', '', p > 0 ? x.vagas + (x.vagas === 1 ? ' vaga' : ' vagas') : '—')); e.appendChild(row); });
    e.appendChild(el('p', 'note', p > 0 ? 'Enquanto o TSE não marca os eleitos, o app usa as vagas que o TSE já atribuiu a cada partido e pega os mais votados de cada um.' : 'A apuração ainda não começou.'));

    $('upd').textContent = p > 0 ? 'atualizado ' + clock(m) : 'aguardando 17h';
    $('hora').textContent = clock(m);
    $('prog').setAttribute('aria-valuetext', clock(m) + ', ' + pc(p) + ' das seções');
  }

  // ---------- Avisos ----------
  function check() {
    var m = minutes();
    RACES.forEach(function (r) {
      if (!r.aviso) return;
      var list = state(r), lead = p > 0 ? list.slice(0, r.vagas).map(function (c) { return c.nome; }) : [], prev = prevLead[r.id];
      prevLead[r.id] = lead;
      if (!bell || !prev || !prev.length || !lead.length || prev.join() === lead.join()) return;
      var msg = r.vagas === 1 ? list[0].nome + ' (' + list[0].partido + ') assumiu a liderança com ' + fmt(list[0].votos) + ' votos, passando ' + prev[0] + '.'
                              : 'Mudança entre os líderes: ' + list.slice(0, 2).map(function (c) { return c.nome + ' (' + fmt(c.votos) + ')'; }).join(' e ') + '.';
      notify(r.cargo + ' · ' + r.local, msg, true);
    });
    var slot = Math.floor(m / 10);
    // No app o resumo sai a cada 10 min; aqui o tempo corre rápido, então só aparece quando a divisão das vagas mudou.
    if (bell && p > 0 && slot !== lastSummary) {
      var split = seats().filter(function (x) { return x.vagas > 0; }).map(function (x) { return x.nome.replace('Partido ', '') + ' ' + x.vagas; }).join(' · ');
      if (prevDep && split !== prevDep) notify('Deputados · resumo de 10 min', 'Vagas agora: ' + split + ' ↺', false);
      prevDep = split;
    }
    lastSummary = slot;
  }
  function notify(title, msg, toast) {
    var li = el('li', toast ? 'hot' : ''); li.appendChild(el('time', '', clock(minutes()))); li.appendChild(el('b', '', title)); li.appendChild(el('span', '', msg));
    var log = $('log'); if (log.firstElementChild && log.firstElementChild.classList.contains('dim')) log.replaceChildren();
    log.prepend(li); while (log.children.length > 8) log.lastElementChild.remove();
    var av = $('v-avisos'); if (av.firstElementChild && av.firstElementChild.classList.contains('note')) av.replaceChildren();
    av.prepend(li.cloneNode(true)); while (av.children.length > 12) av.lastElementChild.remove();
    if (!toast) return;
    var t = $('toast'); t.replaceChildren(el('b', '', title), el('span', '', msg)); t.hidden = false;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4200);
  }

  function setP(v) { p = Math.max(0, Math.min(100, v)); $('prog').value = p; paint(); check(); }
  $('prog').addEventListener('input', function () { stop(); setP(parseFloat($('prog').value)); });
  function stop() { if (playing) { clearInterval(playing); playing = null; $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Reproduzir a apuração'); } }
  $('play').addEventListener('click', function () {
    if (playing) return stop();
    if (p >= 100) setP(0);
    $('play').textContent = '❚❚'; $('play').setAttribute('aria-label', 'Pausar');
    playing = setInterval(function () { setP(p + 0.5); if (p >= 100) stop(); }, 220);
  });
  $('bell').addEventListener('click', function () {
    bell = !bell; $('bell').setAttribute('aria-pressed', String(bell)); $('bell').textContent = bell ? 'Avisos ligados' : 'Ligar avisos';
    if (bell) { lastSummary = Math.floor(minutes() / 10); notify('Avisos ligados', 'Você será avisado quando mudar a liderança de Presidente, Governador ou Senado. Deputados: um resumo a cada 10 min.', false); if (!playing && p < 100) $('play').click(); }
  });
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      ['inicio', 'eleitos', 'avisos'].forEach(function (k) { $('v-' + k).hidden = k !== tab; });
    });
  });
  $('v-avisos').appendChild(el('p', 'note', 'Nenhum aviso ainda. Ligue os avisos ao lado e deixe a apuração correr.'));

  // ---------- Caminho dos dados: navegador × função × TSE ----------
  var reqs = 0, tse = 0, cachedAt = 0, busy = false, TTL = 55;
  var cacheLeft = function () { return Math.max(0, TTL - Math.floor((Date.now() - cachedAt) / 1000)); };
  function out(extra) { $('rout').textContent = 'pedidos ao app: ' + fmt(reqs) + ' · consultas ao TSE: ' + fmt(tse) + (extra ? ' · ' + extra : ''); }
  function shot(wire, dir, cls) { return new Promise(function (res) { var i = $(wire).firstElementChild; i.className = ''; void i.offsetWidth; i.className = dir + (cls ? ' ' + cls : ''); setTimeout(res, 520); }); }
  function flash(node, cls) { var n = $(node); n.classList.remove('ok', 'bad', 'hit'); void n.offsetWidth; n.classList.add(cls); }
  function lock(v) { busy = v; ['direct', 'via', 'crowd'].forEach(function (id) { $(id).disabled = v; }); }
  $('direct').addEventListener('click', function () {
    if (busy) return; lock(true); $('n-fn').classList.add('skip');
    shot('w1', 'fwd', 'thru').then(function () { return shot('w2', 'fwd', 'thru'); }).then(function () {
      flash('n-tse', 'bad'); out('bloqueado: o TSE não libera leitura vinda de outros sites, e o navegador descarta a resposta (CORS)');
      $('n-fn').classList.remove('skip'); lock(false);
    });
  });
  function via(n) {
    if (busy) return; lock(true); reqs += n;
    var hit = cacheLeft() > 0;
    var go = shot('w1', 'fwd');
    if (!hit) go = go.then(function () { return shot('w2', 'fwd'); }).then(function () { tse++; flash('n-tse', 'ok'); cachedAt = Date.now(); return shot('w2', 'back'); });
    go.then(function () { flash('n-fn', hit ? 'hit' : 'ok'); return shot('w1', 'back'); }).then(function () {
      flash('n-user', 'ok');
      out(n > 1 ? (hit ? n + ' respostas direto do cache' : '1 consulta ao TSE, ' + (n - 1) + ' respostas do cache') : (hit ? 'resposta do cache (sem ir ao TSE)' : 'buscou no TSE e guardou por ' + TTL + ' s'));
      lock(false);
    });
  }
  $('via').addEventListener('click', function () { via(1); });
  $('crowd').addEventListener('click', function () { via(200); });
  setInterval(function () { var s = cacheLeft(); $('cache').textContent = cachedAt && s > 0 ? 'cache: ' + s + ' s' : (cachedAt ? 'cache expirou' : 'cache vazio'); $('n-fn').classList.toggle('warm', s > 0 && !!cachedAt); }, 500);

  paint(); check();
})();
