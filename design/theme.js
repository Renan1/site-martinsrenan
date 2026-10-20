// Botão de tema: alterna claro/escuro e lembra a escolha neste navegador.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
  } catch (e) {}

  function current() {
    if (root.dataset.theme) return root.dataset.theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    function label() { btn.textContent = current() === 'dark' ? 'Tema claro' : 'Tema escuro'; }
    label();
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
  });
})();
