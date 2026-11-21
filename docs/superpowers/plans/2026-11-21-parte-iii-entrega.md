# Parte III — Roteiro de entrega (Studio Hellen Varella)

> Roteiro de trabalho, versão 2. Cada fase termina em um estado funcional e
> vira commits pequenos na `main`. Caixas `- [ ]` marcam o andamento.

**Objetivo:** entregar o sistema web completo (front + back + banco),
publicado, com README, script de banco, painel de edição para a Hellen e
histórico de commits coerente.

**Equipe:** Gabriel Joaquim, Lucas Fernandes, Luiz Felipe e Otavio.

**Arquitetura (decidida):** monorepo com `frontend/` (site estático atual +
painel `admin/`) e `backend/` (API Node + Express + Postgres). As fotos ficam
em armazenamento de objetos; o banco guarda só a URL.

**Stack proposta:** HTML/CSS/JS puro (front) · Node 20 + Express (back) ·
PostgreSQL via Supabase (banco + Storage) · Cloudflare Pages (front) ·
Render (back).

## Requisitos do enunciado → onde são atendidos

| Requisito | Fase |
|---|---|
| Repositório público, front e back em pastas separadas | 1, 4 |
| Commits coerentes, não "um commit final" | todas |
| README: descrição, tecnologias, rodar local, `.env.example`, comandos | 11 |
| README: como popular o banco, usuário de teste, links do deploy | 11, 12 |
| Script/dump do banco com dados mínimos | 5 |
| Se usar Atlas/equivalente: criar banco e string de conexão no README | 11 |
| Endereço do sistema na Web; se front/back separados, ambos os links e a ligação | 12 |
| Sem credenciais nem dados privados | 2 e todas |
| Entregas I e II dentro do repositório | 1 (`facul/`) |
| Código-fonte, imagens, textos, script de banco, README de instalação | 1 a 11 |
| Evidências: apresentação à Hellen, feedback por e-mail, divulgação no LinkedIn | 13 (fora do código) |
| Relatório de colaboração da equipe | 3 |

## Pré-requisitos (ações suas, sem me enviar segredos)

- [ ] Conta Supabase (login com GitHub) → criar projeto `hellen-varella`.
- [ ] Conta Render (login com GitHub).
- [ ] Conta Cloudflare (Pages) ou Netlify.
- [ ] Confirmar com a Hellen os dados pendentes de `docs/CHECKLIST-CONTEUDO.md`
  (e-mail, endereço, horário, preços, FAQ).
- [x] Uso das fotos: autoria da Hellen Varella, liberado para este repositório
  e para o site.
- [ ] Dizer, para cada integrante, o que fez de fato (insumo do relatório de
  colaboração, fase 3).
- [ ] Combinar a data da apresentação e avisar a Hellen sobre o e-mail de
  feedback (para o grupo e para jhonatan.alves@univali.br).
- Chaves e senhas ficam só nos painéis dos serviços e num `.env` local
  ignorado pelo git. O repositório terá apenas `.env.example`.

## Inventário das fotos em `~/Downloads`

Levantamento feito a partir dos nomes, tamanhos e hashes (ainda sem classificar
por tema, isso é a fase 6).

- 44 arquivos `IMG_*`; **11 grupos são cópias idênticas** (sufixos `(1)`, `(2)`,
  `.JPG.jpeg`). Ficam 30 imagens únicas:
  - `IMG_3713`, `3717`, `3718`, `3725`, `3727`, `3729`, `3745`, `5498`, `6940`,
    `9325`, `9330` aparecem duplicadas ou triplicadas.
- Dois tipos de origem:
  - **JPEG grandes** (2160×2880 a 3076×3845): `0220`, `0259`, `0266`, `3717`,
    `3718`, `3719`, `9325`, `9330`. Servem como foto principal.
  - **PNG de captura de tela** (1080×1920, 1282×~1700 etc.): `1416`, `3713`,
    `3720`, `3724` a `3731`, `3740` a `3745`, `5494`, `5498`, `5501`, `6940`.
    Podem ter barra de interface e texto do Instagram. Precisam de recorte ou
    de substituição pelo original, enviado pela Hellen.
- `IMG_3727` tem 8 MB e `IMG_0220` 4,4 MB: precisam de compressão.
- Temas a separar: **gestante, noiva (casamento), making of, cabelo, antes e
  depois**, além de social e artístico. Mais as fotos da **própria Hellen** e
  as dos **combos**.

