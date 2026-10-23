# Site martinsrenan.com.br — guia para o Claude Code

Portfólio de projetos de TI e IA do Renan Martins. Dono: Renan (TI/infra/cyber; iniciante em web moderno). Explicar em português, comandos para PowerShell/Windows, dizer o que cada coisa faz antes de rodar.

## Decisões aprovadas
- Domínio: `martinsrenan.com.br` (registrado no registro.br). DNS vai para o CLOUDFLARE (decisão 2026-10-21, para usar o Email Routing no contato@; a doc do Cloudflare exige DNS no Cloudflare). `martinsrenan.dev` foi comprado no Cloudflare (2026-10-23) e redireciona (301) para o .com.br.
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
404.html                    página de erro (GitHub Pages serve em qualquer endereço inexistente; usa caminhos a partir da raiz)
projetos/index.html         projetos concluídos
futuros/index.html          em construção + próximos projetos (futuros.js)
contato/index.html          WhatsApp + e-mail (dados em assets/js/contact.js, montados em pedaços contra robôs de spam)
projetos/<slug>/index.html  página interativa de cada projeto (hoje: scanner, leitor-qr, cardapio, viagens, tv, dashboard, financas, sites, ti, preco, apuracao — todas as portas)
assets/css/  base.css (cores, tema, cabeçalho) · fonts.css · rodape.css (rodapé com marca) · marca.css (marca RM no cabeçalho e no rodapé) · e404.css (só a 404) · patch.css · projetos.css · scanner.css
assets/js/   projects.js (FONTE ÚNICA dos 12 projetos) · patch.js · projetos.js · scanner.js · theme.js
assets/fonts/ fontes locais .woff2 (OFL, ver LICENCAS.md) · assets/img/ (favicon.svg, apple-touch-icon.png, icon-192/512.png, og.png, logo/) · manifest.webmanifest
design/      protótipos e maquetes (não fazem parte do site)
tools/serve.mjs  servidor local
.nojekyll    faz o GitHub Pages servir os arquivos sem processar
```
- Ver localmente: `node tools/serve.mjs` e abrir http://localhost:4173 (o servidor do app desliga quando a sessão reinicia: se localhost não abrir, é isso)
- Galeria de prints: `<ol class="shots"><li><figure><img>…<figcaption>` + `assets/css/lightbox.css` e `assets/js/lightbox.js` na página = clicar amplia o print (setas/deslizar troca, Esc fecha). Usado em scanner, leitor-qr, cardapio, viagens, dashboard, financas.
- Fonte manuscrita: Kalam (a Nanum Pen Script foi trocada porque não tem acentos do português).
- Todo `<head>` leva, logo após o `rel="icon"`: `apple-touch-icon`, `rel="manifest"` e as duas metas `theme-color` (claro #D9DDE0, escuro #0B0D0E); copiar de qualquer página existente, ajustando o prefixo `../`.
- Cabeçalho (todas as páginas): dentro de `.who`, antes do nome, `<img class="marca marca-l" src=".../assets/img/logo/marca-claro.svg" alt=""><img class="marca marca-d" src=".../assets/img/logo/marca-escuro.svg" alt="">` + `<link>` para `assets/css/marca.css` (depois do `rodape.css`). A imagem clara/escura troca com o tema pelo CSS. Altura 24 px; no celular o `.top` quebra linha (senão o menu das páginas de projeto estoura a largura).
- Rodapé (todas as páginas, antes dos `<script>`): `<footer class="rodape"><img class="marca marca-l" src=".../assets/img/logo/marca-claro.svg" alt=""><img class="marca marca-d" src=".../assets/img/logo/marca-escuro.svg" alt=""><span>© 2026 Renan Martins</span></footer>` + `rodape.css`.
- Compartilhamento (WhatsApp etc.): todo `<head>` leva, depois do `description`, as metas `og:type`, `og:locale`, `og:site_name`, `og:title` (= `<title>`), `og:description` (= description), `og:url` (endereço completo da página), `og:image` (`https://martinsrenan.com.br/assets/img/og.png`, 1200×630, 36 KB; versão ESCURA escolhida em 2026-10-22, a clara foi descartada), `og:image:width/height/alt` e `twitter:card`. O endereço da imagem PRECISA ser completo (https://...). Não testado no WhatsApp real (o container não o alcança); o WhatsApp guarda o cartão em cache.
- Página 404: `404.html` na raiz é a ÚNICA exceção à regra de links relativos: usa `/assets/...` e `/projetos/` porque é servida em qualquer profundidade. Tem `noindex` e não conta nas "15 páginas".
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

