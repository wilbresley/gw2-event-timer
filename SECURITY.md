# Segurança

## Versões suportadas

Apenas o `main` atual (1.1.2) e o site público em `https://gw2.bresley.win/`. O container nginx é uma opção de self-host, não um segundo deploy.

## Como reportar

Use o **GitHub Private Vulnerability Reporting** (aba **Security** → **Report a vulnerability**). Não abra uma issue pública com detalhes de exploração. Não inclua chaves de API, tokens, dados pessoais ou capturas com esses dados. Se o canal privado não estiver disponível, abra uma issue sem detalhes pedindo um canal privado.

## Escopo

- `site/app.js`, `site/account.js`, `site/index.html`, `site/404.html` e `site/404.css`;
- cabeçalhos em `site/_headers` e `nginx.conf` (self-host);
- uso de `localStorage`, IndexedDB, token da API e o worker do relógio;
- o painel da conta e o fluxo de salvar/esquecer a chave.

Fora do escopo: a API da ArenaNet, a infraestrutura da Cloudflare, extensões do navegador e dispositivos comprometidos.

## Limitações conhecidas

- A chave da API vai na query `access_token`, não no header `Authorization`, porque o preflight CORS da ArenaNet falha no navegador. Isso foi testado em 24/11/2026 na origem pública e está documentado no `AGENTS.md`. Não é uma falha do site; não troque sem repetir o teste.
- A página não pede permissão de notificação; o aviso é um áudio local. O navegador exige um clique por visita antes de liberar som.
- O site é estático e não tem backend, login próprio nem banco de dados.

## Defesas

- CSP restritiva, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy`.
- Nenhum script de terceiro; nenhum `innerHTML`, `eval` ou `new Function` no código do site.
- A chave fica no navegador e só é enviada para `api.guildwars2.com`.
- O site público é entregue pelo Cloudflare Pages; o nginx é self-host opcional.

## Testes

```bash
npm ci
npm test
npx playwright install chromium
npm run test:e2e
```

No Windows, se o PowerShell bloquear `npm.ps1`, use `npm.cmd`. Os testes rodam no GitHub Actions em push e pull request. O Cloudflare Pages continua publicando no push; para os testes bloquearem o `main`, ative branch protection exigindo o workflow `tests`.