## Contêineres de foto que precisam ser preparados no front

Hoje só existe o hero (`.photo-frame`, com um SVG de reserva) e seis cards
`.work` sem imagem. Faltam contêineres no site. Cada um terá proporção fixa,
`width`/`height`, `loading="lazy"`, `alt` real e reserva visual (blur ou cor)
enquanto carrega.

| Contêiner | Onde | Proporção | Slot de dados |
|---|---|---|---|
| Foto da Hellen | seção "Sobre a Hellen" (nova) e rodapé | 4:5 | `studio.foto_hellen_url` |
| Foto do hero | hero | 4:5 | `studio.foto_hero_url` |
| Foto dos combos 1 a 4 | topo de cada `.pack` na tabela de valores | 4:3 | `combos[].foto_url` |
| Portfólio por tema | `.work`, grade com filtro | variável (`wide`, `normal`, `dark`) | `portfolio[].foto_url` |
| Antes e depois | componente novo: duas imagens com controle deslizante | 1:1 | `portfolio[].foto_depois_url` |
| Imagem de compartilhamento | `<meta og:image>` | 1200×630 | `studio.og_url` |

Categorias do portfólio, ajustadas aos seus temas: `todos`, `gestante`,
`noiva`, `making`, `cabelo`, `antes-depois`, `social`, `artistico`.

## Fase 1 — Organizar o repositório
Resultado: estrutura final de pastas, histórico legível.

```
hellen-varella/
├── frontend/        site estático (index, 404, obrigada, assets, admin/)
├── backend/         API Node
├── database/        schema.sql, seed.sql
├── docs/            briefing, design system, arquitetura, este roteiro
├── facul/           entregas I e II (análise, protótipo, relatório)
├── .github/         modelos de issue e PR
├── README.md · LICENSE · .gitignore · .env.example · CONTRIBUTING.md
```

Commits previstos:
1. `chore: mover o site para frontend/` (usar `git mv`, preserva histórico)
2. `chore: ajustar caminhos de tools/ e scripts`
3. `docs: mover documentação para docs/`

## Fase 2 — Higiene, segurança e remoção de rastros de IA
Remover tudo que mencione ferramenta de IA, assistente ou agente.

- [x] Apagar `AGENTS.md`, `.cursor/`, `.claude/`, `docs/FERRAMENTAS-USADAS.md`.
- [x] Apagar `design/canvas/` e as menções a ele em `docs/DESIGN-SYSTEM.md` e `README.md`.
- [x] Reescrever `README.md`, `CHANGELOG.md`, `docs/MAPA-DO-REPOSITORIO.md` e os scripts em `frontend/tools/`.
- [x] Limpar `.gitignore`.
- [x] Textos de `docs/` e `facul/` sem menção a ferramenta de IA. O `.docx` foi lido como texto: sem caminho de máquina e sem essa menção. Telefone e @ do studio são os dados públicos já usados no site.
- [x] Remover caminhos locais (`E:\...`, `C:\Users\...`).
- [x] `.gitignore` completo e `.env.example`.
- [x] Varredura de segredos antes do push.
- [x] `LICENSE` (MIT para o código; fotos e marca são da Hellen, aviso no README), `.editorconfig`, `CONTRIBUTING.md`, `.github/`.

**Decisão sobre o histórico:** o primeiro commit (`251e63b`), já público,
contém esses arquivos. Apagá-los num commit novo não os tira do histórico.
Como o repositório tem um único commit e nenhum seguidor, minha recomendação
é refazer o commit inicial já sem esses arquivos e dar `git push --force`.
Alternativa: manter o histórico e só remover daqui para frente.

Commits: `chore: .gitignore e .env.example`, `docs: remover referências a
ferramentas externas`, `docs: adicionar LICENSE e CONTRIBUTING`.

## Fase 3 — Relatório de colaboração da equipe
Arquivo `docs/RELATORIO-COLABORACAO.md` (e seção "Equipe" no README).

- Estrutura: contexto do projeto; método de trabalho (reuniões, divisão de
  tarefas, revisão); **uma seção por integrante** (Gabriel Joaquim, Lucas
  Fernandes, Luiz Felipe e Otavio) com atividades, entregas e como ajudou os
  colegas; contato com a Hellen; dificuldades e aprendizados; linha do tempo.
