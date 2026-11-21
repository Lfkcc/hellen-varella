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

## Licença

O código está sob a licença MIT (`LICENSE`). As fotos são de autoria da
Hellen Varella e podem ser usadas livremente neste repositório e no site.
Marca, nome e textos do studio continuam dela.

## Histórico

`git log` e `CHANGELOG.md`. Como contribuir: `CONTRIBUTING.md`.
