# Site martinsrenan.com.br — guia para o Claude Code

Portfólio de projetos de TI e IA do Renan Martins. Dono: Renan (TI/infra/cyber; iniciante em web moderno). Explicar em português, comandos para PowerShell/Windows, dizer o que cada coisa faz antes de rodar.

## Decisões aprovadas
- Domínio: `martinsrenan.com.br` (registro.br, DNS padrão do registro.br). `martinsrenan.dev` será comprado depois no Cloudflare e redirecionado para o .com.br.
- Hospedagem: GitHub Pages, repo público `Renan1/site-martinsrenan`.
- Conteúdo: projetos de TI e IA criados pelo Renan, incluindo os da empresa Couveflor (dele e da esposa). Os sistemas mantêm os endereços atuais; o portfólio só aponta para eles.
- Repos privados (`scanner-couveflor`, `couveflor-dashboard`): mostrar descrição e imagens, sem link para o código.
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
projetos/index.html         índice de todos os projetos
projetos/<slug>/index.html  página interativa de cada projeto (hoje: scanner)
assets/css/  base.css (cores, tema, cabeçalho) · fonts.css · patch.css · projetos.css · scanner.css
assets/js/   projects.js (FONTE ÚNICA dos 12 projetos) · patch.js · projetos.js · scanner.js · theme.js
assets/fonts/ fontes locais .woff2 (OFL, ver LICENCAS.md) · assets/img/favicon.svg
design/      protótipos e maquetes (não fazem parte do site)
tools/serve.mjs  servidor local
.nojekyll    faz o GitHub Pages servir os arquivos sem processar
```
- Ver localmente: `node tools/serve.mjs` e abrir http://localhost:4173
- Nova página de projeto: criar `projetos/<slug>/index.html` + `assets/css/<slug>.css` + `assets/js/<slug>.js` e pôr `page: '<slug>'` no projeto em `projects.js`.
- Links sempre RELATIVOS (`projetos/`, `../`, `../../`), para funcionar no domínio e no localhost.
- Cada página tem CSP em `<meta>`: só arquivos do próprio site, sem CSS/JS embutido no HTML (nada de `<style>`, `<script>` inline ou `style=""`). Variáveis CSS setadas por JS (`el.style.setProperty`) são permitidas.

## Regras de segurança
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

## DNS (aplicar só quando o site estiver no ar no GitHub Pages; conferir IPs na doc oficial)
- A (raiz): 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153
- CNAME `www` → `renan1.github.io`
- Verificar o domínio na conta do GitHub e ativar "Enforce HTTPS".

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
| 1 | Sem registro de viagens (Uber) | Lançamento de viagens | viagens-couveflor | depois |
| 2 | Controle de entrada | Leitor QR Code | leitor-qr-couveflor | depois (talvez estilo Comanda) |
| 3 | Comunicação interna | TV corporativa | tv-couveflor | depois |
| 4 | Digitalizar documentos | Scanner / PDF | scanner-couveflor (privado) | **Scanner** |
| 5 | Problema com a TI | Soluções em TI | — | página institucional: currículo de TI e experiências comprovadas |
| 6 | Site desatualizado | Sites que atraem clientes | couveflor-site + site-martinsrenan | depois (os próprios sites são o portfólio) |
| 7 | Post diário do cardápio | Gerador de cardápio | gerarcardapio-couveflor | depois |
| 8 | Empresa em planilha | Dashboard interativo | couveflor-dashboard (privado) | depois — SEM dados reais |
| 9 | Finanças pessoais | App financeiro familiar | sistemafinanceiro-familiar | depois — SEM dados reais |
| 10 | Treinar inglês (suposição: incluir) | English Coach | english-coach (local) | depois |
| 11 | Acompanhar apuração (suposição: incluir) | Apuração 2026 | apuracao2026 | depois |
| 12 | Seu problema | Vamos conversar | — | contato |
Projetos futuros: entram como portas novas.

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
- [ ] Páginas interativas de cada projeto (pronta como base: scanner; conteúdo real pendente)
- [ ] Página institucional (currículo de TI) e contato
- [ ] Conteúdo dos projetos (descrição, stack, prints, links)
- [ ] Publicação no GitHub Pages + DNS
- [ ] Compra do .dev no Cloudflare + redirecionamento
