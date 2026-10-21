// Contato: montado em pedaços para não aparecer pronto no HTML (dificulta robôs de spam).
// Para trocar o e-mail (ex.: quando existir contato@martinsrenan.com.br), mude só "mail" abaixo.
window.CONTACT = (function () {
  var phone = ['55', '32', '98813', '4420'];
  var mail = ['renanasmartins', 'gmail.com'];
  var msg = 'Olá Renan, vi seu site e quero conversar sobre um problema.';
  return {
    whatsLabel: '+' + phone[0] + ' (' + phone[1] + ') ' + phone[2] + '-' + phone[3],
    whatsHref: 'https://wa.me/' + phone.join('') + '?text=' + encodeURIComponent(msg),
    mailLabel: mail.join('@'),
    mailHref: 'mailto:' + mail.join('@') + '?subject=' + encodeURIComponent('Contato pelo site')
  };
})();