- Só entra o que for verdadeiro. Preciso que você me passe, por integrante, as
  contribuições reais (código, design, texto, contato com a cliente, testes,
  apresentação). Sem isso eu monto o esqueleto e deixo as frases para vocês.
- [ ] Combinar os nomes de usuário do GitHub de cada um para créditos nos
  commits (`Co-authored-by`) e convite como colaboradores.

Commit: `docs: relatório de colaboração da equipe`.

## Fase 4 — Backend mínimo
- [x] `backend/package.json`, `src/server.js`, rota `GET /health`.
- [x] CORS liberado só para o domínio do front e `localhost`.
- [x] Configuração por variáveis de ambiente (`PORT`, `DATABASE_URL`,
  `CORS_ORIGIN`).
- [x] Teste de `/health` (`node:test` + `supertest`).

Commits: `feat(back): servidor Express com /health`, `test(back): cobrir /health`.

## Fase 5 — Banco de dados
Tabelas: `studio` (dados, `foto_hellen_url`, `foto_hero_url`, `og_url`),
`combos` (id, titulo, preco, itens, destaque, `foto_url`, ordem),
`servicos_avulsos`, `faq`, `portfolio` (categoria, titulo, texto,
`foto_url`, `foto_depois_url`, ordem, visivel), `contatos` (nome, telefone,
mensagem, criado_em), `admins` (e-mail, hash de senha).
- [x] `database/schema.sql` e `database/seed.sql` gerados a partir de
  `frontend/data/*.json` (fonte de verdade atual).
- [x] Rodado no Supabase em 21/11/2026. O projeto responde e o seed inseriu os dados do site.
- [x] Script `npm run db:seed` no backend.

Commits: `feat(db): schema inicial`, `feat(db): seed com combos e serviços`.

## Fase 6 — Fotos: triagem, preparo e contêineres
- [x] Criar `fotos-originais/` fora do git e copiar de Downloads só as imagens únicas.
- [x] Classificar e registrar em `docs/FOTOS-MAPA.md`. Não havia foto de noiva nem par de antes e depois neste lote.
- [ ] Nomes finais padronizados: `portfolio/gestante-01.jpg`,
  `combos/combo-2.jpg`, `hellen/retrato.jpg`.
- [x] Remover dados de câmera na exportação. Peças gráficas de preço ficaram de fora da grade.
- [x] Versões otimizadas em jpg e webp, todas abaixo de 250 KB.
- [x] Contêineres do hero, da Hellen, dos combos e do portfólio, com as fotos reais.
- [x] Bucket público `fotos` no Supabase, com as imagens enviadas.
- [x] URLs gravadas no seed e no banco.

Commits: `feat(front): contêiner da foto da Hellen`,
`feat(front): foto nos combos`, `feat(front): componente antes e depois`,
`feat(front): portfólio por tema com filtro`, `docs: mapa de fotos`.

## Fase 7 — API pública
Rotas: `GET /api/studio`, `/api/combos`, `/api/servicos`, `/api/faq`,
`/api/portfolio?categoria=`; `POST /api/contatos` com validação e limite de
requisições.
- [x] Rotas públicas com teste: studio, combos, serviços, FAQ, portfólio e contato.
- [x] Respostas no mesmo formato dos JSON atuais, para o front mudar pouco.

## Fase 8 — Painel de edição para a Hellen
- [x] Login, upload, combos, portfólio, estúdio, FAQ e mensagens.
- [x] Página `frontend/admin/` com noindex e Disallow.
Página `frontend/admin/` (fora do sitemap, `noindex`, `Disallow` no
`robots.txt`), pensada para uso no celular, sem mexer em código.

- Login: e-mail e senha de um único usuário administrador. A senha vive como
  hash `bcrypt` no banco; a primeira senha é criada por um script local e
  nunca vai ao repositório. A API devolve um token JWT de curta duração,
  guardado em `sessionStorage` e enviado no cabeçalho `Authorization`.
  (Cookies entre `pages.dev` e `onrender.com` são bloqueados como
  terceiros; por isso o token no cabeçalho.)
