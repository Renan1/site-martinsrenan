// Fonte única dos projetos: usada pelo painel (index) e pela página /projetos/.
// p = problema (porta de cima) · s = solução (porta de baixo) · page = pasta em /projetos/ quando a página existir.
// soon = projeto em construção (aparece no painel e em /futuros/, não em /projetos/).
window.PROJECTS = (function () {
  var GH = 'https://github.com/Renan1/';
  return [
    { id: 'viagens',  p: 'Viagens sem registro',    s: 'Lançamento de viagens',     name: 'Lançamento de viagens',     d: 'As viagens (ex.: Uber) lançadas pelo celular, com histórico para a gestão.', st: 'PWA · Apps Script', page: 'viagens', repo: GH + 'viagens-couveflor', color: '#3B82F6' },
    { id: 'qr',       p: 'Controle de entrada',     s: 'Leitor QR Code',            name: 'Leitor de QR Code',         d: 'A câmera lê o QR Code e registra cada entrada por refeição e data.', st: 'JavaScript · PWA', page: 'leitor-qr', repo: GH + 'leitor-qr-couveflor', color: '#FACC15' },
    { id: 'tv',       p: 'Comunicação interna',     s: 'TV corporativa',            name: 'TV corporativa',            d: 'Uma TV com o conteúdo de comunicação interna da empresa.', st: 'HTML · Raspberry Pi', page: 'tv', repo: GH + 'tv-couveflor', color: '#EF4444' },
    { id: 'scanner',  p: 'Digitalizar documentos',  s: 'Scanner / PDF',             name: 'Scanner / PDF tools',       d: 'Digitaliza, lê o texto (OCR), renomeia e gera PDF no celular. Nada sai do aparelho.', st: 'PWA · OCR · pdf-lib', page: 'scanner', priv: true, color: '#22C55E' },
    { id: 'ti',       p: 'Problema com a TI',       s: 'Soluções em TI',            name: 'Soluções em TI',            d: 'Infraestrutura, redes e segurança: minha experiência em TI, comprovada.', st: 'infra · redes · segurança', page: 'ti', color: '#F97316' },
    { id: 'sites',    p: 'Site desatualizado',      s: 'Sites que atraem clientes', name: 'Sites que atraem clientes', d: 'Sites rápidos, seguros e com SEO. Exemplos: o site da Couve Flor e este portfólio.', st: 'HTML · SEO · GitHub Pages', page: 'sites', repo: GH + 'couveflor-site', color: '#E5E7EB' },
    { id: 'cardapio', p: 'Post diário do cardápio', s: 'Gerador de cardápio',       name: 'Gerador de cardápio',       d: 'Gera a arte do cardápio do dia pronta para postar nas redes.', st: 'HTML · Canvas', page: 'cardapio', repo: GH + 'gerarcardapio-couveflor', color: '#A855F7' },
    { id: 'dash',     p: 'Empresa em planilha',     s: 'Dashboard interativo',      name: 'Dashboard interativo',      d: 'Os números da empresa num painel interativo, no lugar das planilhas.', st: 'Cloudflare Workers · Python', page: 'dashboard', priv: true, color: '#EC4899' },
    { id: 'financas', p: 'Finanças pessoais',       s: 'App financeiro',            name: 'App financeiro familiar',   d: 'Registra cada gasto na hora, mesmo sem sinal. Fechado por login.', st: 'PWA · Supabase', page: 'financas', repo: GH + 'sistemafinanceiro-familiar', color: '#14B8A6' },
    { id: 'preco',    p: 'Preço no chute',          s: 'Gerador de preço',          name: 'Gerador de preço',          d: 'Define o preço de venda de cada produto a partir dos custos, em vez de no achismo.', st: 'em construção', soon: true, color: '#06B6D4' },
    { id: 'apuracao', p: 'Acompanhar apuração',     s: 'Apuração 2026',             name: 'Apuração 2026',             d: 'Acompanha a apuração com dados públicos do TSE, via funções no servidor.', st: 'Netlify · Worker', repo: GH + 'apuracao2026', color: '#84CC16' },
    { id: 'contato',  p: 'Seu problema',            s: 'Vamos conversar',           name: 'Vamos conversar',           d: 'Me conte o problema. Eu desenho a solução com você.', st: 'contato', cta: true, color: '#FFB547' }
  ];
})();

// Futuros projetos: ideias e protótipos que ainda não estão no painel.
window.FUTURE = [
  { id: 'coach', p: 'Treinar inglês para entrevistas', name: 'English Coach', d: 'Tutora de inglês falado com IA: conversa por voz e corrige cada frase.', st: 'Worker · Supabase · Claude', stage: 'protótipo', color: '#94A3B8' }
];
