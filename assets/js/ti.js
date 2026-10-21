// Página Soluções em TI: a carreira (do currículo) como um rack. Clicar puxa o servidor e mostra a fase no console;
// clicar numa competência acende as fases em que ela foi usada. Só textContent.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // Do topo (hoje) para a base (começo).
  var ROLES = [
    { id: 'gestor', role: 'Gestor Geral / Diretor de Operações', org: 'Couve Flor Refeições', yr: '2026 –', short: 'GESTAO-GERAL',
      did: ['Gestão integral da empresa: finanças, operação, comercial, pessoas e tecnologia.',
            'Dashboard executivo com finanças, volumes, contratos e conciliações.',
            'Novo site institucional e migração de hospedagem, reduzindo custos de TI.',
            'TV corporativa para comunicação interna e ponto digital por reconhecimento facial.',
            'Orçamento (OPEX/CAPEX), compras, produção e automação de processos com IA.'],
      links: [['Dashboard', '../dashboard/'], ['TV corporativa', '../tv/'], ['Site institucional', '../sites/']] },
    { id: 'sup', role: 'Supervisor de TI', org: 'Esdeva Indústria Gráfica', yr: '2024 – 2026', short: 'SUPERVISAO-TI',
      did: ['Estratégia de TI alinhada ao negócio; equipe multidisciplinar de 8 profissionais.',
            'Governança e compliance: ISO 9001 e 14001, e preparação para a ISO 27001.',
            'Modernização de redes, servidores, controle de acesso e backup.',
            'Segurança: segmentação de rede, gestão de vulnerabilidades e monitoramento de incidentes.',
            'Orçamento de TI (CAPEX/OPEX), fornecedores e contratos; ERP Protheus e sistema de produção.'] },
    { id: 'lider', role: 'Líder Técnico de Infraestrutura de TI', org: 'T-Systems · cliente Ardagh Glass Packaging', yr: '2023 – 2024', short: 'INFRA-FABRICA',
      did: ['Liderou a implantação da infraestrutura de TI/OT de uma fábrica nova de embalagens de vidro.',
            'Padrões alinhados com o time global (Europa); mapa de rede a partir das plantas baixas.',
            'Datacenter conforme normas ABNT e padrões globais; switches de acesso e core por área.',
            'Seleção e negociação de fornecedores; homologação de servidores, storages e switches.',
            'Controle do orçamento CAPEX/OPEX do projeto, com o PMO de TI.'] },
    { id: 'sr', role: 'Analista de Suporte Sênior / Especialista de TI', org: 'HCL Technologies · cliente Becton Dickinson', yr: '2016 – 2023', short: 'ESPECIALISTA-TI',
      did: ['Suporte nível 3 a cerca de 700 usuários na planta.',
            'Servidores físicos e virtuais (Dell, VMware), rede Cisco e telecom (Avaya).',
            'Gestão de Segurança da Informação da planta, com treinamentos.',
            'Migração do ERP SAP ECC 6.0, backup Veritas/Symantec e links MPLS.',
            'Três prêmios de reconhecimento do cliente e da HCL.'] },
    { id: 'jr', role: 'Analista de Suporte Jr.', org: 'Becton Dickinson', yr: '2013 – 2016', short: 'SUPORTE-JR',
      did: ['Suporte nível 2 e 3 e perfis de acesso no ERP SAP.',
            'Servidores Dell/VMware e rede Cisco; virtualização com VMware ESXi.',
            'Documentação de TI segundo ITIL v3 e controle de ativos.',
            'Apoio a projetos de CAPEX e controle de OPEX.'] },
    { id: 'est', role: 'Estagiário / Analista de Suporte', org: 'Becton Dickinson', yr: '2011 – 2013', short: 'HELPDESK',
      did: ['Helpdesk nível 1 para usuários, aplicações de produção e softwares.',
            'Primeiras avaliações técnicas de rede e servidores.'] }
  ];
  // Competência → fases em que foi usada (do currículo). cert = vem de certificação/curso.
  var SKILLS = {
    'Infraestrutura e redes': [['Datacenter', ['lider', 'sup']], ['Redes Cisco', ['jr', 'sr', 'lider', 'sup']], ['Servidores Dell', ['jr', 'sr', 'lider']],
      ['VMware', ['jr', 'sr']], ['Telecom (Avaya)', ['sr']], ['Backup e recuperação', ['jr', 'sr', 'sup']], ['TI/OT industrial', ['lider']]],
    'Segurança e governança': [['Segurança da Informação', ['jr', 'sr', 'sup']], ['ISO 27001', ['sup']], ['ISO 9001 · 14001', ['sup']],
      ['ITIL v3', ['jr']], ['Compliance', ['sup']], ['Ethical Hacking e Pentest', [], true]],
    'Sistemas e dados': [['ERP SAP', ['jr', 'sr']], ['ERP Protheus', ['sup']], ['Power BI', ['sr', 'sup', 'gestor']],
      ['Power Automate · SharePoint', ['sup']], ['IA e automação', ['gestor']], ['Microsoft Azure', [], true]],
    'Gestão': [['Liderança de equipe', ['sup', 'gestor']], ['CAPEX/OPEX', ['jr', 'sr', 'lider', 'sup', 'gestor']], ['Fornecedores e contratos', ['lider', 'sup', 'gestor']],
      ['Gestão de projetos', ['lider', 'sup']], ['Gestão financeira e de pessoas', ['gestor']]]
  };
  var CERTS = [
    ['Pós-graduação em Cybersecurity', 'Univ. Cruzeiro do Sul · 2021', '#7CFFB0'], ['Bacharelado em Sistemas de Informação', 'CESJF · 2013', '#7CFFB0'],
    ['Ethical Hacker e Pentest', 'Solyd School · 2019', '#FF6B6B'], ['CCNA 640-802 / 200-125', 'Tranning RJ · 2013', '#3B82F6'],
    ['ITIL v3', 'Tranning RJ · 2013', '#FFB547'], ['Power BI', 'Udemy · 2020', '#FACC15'],
    ['Windows Azure', 'Udemy · 2020', '#3B82F6'], ['Gestão de Projetos', 'Harvard Manager Mentor · 2015', '#A855F7']
  ];

  var units = {}, selected = null, skill = null;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  // Rack
  ROLES.forEach(function (r, i) {
    var b = el('button', 'unit'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('role', 'listitem');
    b.appendChild(el('span', 'led'));
    var l = el('span', 'lbl'); l.appendChild(el('b', '', 'U' + (ROLES.length - i) + ' · ' + r.short)); l.appendChild(el('small', '', r.role)); b.appendChild(l);
    b.appendChild(el('span', 'yr', r.yr));
    b.addEventListener('click', function () { select(r.id, true); });
    $('rack').appendChild(b); units[r.id] = b;
  });

  function select(id, user) {
    selected = id;
    Object.keys(units).forEach(function (k) { units[k].setAttribute('aria-pressed', String(k === id)); });
    var r = ROLES.filter(function (x) { return x.id === id; })[0], c = $('console'); c.replaceChildren();
    c.appendChild(el('div', 'dim', 'rack-carreira · ' + r.short.toLowerCase() + ' · status: ' + (id === 'gestor' ? 'em produção' : 'concluído')));
    c.appendChild(el('div', 'h', r.role));
    c.appendChild(el('div', '', r.org + ' · ' + (/–$/.test(r.yr) ? r.yr + ' hoje' : r.yr)));
    var ul = el('ul'); r.did.forEach(function (d) { ul.appendChild(el('li', '', d)); }); c.appendChild(ul);
    var used = []; Object.keys(SKILLS).forEach(function (g) { SKILLS[g].forEach(function (s) { if (s[1].indexOf(id) >= 0) used.push(s[0]); }); });
    var t = el('div', 'tags'); used.forEach(function (u) { t.appendChild(el('span', '', u)); }); c.appendChild(t);
    if (r.links) {
      var lk = el('div', 'links'); c.appendChild(el('div', 'dim', '> entregas desta fase no portfólio:'));
      r.links.forEach(function (x) { var a = el('a', '', x[0] + ' →'); a.href = x[1]; lk.appendChild(a); }); c.appendChild(lk);
    }
    if (user && innerWidth < 1000) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Competências: acendem as fases em que foram usadas
  Object.keys(SKILLS).forEach(function (g) {
    var box = el('div', 'group'); box.appendChild(el('h3', '', g));
    var chips = el('div', 'chips');
    SKILLS[g].forEach(function (s) {
      var b = el('button', 'chip' + (s[2] ? ' cert' : ''), s[0]); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { light(skill === s[0] ? null : s); });
      chips.appendChild(b);
    });
    box.appendChild(chips); $('skills').appendChild(box);
  });
  function light(s) {
    skill = s ? s[0] : null;
    document.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.textContent === skill)); });
    $('clear').hidden = !skill;
    Object.keys(units).forEach(function (k) {
      var on = s && s[1].indexOf(k) >= 0;
      units[k].classList.remove('lit'); void units[k].offsetWidth;
      units[k].classList.toggle('lit', !!on);
      units[k].classList.toggle('dim', !!s && s[1].length > 0 && !on);   // competência só de curso não apaga o rack
    });
    var recent = s && ROLES.filter(function (r) { return s[1].indexOf(r.id) >= 0; })[0];   // ROLES vai do topo (hoje) para a base
    if (recent) select(recent.id);                               // abre a fase mais recente em que foi usada
    else if (s && s[2]) {
      selected = null; Object.keys(units).forEach(function (k) { units[k].setAttribute('aria-pressed', 'false'); });   // nenhum servidor aberto
      var c = $('console'); c.replaceChildren(); c.appendChild(el('div', 'h', s[0])); c.appendChild(el('div', '', 'Competência de certificação/curso — veja em "Módulos instalados", logo abaixo.')); }
  }
  $('clear').addEventListener('click', function () { light(null); });

  // Formação e certificações como módulos do switch
  CERTS.forEach(function (c) { var li = el('li'); li.style.setProperty('--c', c[2]); li.appendChild(el('b', '', c[0])); li.appendChild(el('small', '', c[1])); $('sfp').appendChild(li); });

  select('gestor');
})();
