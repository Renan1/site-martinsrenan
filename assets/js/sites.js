// Página do projeto Sites: raio-X arrastável sobre o print real + checklist medido (21/10/2026).
// Os trechos de código abaixo são reais, extraídos dos sites; nada é inventado.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var IMG = '../../assets/img/sites/';
  // Cada linha: [classe, texto]; classe 'opt' some em telas pequenas.
  var CASES = {
    cf: {
      url: 'couveflorrefeicoes.com.br', href: 'https://couveflorrefeicoes.com.br/', img: 'cf',
      alt: 'Site da Couve Flor: restaurante corporativo em Juiz de Fora, com chamada para orçamento e WhatsApp.',
      code: [
        ['tag', '<title>'], ['val', 'Couve Flor | Restaurante Corporativo em Juiz de Fora - MG'],
        ['tag', '<meta name="description">'], ['val opt', 'Restaurante corporativo em Juiz de Fora - MG desde 2015…'],
        ['tag', '<script type="application/ld+json">'], ['val', '{ "@type": "Restaurant", "address", "areaServed", "servesCuisine", "telephone" }'],
        ['tag opt', '<meta property="og:*"> × 7 · twitter:* × 4'],
        ['cm', '# robots.txt → Sitemap: /sitemap.xml'],
        ['cm', '# http:// e www → 301 → https://couveflorrefeicoes.com.br/'],
        ['val', '11/11 imagens com alt · 0 rastreadores']
      ],
      checksH: 'Raio-X · Couve Flor',
      checks: [
        ['SEO local no título e na descrição', '"Restaurante Corporativo em Juiz de Fora - MG"'],
        ['Dados estruturados de restaurante (Schema.org)', 'JSON-LD @type Restaurant: endereço, área atendida, cozinha, telefone'],
        ['Compartilhamento bonito no WhatsApp e redes', '7 tags Open Graph + 4 do Twitter'],
        ['Google encontra todas as páginas', 'robots.txt + sitemap.xml + URL canônica + lang="pt-BR"'],
        ['HTTPS forçado e endereço único', 'http:// e www redirecionam (301) para https://couveflorrefeicoes.com.br/'],
        ['Contato em um toque', 'botão de WhatsApp e link de telefone'],
        ['Acessível e sem espionar o visitante', '11 de 11 imagens com texto alternativo · nenhum rastreador']
      ]
    },
    rm: {
      url: 'martinsrenan.com.br', href: '../../', img: 'rm',
      alt: 'Este portfólio: o patch panel da página inicial, com problemas e soluções em portas de rede.',
      code: [
        ['tag', '<meta http-equiv="Content-Security-Policy">'], ['val', "default-src 'self'; script-src 'self'; connect-src 'none'; form-action 'none'"],
        ['cm', '# fontes: assets/fonts/*.woff2 (locais, licença OFL)'],
        ['val', '0 scripts, fontes ou estilos de outros domínios'],
        ['val', 'página inicial: 73 KB (HTML + CSS + JS + fontes)'],
        ['cm', '# 12 páginas · links relativos · sem build'],
        ['tag', 'el.textContent = texto'], ['cm opt', '// nunca innerHTML com texto de fora'],
        ['cm', '# GitHub Pages + .nojekyll']
      ],
      checksH: 'Raio-X · este portfólio',
      checks: [
        ['Política de segurança (CSP) em todas as páginas', '12 de 12 páginas · só o próprio site pode carregar código'],
        ['Nada de terceiros', '0 scripts, fontes ou estilos externos · fontes .woff2 locais'],
        ['Leve', 'página inicial com 73 KB, contando fontes e scripts'],
        ['Seguro contra injeção de código', 'textos sempre com textContent, nunca innerHTML'],
        ['Dados de clientes protegidos', 'prints de apps com CNPJ, PIX e nomes tarjados; dados fictícios nas simulações'],
        ['Simples de manter', 'HTML, CSS e JavaScript puros, sem framework e sem etapa de build']
      ]
    }
  };

  var view = $('view'), code = $('code'), handle = $('handle');

  function load(id) {
    var c = CASES[id];
    document.querySelectorAll('.case').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.case === id)); });
    $('url').textContent = 'https://' + c.url;
    $('visit').href = c.href;
    $('shot-d').src = IMG + c.img + '-desktop.jpg'; $('shot-d').alt = c.alt;
    $('shot-m').src = IMG + c.img + '-mobile.jpg'; $('shot-m').alt = c.alt + ' Versão de celular.';
    code.replaceChildren();
    c.code.forEach(function (l) { var d = document.createElement('div'); d.className = 'ln ' + l[0]; d.textContent = l[1]; code.appendChild(d); });
    $('checks-h').textContent = c.checksH;
    var ul = $('checks'); ul.replaceChildren();
    c.checks.forEach(function (k) { var li = document.createElement('li'), t = document.createElement('div'); var b = document.createElement('b'); b.textContent = k[0]; var s = document.createElement('small'); s.textContent = k[1]; t.appendChild(b); t.appendChild(s); li.appendChild(t); ul.appendChild(li); });
    $('measured').textContent = 'Medido em 21/10/2026 ' + (id === 'cf' ? 'no site publicado.' : 'nos arquivos deste repositório.');
    $('map').hidden = id !== 'rm';
  }
  document.querySelectorAll('.case').forEach(function (b) { b.addEventListener('click', function () { load(b.dataset.case); }); });

  // Raio-X: arrastar (mouse ou dedo) ou usar as setas do teclado.
  function setSplit(p) {
    p = Math.max(8, Math.min(92, p));
    view.style.setProperty('--split', p + '%');
    handle.setAttribute('aria-valuenow', String(Math.round(p)));
  }
  var dragging = false;
  function at(e) { var r = view.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); }
  view.addEventListener('pointerdown', function (e) { dragging = true; try { view.setPointerCapture(e.pointerId); } catch (err) {} at(e); });
  view.addEventListener('pointermove', function (e) { if (dragging) at(e); });
  view.addEventListener('pointerup', function () { dragging = false; });
  view.addEventListener('pointercancel', function () { dragging = false; });
  handle.addEventListener('keydown', function (e) {
    var now = +handle.getAttribute('aria-valuenow');
    if (e.key === 'ArrowLeft') { setSplit(now - 5); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setSplit(now + 5); e.preventDefault(); }
  });

  // Mapa dos "sites dentro do site": as páginas reais deste portfólio.
  var pages = [['Página inicial · patch panel', '../../', '/'], ['Projetos concluídos', '../', '/projetos/'], ['Futuros projetos', '../../futuros/', '/futuros/'], ['Contato', '../../contato/', '/contato/']];
  window.PROJECTS.filter(function (p) { return p.page; }).forEach(function (p) { pages.push([p.name, '../' + p.page + '/', '/projetos/' + p.page + '/']); });
  var ul = $('pages');
  pages.forEach(function (p) {
    var li = document.createElement('li'), a = document.createElement('a'); a.href = p[1];
    a.appendChild(document.createTextNode(p[0])); var s = document.createElement('small'); s.textContent = p[2]; a.appendChild(s);
    li.appendChild(a); ul.appendChild(li);
  });

  load('cf');
  setSplit(55);
})();
