// Página /futuros/: projetos em construção (soon em PROJECTS) + ideias (FUTURE). Só textContent.
(function () {
  var list = document.getElementById('list');

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  var items = window.PROJECTS.filter(function (d) { return d.soon; })
    .map(function (d) { return { p: d.p, name: d.name, d: d.d, st: '', stage: 'em construção', color: d.color }; })
    .concat(window.FUTURE);

  items.forEach(function (d, i) {
    var li = el('li', 'cab future');
    li.style.setProperty('--c', d.color);
    li.appendChild(el('span', 'n', String(i + 1).padStart(2, '0')));

    var w = el('div', 'wire-col');
    w.appendChild(el('div', 'wire'));
    w.appendChild(el('p', 'prob', d.p));
    li.appendChild(w);

    var info = el('div', 'info');
    info.appendChild(el('h2', '', d.name));
    info.appendChild(el('p', 'd', d.d));
    if (d.st) info.appendChild(el('p', 'st', d.st));
    li.appendChild(info);

    var go = el('div', 'go');
    go.appendChild(el('span', 'stage', d.stage));
    go.appendChild(el('span', 'muted', 'página e código em breve'));
    li.appendChild(go);

    list.appendChild(li);
  });
})();
