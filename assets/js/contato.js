// Página /contato/: preenche WhatsApp e e-mail a partir de contact.js e permite copiar.
(function () {
  var C = window.CONTACT;
  var whats = document.getElementById('whats'), mail = document.getElementById('mail'), status = document.getElementById('status');

  whats.href = C.whatsHref; whats.target = '_blank'; whats.rel = 'noopener';
  mail.href = C.mailHref;
  document.getElementById('whats-txt').textContent = C.whatsLabel;
  document.getElementById('mail-txt').textContent = C.mailLabel;

  [whats, mail].forEach(function (a) {
    a.addEventListener('click', function () {
      a.classList.add('up');
      status.textContent = '> LINK UP · abrindo ' + (a === whats ? 'o WhatsApp' : 'o seu e-mail') + '...';
    });
  });

  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy === 'whats' ? C.whatsLabel : C.mailLabel;
      var done = function () { status.textContent = '> copiado: ' + text; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { status.textContent = '> não deu para copiar; selecione o texto.'; });
    });
  });
})();
