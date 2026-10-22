// Página /projetos/: monta a lista a partir de assets/js/projects.js (só textContent, nunca innerHTML).
(function () {
  var list = document.getElementById('list');

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function link(text, href, cls) {
    var a = el('a', cls || '', text); a.href = href;
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }

  // Só os concluídos: em construção vai para /futuros/ e o contato fica no menu.
  window.PROJECTS.filter(function (d) { return !d.soon && !d.cta; }).forEach(function (d, i) {
    var li = el('li', 'cab' + (d.cta ? ' cta' : ''));
    li.style.setProperty('--c', d.color);
    li.appendChild(el('span', 'n', String(i + 1).padStart(2, '0')));

    var w = el('div', 'wire-col');
    w.appendChild(el('div', 'wire'));
    w.appendChild(el('p', 'prob', d.p));
    li.appendChild(w);

    var info = el('div', 'info');
    info.appendChild(el('h2', '', d.name));
    info.appendChild(el('p', 'd', d.d));
    info.appendChild(el('p', 'st', d.st));
    li.appendChild(info);

    var go = el('div', 'go');
    if (d.page) go.appendChild(link('abrir projeto →', d.page + '/', 'open'));
    else go.appendChild(el('span', 'muted', 'página em construção'));
    if (d.repo) go.appendChild(link('código no GitHub ↗', d.repo));
    else if (d.priv) go.appendChild(el('span', 'muted', 'código privado'));
    li.appendChild(go);

    list.appendChild(li);
  });
})();
