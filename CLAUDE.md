# Site martinsrenan.com.br — guia para o Claude Code

Portfólio de projetos de TI e IA do Renan Martins. Dono: Renan (TI/infra/cyber; iniciante em web moderno). Explicar em português, comandos para PowerShell/Windows, dizer o que cada coisa faz antes de rodar.

## Decisões aprovadas
- Domínio: `martinsrenan.com.br` (registro.br, DNS padrão do registro.br). `martinsrenan.dev` será comprado depois no Cloudflare e redirecionado para o .com.br.
- Hospedagem: GitHub Pages, repo público `Renan1/site-martinsrenan`.
- Conteúdo: projetos de TI e IA criados pelo Renan, incluindo os da empresa Couveflor (dele e da esposa). Os sistemas mantêm os endereços atuais; o portfólio só aponta para eles.
- Repos privados (`scanner-couveflor`, `couveflor-dashboard`): mostrar descrição e imagens, sem link para o código.
- Visual: robusto, organizado, atrativo e autoral. Nada de cara de template ou de "site feito por IA" (evitar gradiente roxo genérico, cards idênticos, emojis como ícone, textos de marketing vazios).

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
- [ ] Direção visual aprovada
- [ ] Estrutura Vite criada e rodando localmente
- [ ] Conteúdo dos projetos (descrição, stack, prints, links)
- [ ] Publicação no GitHub Pages + DNS
- [ ] Compra do .dev no Cloudflare + redirecionamento
