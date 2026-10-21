# Site martinsrenan.com.br — guia para o Claude Code

Portfólio de projetos de TI e IA do Renan Martins. Dono: Renan (TI/infra/cyber; iniciante em web moderno). Explicar em português, comandos para PowerShell/Windows, dizer o que cada coisa faz antes de rodar.

## Decisões aprovadas
- Domínio: `martinsrenan.com.br` (registrado no registro.br). DNS vai para o CLOUDFLARE (decisão 2026-10-21, para usar o Email Routing no contato@; a doc do Cloudflare exige DNS no Cloudflare). `martinsrenan.dev` será comprado depois no Cloudflare e redirecionado para o .com.br.
- Hospedagem: GitHub Pages, repo público `Renan1/site-martinsrenan`.
- Conteúdo: projetos de TI e IA criados pelo Renan, incluindo os da empresa Couveflor (dele e da esposa). Os sistemas mantêm os endereços atuais; o portfólio só aponta para eles.
- Repos privados (`scanner-couveflor`, `couveflor-dashboard`, `precificacao-couveflor`): mostrar descrição e imagens, sem link para o código.
- Visual: robusto, organizado, atrativo e autoral. Nada de cara de template ou de "site feito por IA" (evitar gradiente roxo genérico, cards idênticos, emojis como ícone, textos de marketing vazios).
- 2026-10-20: as 3 maquetes em `design/` (A casos, B mapa, C diário) foram RECUSADAS por parecerem padrão de LLM. Ficam só como registro do que evitar.
- Novo processo de design: prompt → imagem → código. Renan traz uma imagem de referência (mock) e usamos a skill `/img-to-html` (com `/to-wireframe`), etapa por etapa, com aprovação em cada uma.
- Skills `img-to-html` e `to-wireframe` (github.com/rtadewald/skills, sem licença) ficam em `~/.claude/skills`, NÃO no repo. Em outro PC, reinstalar (ver "Skills" abaixo). A geração de imagens via OpenRouter (`openrouter-img`) NÃO foi instalada: é paga e precisa de chave. Só com OK do Renan.
- Estrutura do site: a PÁGINA INICIAL é interativa (o visitante mexe em algo e descobre quem é o Renan); os PROJETOS ficam numa página separada, dedicada a eles.
- 2026-10-21: wireframes D/E/F da branch `claude/determined-meitner-esifiv` vistos e não escolhidos (branch não foi juntada). Conceitos interativos v3 em `design/v3/`.
- Adaptações ao Windows na skill: `start index.html` no lugar de `open`; `$skill` = `/skill` no Claude Code.

## Estrutura do site (2026-10-21)
Site estático SEM build (sem Vite, sem node_modules): HTML + CSS + JS puros, publicado como está no GitHub Pages.
```
index.html                  página inicial (patch panel)
projetos/index.html         projetos concluídos
futuros/index.html          em construção + próximos projetos (futuros.js)
contato/index.html          WhatsApp + e-mail (dados em assets/js/contact.js, montados em pedaços contra robôs de spam)
projetos/<slug>/index.html  página interativa de cada projeto (hoje: scanner, leitor-qr, cardapio, viagens, tv, dashboard, financas, sites, ti, preco, apuracao — todas as portas)
assets/css/  base.css (cores, tema, cabeçalho) · fonts.css · patch.css · projetos.css · scanner.css
assets/js/   projects.js (FONTE ÚNICA dos 12 projetos) · patch.js · projetos.js · scanner.js · theme.js
assets/fonts/ fontes locais .woff2 (OFL, ver LICENCAS.md) · assets/img/favicon.svg
design/      protótipos e maquetes (não fazem parte do site)
tools/serve.mjs  servidor local
.nojekyll    faz o GitHub Pages servir os arquivos sem processar
```
- Ver localmente: `node tools/serve.mjs` e abrir http://localhost:4173 (o servidor do app desliga quando a sessão reinicia: se localhost não abrir, é isso)
- Galeria de prints: `<ol class="shots"><li><figure><img>…<figcaption>` + `assets/css/lightbox.css` e `assets/js/lightbox.js` na página = clicar amplia o print (setas/deslizar troca, Esc fecha). Usado em scanner, leitor-qr, cardapio, viagens, dashboard, financas.
- Fonte manuscrita: Kalam (a Nanum Pen Script foi trocada porque não tem acentos do português).
- Nova página de projeto: criar `projetos/<slug>/index.html` + `assets/css/<slug>.css` + `assets/js/<slug>.js` e pôr `page: '<slug>'` no projeto em `projects.js`.
- Links sempre RELATIVOS (`projetos/`, `../`, `../../`), para funcionar no domínio e no localhost.
- Cada página tem CSP em `<meta>`: só arquivos do próprio site, sem CSS/JS embutido no HTML (nada de `<style>`, `<script>` inline ou `style=""`). Variáveis CSS setadas por JS (`el.style.setProperty`) são permitidas.