## DNS e domínio (estado em 2026-10-22: NO AR)
- Site no ar em https://martinsrenan.com.br (GitHub Pages, branch main, raiz; arquivo `CNAME` na raiz criado pelo GitHub ao salvar o Custom domain). O endereço antigo https://renan1.github.io/site-martinsrenan/ passa a redirecionar para o domínio.
- DNS no CLOUDFLARE (plano Free, conta do Renan). Nameservers: `aitana.ns.cloudflare.com` e `sonny.ns.cloudflare.com` (já trocados no registro.br, com DNSSEC/DS vazio).
- Registros no Cloudflare, nuvem CINZA ("DNS only"; suposição: a laranja atrapalha o certificado do GitHub, não conferido na doc): A raiz 185.199.108.153 / .109.153 / .110.153 / .111.153 e CNAME `www` → `renan1.github.io`. Sem registro curinga (*).
- TXT `_github-pages-challenge-Renan1` = `a67119822097007a2fb234c9449cfc` (verificação do domínio no GitHub, MANTER PARA SEMPRE).
- 3 registros de proteção criados pelo Cloudflare (MX nulo ".", SPF `v=spf1 -all`, DMARC reject): o Email Routing vai substituí-los.
- DNSSEC: desligado ao trocar para o Cloudflare (o DS antigo, keytag 18564, saiu). Pode ser religado depois pelo Cloudflare, se o Renan quiser. Conferir: `Resolve-DnsName martinsrenan.com.br -Type DS -Server 8.8.8.8`.
- Feito (Renan, 2026-10-22): Verify no GitHub, troca dos nameservers, registros A/CNAME, Custom domain no repo. Renan confirmou "site no ar".
- Feito (Renan, 2026-10-22): "DNS check successful", Enforce HTTPS ATIVO e teste no navegador OK (https com cadeado, www, http→https). Domínio concluído.
- Feito (2026-10-22): Email Routing no Cloudflare, contato@ → Gmail, testado. Os registros MX (route1/2/3.mx.cloudflare.net), SPF `include:_spf.mx.cloudflare.net` e DKIM `cf2024-1._domainkey` agora são do Email Routing: NÃO apagar. O MX nulo e o SPF `-all` antigos foram removidos.
- Nas configurações de bots do Cloudflare: Search e Agent = Allow; Training = escolha do Renan.

