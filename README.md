# Studio Hellen Varella — vitrine

Site de uma página do Studio Hellen Varella (maquiagem, cabelo e fotografia
no mesmo atendimento) — Fraiburgo, SC.

**"Você vai ter dó de tirar a maquiagem."**

## Para ver rodando

```bash
node frontend/tools/serve.mjs
# abre em http://127.0.0.1:4173/
```

Ou abra `frontend/index.html` direto no navegador.

## O que é

- HTML + CSS + JavaScript puro. **Sem build, sem framework, sem dependências.**
- Deploy: subir a pasta inteira em qualquer host estático
  (GitHub Pages, Netlify, Cloudflare Pages).
- Identidade (cores, tipografia, mensagem) vem do briefing da cliente —
  ver `docs/BRIEFING.md`.

## Estrutura

| Pasta | O que tem |
|-------|-----------|
| `frontend/index.html` | a vitrine |
| `frontend/admin/` | painel da Hellen, fora do sitemap |
| `frontend/404.html`, `frontend/obrigada.html` | páginas de apoio |
| `frontend/assets/css/` | design system (`tokens` → `base` → `layout` → `components` → `utilities`) |
| `frontend/assets/js/` | `api.js` lê o banco; `nav`, `reveal`, `portfolio`, `whatsapp` e `pricing` cuidam da página |
| `frontend/assets/img/` | fotos otimizadas da vitrine |
| `frontend/data/*.json` | reserva estática, no mesmo formato da API |
| `frontend/tools/*.mjs` | `serve`, `check-links`, `optimize-images` |
| `backend/` | API Node e Express |
| `database/` | `schema.sql` e `seed.sql` |
| `docs/` | briefing, checklist e roteiro |
| `facul/` | entregas anteriores da disciplina |

## Comandos

```bash
node frontend/tools/serve.mjs          # site em http://127.0.0.1:4173/
node frontend/tools/check-links.mjs    # links internos
cd backend && npm install
npm run dev                            # API em http://127.0.0.1:3000/
npm test
npm run db:seed
```

O modelo de variáveis é `.env.example`. Copie para `backend/.env` e preencha na sua máquina. Esse arquivo não entra no Git.

## API

```bash
cd backend
npm install
npm run dev
```

A rota de saúde responde em http://127.0.0.1:3000/health.

No computador, `frontend/assets/js/api.js` lê a API local e troca preços, fotos, portfólio e perguntas. Se a API não responder, a página fica com o HTML que já está no arquivo. O formulário no fim da página envia `POST /api/contatos` e mostra "Enviando…" ou o erro. No site publicado o mesmo script chama https://hellen-varella-api.onrender.com. `window.HV_API`, se existir antes dos scripts, substitui esse endereço.

## Site publicado

- Vitrine: https://lfkcc.github.io/hellen-varella/
- API: https://hellen-varella-api.onrender.com
- Saúde: https://hellen-varella-api.onrender.com/health
- Painel: https://lfkcc.github.io/hellen-varella/admin/

O GitHub Pages publica a pasta `frontend/`. O `render.yaml` descreve o backend (pasta `backend/`, plano grátis, checagem em `/health`). As chaves ficam só no painel do Render: `DATABASE_URL`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. O `JWT_SECRET` o Render gera. O `CORS_ORIGIN` é `https://lfkcc.github.io`.

O plano grátis dorme. A primeira visita depois de um tempo parado pode levar cerca de um minuto. Enquanto a API não responde, a página continua com o HTML já escrito e o formulário pede para chamar no WhatsApp. No painel, o campo "Endereço da API" já vem com a URL pública; no computador ele volta para `http://127.0.0.1:3000`.

## Banco

O Postgres fica no Supabase. Os scripts estão em `database/schema.sql` e `database/seed.sql`.

1. No projeto do Supabase, abra Project Settings → Database e copie a connection string do **Session pooler** (o host termina em `pooler.supabase.com` e o usuário é `postgres.` mais o código do projeto).
2. Cole em `backend/.env` como `DATABASE_URL`. Esse arquivo não entra no Git. A conexão direta (`db.….supabase.co`) é só IPv6; o Render não alcança esse host.
3. Na raiz do backend:

```bash
npm run db:seed
```

O comando recria as tabelas e insere combos, serviços, FAQ e portfólio. A tabela de administradores não é apagada. Dá para fazer o mesmo colando os dois SQL, nesta ordem, no SQL Editor.

## Painel

A edição fica em `frontend/admin/` (não entra no sitemap e pede para não ser indexada). O login devolve um token de duas horas, guardado só na aba do navegador.

A senha da Hellen é criada na máquina local e não entra no Git:

```bash
cd backend
ADMIN_EMAIL="hellen@exemplo.test" ADMIN_SENHA="uma-senha-de-8-ou-mais" npm run admin:criar
```

Conta de demonstração, só para o professor avaliar o painel. Não é a senha da Hellen.

- E-mail: `professor@studiohellen.test`
- Senha: `studio-demo-7kQ4`

## Equipe

Gabriel Joaquim, Lucas Fernandes, Luiz Felipe e Otavio. O repositório público está em nome de [Luiz Felipe](https://github.com/Lfkcc). O que cada pessoa fez entra em `docs/RELATORIO-COLABORACAO.md` só quando o grupo confirmar.

Ainda falta a Hellen confirmar e-mail, endereço, horário e duas respostas da FAQ (outras cidades e formas de pagamento).

## Licença

O código está sob a licença MIT (`LICENSE`). As fotos são de autoria da
Hellen Varella e podem ser usadas livremente neste repositório e no site.
Marca, nome e textos do studio continuam dela.

## Histórico

`git log` e `CHANGELOG.md`. Como contribuir: `CONTRIBUTING.md`.
