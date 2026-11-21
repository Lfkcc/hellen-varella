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
| `frontend/404.html`, `frontend/obrigada.html` | páginas de apoio (na identidade) |
| `frontend/assets/css/` | design system em camadas (`tokens` → `base` → `layout` → `components` → `utilities`) |
| `frontend/assets/js/` | módulos ativos (`nav`, `reveal`, `portfolio`, `whatsapp`, `pricing`) e ociosos (`lightbox`, `agenda`, `depoimentos`, `analytics`) |
| `frontend/assets/img/`, `frontend/assets/fonts/` | READMEs com o que colocar (fotos e a fonte Perandory) |
| `frontend/data/*.json` | **fonte de verdade do conteúdo** — cada arquivo diz de onde veio cada dado |
| `frontend/tools/*.mjs` | `serve` (ativo) + `build-pages`, `new-section`, `check-links`, `optimize-images` |
| `docs/` | mapa do repo, briefing, design system, slot-map, checklist, arquitetura |
| `facul/` | entregas anteriores da disciplina |

## Antes de publicar

1. `docs/CHECKLIST-CONTEUDO.md` — falta principalmente **as fotos** e alguns
   dados que só a Hellen confirma.
2. `node frontend/tools/check-links.mjs` — tem que passar sem erros.

## API

```bash
cd backend
npm install
npm run dev
```

A rota de saúde responde em http://127.0.0.1:3000/health.

## Banco

O Postgres fica no Supabase. Os scripts estão em `database/schema.sql` e `database/seed.sql`.

1. No projeto do Supabase, abra Project Settings → Database e copie a connection string (URI).
2. Cole em `backend/.env` como `DATABASE_URL`. Esse arquivo não entra no Git.
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

## Licença

O código está sob a licença MIT (`LICENSE`). As fotos são de autoria da
Hellen Varella e podem ser usadas livremente neste repositório e no site.
Marca, nome e textos do studio continuam dela.

## Histórico

`git log` e `CHANGELOG.md`. Como contribuir: `CONTRIBUTING.md`.
