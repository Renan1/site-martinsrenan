// Cartões digitais: troca Pessoal/Corporativo (lembrada no endereço: #corporativo), QR Code e compartilhar.
// Os dados de cada pessoa ficam no HTML da página (data-* no .card); aqui só o comportamento.
(function () {
  var card = document.querySelector('.card');
  if (!card) return;
  var url = card.dataset.url;
  var buttons = card.querySelectorAll('[data-set-mode]');
  var panels = { personal: document.getElementById('panel-personal'), corporate: document.getElementById('panel-corporate') };
  var dialog = document.getElementById('qr');
  var toastTimer;

  function mode() { return card.dataset.mode; }
  function link(m) { return m === 'corporate' ? url + '#corporativo' : url; }

  function setMode(m, fromHash) {
    card.dataset.mode = m;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setMode === m)); });
    panels.personal.hidden = m !== 'personal';
    panels.corporate.hidden = m !== 'corporate';
    if (!fromHash) history.replaceState(null, '', m === 'corporate' ? '#corporativo' : location.pathname + location.search);
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function share() {
    var m = mode();
    var data = { title: card.dataset[m === 'corporate' ? 'titleCorporate' : 'titlePersonal'], url: link(m) };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.url).then(function () { toast('Link copiado'); }, function () { toast(data.url); });
    } else toast(data.url);
  }

  function openQr() {
    var m = mode();
    var corp = m === 'corporate';
    dialog.querySelector('img').src = corp ? 'qr-corporativo.svg' : 'qr.svg';
    dialog.querySelector('.qr-nome').textContent = card.dataset[corp ? 'titleCorporate' : 'titlePersonal'];
    dialog.querySelector('.qr-url').textContent = link(m).replace('https://', '');
    if (dialog.showModal) dialog.showModal(); else window.open(dialog.querySelector('img').src);
  }

  buttons.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.setMode); }); });
  document.getElementById('btn-share').addEventListener('click', share);
  document.getElementById('btn-qr').addEventListener('click', openQr);
  dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  window.addEventListener('hashchange', function () { setMode(location.hash === '#corporativo' ? 'corporate' : 'personal', true); });

  setMode(location.hash === '#corporativo' ? 'corporate' : 'personal', true);
})();