- O que ela edita:
  - **Fotos:** enviar, trocar, ocultar e reordenar fotos do portfólio, dos
    combos, da própria Hellen e do hero.
  - **Combos e serviços:** título, preço, itens, destaque.
  - **FAQ e dados do estúdio:** horário, endereço, WhatsApp.
  - **Mensagens do formulário de contato:** leitura.
- Upload no backend (`multer`): só `image/jpeg|png|webp`, limite de 8 MB;
  `sharp` redimensiona, converte e remove EXIF; o arquivo vai ao Supabase
  Storage com a chave de serviço, que fica só no servidor.
- Segurança: limite de tentativas de login, validação de entrada em todas as
  rotas, CORS restrito, mensagens de erro sem detalhes internos.
- Usuário de teste: criar uma conta de demonstração separada, com senha
  descartável, só para o professor, descrita no README sem expor a senha
  real da Hellen.
- Rotas: `POST /api/admin/login`, `GET/POST/PUT/DELETE /api/admin/combos`,
  `/api/admin/portfolio`, `POST /api/admin/upload`, `GET /api/admin/contatos`,
  `PUT /api/admin/studio`.

Commits: `feat(back): login do administrador`, `feat(back): upload de fotos`,
`feat(back): CRUD de combos`, `feat(back): CRUD do portfólio`,
`feat(front): tela de login do painel`, `feat(front): editor de fotos`,
`feat(front): editor de combos`, `test(back): rotas protegidas`.

## Fase 9 — Front consumindo a API
- [ ] `frontend/assets/js/api.js` com `API_URL` configurável.
- [ ] Combos, estúdio, portfólio e FAQ vêm da API; JSON local como reserva se
  a API estiver dormindo (Render grátis).
- [ ] Formulário de contato enviando para `POST /api/contatos`.
- [ ] Estado de carregamento e erro; conferir no navegador (celular e
  computador).

## Fase 10 — Revisão e testes
- [ ] `node tools/check-links.mjs` sem erros.
- [ ] Testes do backend verdes.
- [ ] Lighthouse: acessibilidade, desempenho e SEO acima de 90 no celular.
- [ ] Texto alternativo em todas as fotos.
- [ ] Varredura final de segredos e de dados pessoais.

## Fase 11 — README e documentação
Conteúdo mínimo exigido: descrição do sistema e do negócio, tecnologias,
passo a passo local, `.env.example`, comandos (`npm install`, `npm run dev`,
`npm run db:seed`), como criar o banco no Supabase e ajustar a string de
conexão, credenciais de demonstração do painel, links do deploy, estrutura de
pastas, como o front se liga ao back, equipe e licença.

## Fase 12 — Deploy
- [ ] Backend no Render (root `backend/`, variáveis no painel).
- [ ] Front no Cloudflare Pages (root `frontend/`).
- [ ] Atualizar `CORS_ORIGIN` e `API_URL`; testar de ponta a ponta, incluindo
  login no painel e upload de foto.
- [ ] Registrar os dois links no README e na descrição do repositório.
- [ ] Nota sobre o "cold start" do Render grátis.

## Fase 13 — Entrega e evidências (fora do código)
- [ ] Apresentar o sistema à Hellen, inclusive ensinando o painel (print,
  foto ou gravação).
- [ ] Coletar feedback final por e-mail oficial dela, com cópia para
  jhonatan.alves@univali.br. Questionário curto em
  `facul/04-questionario-validacao.md`.
- [ ] Analisar os resultados e atualizar o relatório de extensão.
- [ ] Post no LinkedIn marcando o professor
  (https://www.linkedin.com/in/jhonatan-alves-5634154a/) e a Univali.
- [ ] Guardar as evidências em `facul/anexos/` sem expor dados pessoais.
- [ ] Conferir a data da apresentação no AVA.

## Convenções de commit
Mensagens em português, curtas, no estilo `tipo(escopo): descrição`
(`feat`, `fix`, `docs`, `chore`, `test`). Um assunto por commit. Push ao fim de
cada fase, para o histórico mostrar o avanço aos poucos.

## Riscos
- Render grátis dorme: aviso no README e dados de reserva no front.
- As fotos são da Hellen e já podem entrar no repositório e no site.
- Capturas de tela como foto final: qualidade baixa; pedir os originais.
- Painel com upload é a parte mais sensível: senha forte, limites e testes.
- Reescrever o histórico exige `--force` num repositório público; só fazer
  com sua confirmação.