## Pendências (2026-10-22, em ordem)
1. [feito 2026-10-22] Domínio testado: HTTPS, www e redirecionamento OK.
2. [feito 2026-10-22] E-mail contato@martinsrenan.com.br: Email Routing ativo (MX nulo e SPF antigo apagados), encaminha para o Gmail do Renan; teste de recebimento OK; `mail` em contact.js trocado. Respostas pelo Gmail saem do Gmail, não de contato@ (enviar "como" contato@ exigiria SMTP externo, não configurado).
3. [feito 2026-10-22] Logo aplicado: favicon, ícones, manifest, theme-color, marca no cabeçalho (opção A) e no rodapé, imagem de compartilhamento (og.png, versão escura) e página 404. Assinatura do e-mail contato@ feita e funcionando (Renan confirmou, 2026-10-23): página de apoio `design/assinatura/` (noindex; https://martinsrenan.com.br/design/assinatura/) com a assinatura para copiar ao Gmail; usa o `icon-192.png` já hospedado (Gmail não aceita SVG; imagem precisa de URL pública). Texto: nome, "Soluções em TI · IA", contato@, site, WhatsApp. Se o ícone/contatos mudarem, atualizar essa página e a assinatura no Gmail.
4. [feito 2026-10-22] Inventário: tabela removida; a fonte é `assets/js/projects.js`.
5. [feito 2026-10-22] Rodapé "© 2026 Renan Martins" (texto definido pelo Renan; sem "todos os direitos reservados" nem "criado por") em `assets/css/rodape.css` + `<footer class="rodape">` nas 15 páginas, agora com a marca RM pequena (16 px) antes do texto. Páginas novas devem incluir os dois.
6. Opção do site todo em inglês (pedido do Renan, 2026-10-22). Antes de traduzir, DECIDIR a estrutura com o Renan: pastas `/en/` espelhando as páginas OU arquivo de textos por idioma carregado por JS (o CSP proíbe script inline). Custo alto: dobra a manutenção. Incluir seletor PT/EN no menu do topo e `lang`/`hreflang` corretos.
7. [feito 2026-10-23] `martinsrenan.dev` comprado no Cloudflare Registrar pelo Renan (US$ 8,20 no 1º ano; renova por US$ 12,20/ano, em dólar; manter a renovação automática ligada) e redirecionando para o .com.br com 301, testado (com e sem www, preservando caminho e query string). No Cloudflare (zona martinsrenan.dev): registros A `@` e `www` → 192.0.2.1 com nuvem LARANJA (IP de mentira, NÃO apagar nem pôr em cinza, senão o redirecionamento para) + Redirect Rule (Rules → Redirect Rules, modo Wildcard): Request URL `https://*martinsrenan.dev/*` → Target `https://martinsrenan.com.br/${2}`, 301, "Preserve query string" ligado. `.dev` exige HTTPS (HSTS); http:// não é redirecionado pela regra e não precisa ser. Teste: `curl.exe -I https://martinsrenan.dev/projetos/`.

## Trabalhar em outro PC (ex.: PC da empresa)
- Clonar: `git clone https://github.com/Renan1/site-martinsrenan.git` e entrar na pasta. Se já existe: `git checkout main` e `git pull origin main`.
- Ver localmente: `node tools/serve.mjs` e abrir http://localhost:4173. Não precisa de `npm install`.
- Skills `img-to-html` e `to-wireframe` não vêm no repo: reinstalar pela seção "Skills".
- A branch `claude/determined-meitner-esifiv` guarda wireframes recusados (`design/v2/`) e serviu de rascunho do rodapé; não juntar ao main (levar commits por cherry-pick).

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

## Inventário de projetos
A lista oficial (nome, descrição, stack, repo, privado/público, cor) está em `assets/js/projects.js` (`PROJECTS` = 12 portas; `FUTURE` = futuros, hoje só English Coach). NÃO duplicar aqui. Repos privados (sem link de código): scanner-couveflor, couveflor-dashboard, precificacao-couveflor.

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
- [x] Contato: WhatsApp +55 32 98813-4420 e contato@martinsrenan.com.br (aprovado pelo Renan para publicar; o Gmail dele não aparece mais no site).
- [x] E-mail contato@martinsrenan.com.br (2026-10-22): Cloudflare Email Routing → Gmail, testado; o site usa contato@ (assets/js/contact.js).
- [x] Página institucional Soluções em TI (2026-10-21): carreira do currículo do Renan como rack (6 fases, clique puxa o servidor e mostra no console), competências que acendem as fases, KPIs do CV, formação/certificações como módulos SFP, idiomas e prêmios. SEM dados pessoais (nome completo, endereço); empregadores e clientes da carreira aparecem (são do CV profissional).
- [x] Conteúdo dos projetos (2026-10-22): 12 páginas com descrição, stack, prints e links, ver `assets/js/projects.js`.
- [x] GitHub Pages ativo (2026-10-21): branch main, pasta raiz, em https://renan1.github.io/site-martinsrenan/ (107 arquivos conferidos com 200, sem erros de CSP).
- [x] Domínio apontado para o site (2026-10-22): https://martinsrenan.com.br no ar. HTTPS e testes OK.
- [x] Visualizador de prints (lightbox) nas 6 galerias (2026-10-21).
- [x] Logo "RM · Renan Martins · Soluções em TI · IA" (2026-10-22): vetorização (potrace) da imagem gerada em IA que o Renan aprovou. R, M, ">" e letras são os da imagem; o retângulo menta virou um quadrado de 52 px com aba de porta Ethernet (quadrado #53E59E, aba arredondada #3DC187). Tinta #15191C (escura: #EDF1F3). Aprovado como "publicável" (o Renan sabe que pode melhorar). Arquivos: `assets/img/logo/` (logo e marca, claro e escuro), `assets/img/favicon.svg`, `apple-touch-icon.png` (180, fundo cheio, sem cantos transparentes por causa do iOS), `icon-192.png`, `icon-512.png`, `manifest.webmanifest` (display "browser"). Fonte e histórico: `design/logo/v2/index.html`. Para regerar os PNGs: renderizar o SVG com Edge/Chromium sem janela a partir de uma página em arquivo (um `setContent` em branco não abre `file://`).
  Limites conhecidos: em 16/32 px a aba da porta some (vira só um ponto verde); o "IA" do slogan em menta sobre branco tem contraste 1,6:1; o menta do logo (#53E59E) difere do #7CFFB0 do patch panel; `theme-color` segue a preferência do sistema, não o botão de tema do site; sem ícone "maskable" no manifest; a marca aparece no cabeçalho e no rodapé (ver "Estrutura do site").
- [x] Compra do martinsrenan.dev no Cloudflare (2026-10-23)
- [x] Redirecionamento martinsrenan.dev → martinsrenan.com.br, 301, testado (2026-10-23; ver Pendências item 7)
