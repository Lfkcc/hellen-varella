# Como contribuir

Repositório do sistema web do Studio Hellen Varella. Equipe: Gabriel Joaquim,
Lucas Fernandes, Luiz Felipe e Otavio.

## Antes de commitar

1. Não coloque senha, token, chave de API nem arquivo `.env`.
   O modelo sem valores reais é o `.env.example`.
2. As fotos são de autoria da Hellen Varella e podem ser usadas livremente
   neste repositório e no site. A pasta `fotos-originais/` fica de fora do Git.
   Entram as versões otimizadas.
3. Não descreva caminho da sua máquina (`C:\Users\...`, `/home/...`).

## Mensagens de commit

Em português, no formato `tipo(escopo): descrição`.

Tipos: `feat`, `fix`, `docs`, `chore`, `test`.

Um assunto por commit. Exemplo: `feat(back): rota GET /api/combos`.

## Rodar o site

```bash
node frontend/tools/serve.mjs
```

Abre em http://127.0.0.1:4173/.

## Pull request

Descreva o que mudou e como testou. O modelo em `.github/` já pede isso.
