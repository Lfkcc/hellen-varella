-- Studio Hellen Varella — tabelas
-- Rode isto uma vez no SQL Editor do Supabase, ou pelo comando npm run db:seed.
-- A conexão usa o usuário postgres do projeto. A API pública (anon) fica fechada.

begin;

drop table if exists
  contatos,
  admins,
  portfolio,
  portfolio_categorias,
  faq,
  cursos,
  servicos_detalhe,
  servicos_avulsos,
  combos,
  studio
cascade;

create table studio (
  id integer primary key default 1 check (id = 1),
  nome text not null,
  assinatura text not null,
  cidade text not null,
  mensagem_central text not null,
  posicionamento text not null,
  marca_frase text not null,
  rodape_frase text not null,
  whatsapp_numero text not null,
  whatsapp_link_curto text not null,
  telefone_exibicao text not null,
  telefone_href text not null,
  instagram text not null,
  instagram_handle text not null,
  threads text not null,
  email text,
  endereco text,
  horario text,
  foto_hellen_url text,
  foto_hero_url text,
  og_url text,
  seo_titulo text not null,
  seo_descricao text not null,
  url_canonica text,
  mensagem_geral text not null,
  mensagem_combo text not null,
  mensagem_servico text not null,
  mensagem_referencias text not null,
  mensagem_curso text not null,
  mensagem_quinta text not null,
  mensagem_proxima text not null,
  sinal text not null,
  regra_sinal text not null,
  extra text
);

create table combos (
  id text primary key,
  kicker text not null,
  titulo text not null,
  preco text not null,
  preco_valor integer not null check (preco_valor >= 0),
  itens jsonb not null,
  destaque boolean not null default false,
  foto_url text,
  ordem integer not null
);

create table servicos_avulsos (
  id text primary key,
  kicker text not null,
  titulo text not null,
  preco text not null,
  preco_sufixo text,
  itens jsonb not null,
  aviso text,
  soft boolean not null default false,
  ordem integer not null
);

create table servicos_detalhe (
  id text primary key,
  titulo text not null,
  texto text not null,
  aviso text,
  cta text not null,
  ordem integer not null
);

create table cursos (
  id text primary key,
  titulo text not null,
  texto text not null,
  cta text not null,
  ordem integer not null
);

create table faq (
  id integer generated always as identity primary key,
  pergunta text not null,
  resposta text not null,
  confirmado boolean not null default true,
  ordem integer not null
);

create table portfolio_categorias (
  id text primary key,
  rotulo text not null,
  ordem integer not null
);

create table portfolio (
  id text primary key,
  categoria text not null references portfolio_categorias (id),
  kicker text not null,
  titulo text not null,
  texto text not null,
  formato text not null default 'normal',
  foto_url text,
  foto_depois_url text,
  ordem integer not null,
  visivel boolean not null default true
);

create table contatos (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text not null,
  mensagem text not null,
  criado_em timestamptz not null default now()
);

create table admins (
  id integer generated always as identity primary key,
  email text not null unique,
  senha_hash text not null,
  criado_em timestamptz not null default now()
);

alter table studio enable row level security;
alter table combos enable row level security;
alter table servicos_avulsos enable row level security;
alter table servicos_detalhe enable row level security;
alter table cursos enable row level security;
alter table faq enable row level security;
alter table portfolio_categorias enable row level security;
alter table portfolio enable row level security;
alter table contatos enable row level security;
alter table admins enable row level security;

commit;