## Regras de segurança
0. Prints de apps: só com documentos de teste, e TARJAR (faixa preta) CNPJ, nº de série de maquininha, nomes de empresas clientes (no texto também: usar Cliente A/B/C), códigos de crachá, chave PIX, código E2E, links pessoais (?m=) e qualquer dado real (mesmo fictício, se tiver formato de dado real) antes de pôr em `assets/img/`. Conferir o resultado ampliado.
1. Repo é público: nunca commitar segredos, chaves, `.env`, dados pessoais ou de clientes.
2. Nunca `innerHTML` com texto vindo de fora; usar `textContent`.
3. CSP e cabeçalhos de segurança onde a hospedagem permitir (GitHub Pages não aceita headers: usar `<meta http-equiv="Content-Security-Policy">`).
4. Sem scripts de terceiros desnecessários (sem trackers). Fontes e libs locais sempre que possível.
5. Segredo em diff => parar e avisar.

## Regras de trabalho
- Passo a passo, sem correria. Construir localmente, Renan vê no navegador, dá OK, aí commit e push.
- Pedir confirmação antes de: DNS, compras, dependências grandes, qualquer publicação.
- Commits pequenos; nunca `git push --force`.
- Marcar incertezas como "suposição"; consultar docs oficiais.

## DNS e domínio (estado em 2026-10-21, ~20h)
- Site no ar em https://renan1.github.io/site-martinsrenan/ (GitHub Pages, branch main, raiz).
- Cloudflare: conta do Renan, domínio adicionado (plano Free, "Connect a domain"). Nameservers atribuídos: `aitana.ns.cloudflare.com` e `sonny.ns.cloudflare.com`.
  Registros já no Cloudflare: TXT `_github-pages-challenge-Renan1` = `a67119822097007a2fb234c9449cfc` (verificação do GitHub, MANTER PARA SEMPRE) + 3 registros de proteção criados pelo Cloudflare (MX nulo ".", SPF `v=spf1 -all`, DMARC reject) que o Email Routing vai substituir depois.
- registro.br: hoje em modo avançado (servidores `d.sec.dns.br`/`e.sec.dns.br`), com o mesmo TXT. ATENÇÃO: o modo avançado LIGOU o DNSSEC (DS keytag 18564 publicado). Ao trocar para os nameservers do Cloudflare, deixar os campos de DNSSEC/DS VAZIOS (senão o domínio para) e conferir depois que o DS sumiu: `Resolve-DnsName martinsrenan.com.br -Type DS -Server 8.8.8.8`. DNSSEC pode ser religado depois pelo Cloudflare.
- Próximos passos, nesta ordem (doc oficial do GitHub, conferida 2026-10-21):
  1. Renan clica em Verify no GitHub (perfil → Settings → Pages → ⋯ → Continue verifying). O TXT já está público.
  2. Renan troca no registro.br os servidores DNS para aitana/sonny (campos DNSSEC vazios) e clica "I updated my nameservers" no Cloudflare. Conferir com `nslookup -type=NS martinsrenan.com.br 8.8.8.8` até aparecer cloudflare.
  3. Pôr o domínio no repo (Settings → Pages → Custom domain `martinsrenan.com.br`; via API: `gh api -X PUT repos/Renan1/site-martinsrenan/pages -f cname=martinsrenan.com.br`). NÃO fazer antes do DNS apontar: o github.io passa a redirecionar para o domínio.
  4. No Cloudflare, nuvem CINZA ("DNS only", suposição: laranja atrapalha o certificado do GitHub; conferir doc): A raiz 185.199.108.153 / .109.153 / .110.153 / .111.153; AAAA opcionais 2606:50c0:8000::153 / 8001 / 8002 / 8003; CNAME `www` → `renan1.github.io`. Sem registro curinga (*).
  5. Enforce HTTPS no repo (pode levar até 24 h para liberar).
  6. Email Routing no Cloudflare para contato@ → Gmail; depois trocar `mail` em assets/js/contact.js.
