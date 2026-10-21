// Visualizador dos prints: clicar num print da galeria (.shots) abre ele grande, com legenda.
// Setas ou deslizar trocam de print; Esc, ✕ ou clicar fora fecham. Usa <dialog> nativo. Só textContent.
(function () {
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.shots img'));
  if (!imgs.length || typeof HTMLDialogElement === 'undefined') return;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  var dlg = el('dialog', 'lb'); dlg.setAttribute('aria-label', 'Print ampliado');
  var big = el('img', 'lb-img'), cap = el('p', 'lb-cap'), count = el('span', 'lb-n');
  var close = el('button', 'lb-x', '✕'), prev = el('button', 'lb-prev', '‹'), next = el('button', 'lb-next', '›');
  close.type = prev.type = next.type = 'button';
  close.setAttribute('aria-label', 'Fechar'); prev.setAttribute('aria-label', 'Print anterior'); next.setAttribute('aria-label', 'Próximo print');
  var fig = el('figure', 'lb-fig'); fig.appendChild(big);
  var foot = el('div', 'lb-foot'); foot.appendChild(count); foot.appendChild(cap); fig.appendChild(foot);
  dlg.appendChild(fig); dlg.appendChild(prev); dlg.appendChild(next); dlg.appendChild(close);
  document.body.appendChild(dlg);

  var cur = 0;
  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    var src = imgs[cur], fc = src.closest('figure') && src.closest('figure').querySelector('figcaption');
    big.src = src.currentSrc || src.src; big.alt = src.alt;
    cap.textContent = fc ? fc.textContent.replace(/^\s*\d+\s*/, '') : src.alt;
    count.textContent = (cur + 1) + ' / ' + imgs.length;
  }
  function open(i) { show(i); if (!dlg.open) dlg.showModal(); document.documentElement.classList.add('lb-on'); }
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('lb-on'); imgs[cur].focus({ preventScroll: true }); });

  imgs.forEach(function (im, i) {
    im.tabIndex = 0; im.setAttribute('role', 'button'); im.classList.add('lb-zoom');
    im.setAttribute('aria-label', 'Ampliar: ' + im.alt);
    im.addEventListener('click', function () { open(i); });
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  close.addEventListener('click', function () { dlg.close(); });
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // clique no fundo
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });
  // Deslizar no celular
  var x0 = null;
  dlg.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  dlg.addEventListener('pointerup', function (e) {
    if (x0 == null) return; var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();