- Nas configurações de bots do Cloudflare: Search e Agent = Allow; Training = escolha do Renan.

## Skills (reinstalar em outro PC, pelo Git Bash)
```bash
R=rtadewald/skills; S="$HOME/.claude/skills"; mkdir -p "$S/img-to-html" "$S/to-wireframe/references"
for f in img-to-html/SKILL.md img-to-html/README.md to-wireframe/SKILL.md to-wireframe/references/wireframe.example.svg; do gh api "repos/$R/contents/$f" -H "Accept: application/vnd.github.raw" > "$S/$f"; done
```

## Página inicial = Patch panel (aprovado 2026-10-21)
Base: `design/v3/patch.html`. Cada problema (porta de cima) liga a uma solução (porta de baixo). Conexão certa → LEDs acesos na cor do cabo → "abrir projeto". Cada projeto terá sua página interativa própria (bases: `design/v3/scanner.html` e `design/v3/comanda.html`; o resto, criar depois).
LEDs (pedido do Renan, 2026-10-21): ao começar a puxar o cabo, piscam na cor do cabo a porta de origem E a solução certa (dica). Porta sob o cabo só ganha contorno. Certo = fixo; errado = âmbar.
Layout: problemas (U1) → calha de cabos (U2) → soluções (U3) → display embaixo. Nenhum cabo passa pelo display.

| # | Problema (porta) | Solução (porta) | Repo | Página própria |
|---|---|---|---|---|
| 1 | Sem registro de viagens (Uber) | Lançamento de viagens | viagens-couveflor | **Viagens** (motorista ↔ estrada ↔ gestor, 2026-10-21) |
| 2 | Controle de entrada | Leitor QR Code | leitor-qr-couveflor | **Leitor QR** (base Comanda, 2026-10-21) |
| 3 | Comunicação interna | TV corporativa | tv-couveflor | **TV** (parede + pasta conteudo/ editável, 2026-10-21) |
| 4 | Digitalizar documentos | Scanner / PDF | scanner-couveflor (privado) | **Scanner** |
| 5 | Problema com a TI | Soluções em TI | — | **TI** (carreira como rack + competências que acendem fases, 2026-10-21) |
| 6 | Site desatualizado | Sites que atraem clientes | couveflor-site + site-martinsrenan | **Sites** (raio-X arrastável com código real + checklist medido, 2026-10-21) |
| 7 | Post diário do cardápio | Gerador de cardápio | gerarcardapio-couveflor | **Cardápio** (gerador real em canvas, 2026-10-21) |
| 8 | Empresa em planilha | Dashboard interativo | couveflor-dashboard (privado) | **Dashboard** (arquivos → painel, dados fictícios, 2026-10-21) |
| 9 | Finanças pessoais | App financeiro familiar | sistemafinanceiro-familiar | **Finanças** (novo gasto + fatura no mês certo, dados fictícios, 2026-10-21) |
| 10 | Preço no chute (não sei precificar meus produtos) | Gerador de preço | precificacao-couveflor (privado) | **Gerador de preço** (gôndola com etiquetas + memória de cálculo + Simples Anexo I, 2026-10-21) |
| 11 | Acompanhar apuração | Apuração 2026 | apuracao2026 | **Apuração** (noite simulada + avisos + navegador×função×TSE, 2026-10-21) |
| 12 | Seu problema | Vamos conversar | — | contato |
Projetos futuros: ficam em `/futuros/` (lista `window.FUTURE` em projects.js) até ficarem prontos; aí viram porta no painel. English Coach saiu do painel em 2026-10-21 (fraco por enquanto) e está em `/futuros/`.
Menu do topo (todas as páginas): Projetos concluídos (`/projetos/`, só concluídos) · Contato · Futuros projetos (`/futuros/`) · Tema.

## Inventário de projetos (GitHub Renan1, levantado em 2026-10-20)
| Repo | Visibilidade | Descrição |
|---|---|---|
| viagens-couveflor | público | Sistema de viagens Couveflor |
| scanner-couveflor | privado | PWA: digitalizar, OCR, renomear e compartilhar documentos |
| tv-couveflor | público | (descrever) |
| gerarcardapio-couveflor | público | Gera cardápio diário para posts em redes sociais |
| leitor-qr-couveflor | público | (descrever) |
| apuracao2026 | público | (descrever) |
| sistemafinanceiro-familiar | público | Controle de gastos familiar |
| couveflor-dashboard | privado | (descrever) |
| couveflor-site | público | Site da Couveflor |
| english-coach | local | Tutor de inglês falado com IA (Claude) — Cloudflare Pages + Worker + Supabase |

## Status
- [x] Domínio .com.br comprado
- [x] Repo criado no GitHub (vazio)
- [x] Direção visual aprovada (patch panel na home; Scanner e Comanda como bases de páginas de projeto)
- [x] Estrutura do site criada e rodando localmente (estático, sem build)
- [x] Página do Scanner com conteúdo real (2026-10-21): mesa com 6 problemas reais + galeria de 6 prints + ficha técnica. Fonte: guia do operador (PDF do Renan, prints com documentos de teste).
- [x] Página do Leitor QR (2026-10-21): quadro de refeições + QR para tocar + impressora térmica (Presença, Rampa com recusa, desfazer, CSV com fórmula neutralizada) + 6 prints tarjados + ficha técnica. Fonte: guia do operador do Renan.
- [x] Página do Gerador de cardápio (2026-10-21): gerador de verdade (canvas 1080x1920, baixa PNG) com as regras do app + 6 prints do guia (sem dado sensível) + ficha técnica. Ícones ilustrativos desenhados em código (os 147 ícones do app não foram copiados: licença desconhecida).
- [x] Página de Viagens (2026-10-21): simulação com 2 celulares (motorista e gestor) ligados por uma estrada: IDA/VOLTA/EXTRA, sinal offline com fila, cancelar só hoje, tarifa nova não muda o passado, Fechar PIX com E2E validado e recusa de repetido + 6 prints (chave PIX e E2E tarjados, dados do guia já fictícios) + ficha técnica. Fonte: guia .docx do Renan.
- [x] Página da TV (2026-10-21): TV na parede passando 8 slides reais + pasta conteudo/ editável (ligar/desligar, reordenar, vídeo com codec errado → aviso vermelho) + diagrama GitHub→Pages→Pi→TV + ficha. Slides EXCLUÍDOS: 09 (empresas clientes), 10 (nomes de funcionárias), 06 (QR da pesquisa real), 03 (preço da refeição). Fonte: repo tv-couveflor.
- [x] Página do Dashboard (2026-10-21): 3 arquivos do mês (PDV, Plano de Contas, Medição) destravam o painel; filtros cruzados; Cartão de Bolso; Leitura Estratégica com as 4 regras reais; simulador (food cost, peso do maior cliente, taxas); conciliação Medição×PDV×Financeiro. Dados 100% fictícios (Cliente A/B/C) + 6 prints do guia (telas de login EXCLUÍDAS: mostram o nome da conta Cloudflare Access). Detalhes internos do repo privado (conta Zero Trust, DNS, planilhas de custo) NÃO vão para o site.
- [x] Página de Finanças (2026-10-21): celular "Novo gasto" (teclado pelos centavos, PIX/crédito, parcelas, cartões com fechamento diferente) + painel de outubro, faturas dos próximos meses com linha de 30% da renda, orçamentos e Saúde; modo avião com fila. Data fixa 21/10/2026. Família fictícia do guia (Lucas e Marina) + 6 prints; telas de login e da chave do Atalho EXCLUÍDAS. Sem emojis como ícone na simulação.
- [x] Página de Sites (2026-10-21): 2 cases (Couve Flor e este portfólio) numa janela de navegador com raio-X arrastável mostrando trechos REAIS do código + celular + checklist MEDIDO (refazer as medições se os sites mudarem) + mapa das 12 páginas. Prints tirados com Edge sem janela via CDP (script em scratchpad: shot-mobile.mjs). Pontos a melhorar do site da Couve Flor (sem lazy loading, Google Fonts externo, sem CSP) NÃO foram expostos.
- [x] Página do Gerador de preço (2026-10-21): gôndola com 5 etiquetas (produtos fictícios do guia: Bala Menta 39,00/21 → R$ 3,00), mesmas fórmulas do calc.js (venda/markup, preço fixado, arredondar, unidade/caixa, erro ≥100%), memória de cálculo + conferência, assistente do Simples Anexo I (1,2 mi → 8,83%; ICMS-ST 5,87%). Repo PRIVADO: sem link de código; detalhes do Access (nome da política, e-mails) NÃO vão para o site.
- [x] Página da Apuração 2026 (2026-10-21): relógio da noite 17h→23h, celular com Início/Eleitos/Avisos, avisos de troca de liderança (Senado = 2 vagas), resumo dos deputados, caminho navegador×função×TSE com cache de 55 s. Candidatos, partidos e votos FICTÍCIOS (nunca resultados reais).
- [x] Todas as 12 portas têm página (15 páginas no site; a página Sites cita "15 páginas": atualizar se mudar).
- [x] Contato: WhatsApp +55 32 98813-4420 e renanasmartins@gmail.com (aprovado pelo Renan para publicar).
- [ ] E-mail contato@martinsrenan.com.br (decisão do Renan: QUER usar; provavelmente Cloudflare Email Routing, grátis). Fazer junto com a publicação/DNS; até lá o site usa o Gmail (trocar só `mail` em assets/js/contact.js). Conferir a doc oficial do Cloudflare antes.
- [x] Página institucional Soluções em TI (2026-10-21): carreira do currículo do Renan como rack (6 fases, clique puxa o servidor e mostra no console), competências que acendem as fases, KPIs do CV, formação/certificações como módulos SFP, idiomas e prêmios. SEM dados pessoais (nome completo, endereço); empregadores e clientes da carreira aparecem (são do CV profissional).
- [ ] Conteúdo dos projetos (descrição, stack, prints, links)
- [x] GitHub Pages ativo (2026-10-21): branch main, pasta raiz, em https://renan1.github.io/site-martinsrenan/ (107 arquivos conferidos com 200, sem erros de CSP).
- [ ] Domínio apontado para o site: em andamento, ver "DNS e domínio" acima (próximo: Verify no GitHub + trocar nameservers com DNSSEC vazio).
- [x] Visualizador de prints (lightbox) nas 6 galerias (2026-10-21).
- [ ] Logo "RM · Soluções em TI · IA" + favicon/ícone do iPhone. 2026-10-21: 3 propostas em SVG em `design/logo/` (A porta RJ45, B um cabo só, C etiqueta de rack) RECUSADAS: muito literais, escuras/pesadas e letras fracas. Renan escolheu gerar imagens com IA: caminho grátis = ele gera no ChatGPT/Gemini/Ideogram com os prompts abaixo e manda; Claude redesenha a escolhida em SVG. OpenRouter (pago, chave) só com OK.
  Prompts: (1) monograma "RM" geométrico, um traço compartilhado, espaço negativo, tinta #15191C em branco, acento verde-menta #7CFFB0, sem gradiente/3D/circuito/robô; (2) R e M com poucas linhas e um ponto-nó na conexão (IA sutil, sem cérebro/chip), fundo claro; (3) símbolo abstrato de duas formas que se encaixam formando R e M, legível em 16 px; (4) logotipo "RM" + "Soluções em TI · IA" em monoespaçada.
  Depois da escolha: favicon.svg + apple-touch-icon.png 180×180 + ícones 192/512 + manifest.webmanifest + meta theme-color em todas as 15 páginas (PNG via Edge sem janela, como os prints).
- [ ] Compra do .dev no Cloudflare + redirecionamento
