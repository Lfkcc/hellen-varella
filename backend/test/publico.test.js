import assert from "node:assert/strict";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import request from "supertest";
import { createApp } from "../src/app.js";
import { aplicarArquivos } from "../src/seed.js";

const config = {
  corsOrigin: ["http://127.0.0.1:4173"],
  port: 0,
  databaseUrl: "",
  limiteContato: { max: 2, janelaMs: 60_000 },
};

async function appComBanco() {
  const db = new PGlite();
  await aplicarArquivos((comando) => db.exec(comando));
  return { db, app: createApp(config, db) };
}

test("GET /api/studio devolve a marca e o combo em destaque continua no banco", async () => {
  const { db, app } = await appComBanco();
  const resposta = await request(app).get("/api/studio");
  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.marca.nome, "Hellen Varella");
  assert.equal(resposta.body.contato.email_placeholder.includes("EMAIL"), true);
  assert.equal(resposta.body.reserva.sinal, "R$ 30");
  assert.match(resposta.body.fotos.hero, /hero\/retrato\.jpg$/);
  await db.close();
});

test("GET /api/combos traz o combo em destaque", async () => {
  const { db, app } = await appComBanco();
  const resposta = await request(app).get("/api/combos");
  assert.equal(resposta.status, 200);
  const destaque = resposta.body.combos.find((combo) => combo.destaque);
  assert.equal(destaque.id, "combo-2");
  assert.equal(destaque.titulo, "Maquiagem + cabelo + ensaio");
  assert.equal(destaque.itens[0], "Maquiagem profissional");
  await db.close();
});

test("GET /api/servicos traz corte, cursos e o sinal", async () => {
  const { db, app } = await appComBanco();
  const resposta = await request(app).get("/api/servicos");
  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.avulsos[0].id, "corte-feminino");
  assert.equal(resposta.body.cursos.length, 2);
  assert.equal(resposta.body.reserva.sinal, "R$ 30");
  await db.close();
});

test("GET /api/faq mantém as duas respostas ainda não confirmadas", async () => {
  const { db, app } = await appComBanco();
  const resposta = await request(app).get("/api/faq");
  assert.equal(resposta.status, 200);
  const abertas = resposta.body.itens.filter((item) => item.confirmado === false);
  assert.equal(abertas.length, 2);
  await db.close();
});

test("GET /api/portfolio filtra gestante e rejeita categoria inventada", async () => {
  const { db, app } = await appComBanco();
  const gestante = await request(app).get("/api/portfolio?categoria=gestante");
  assert.equal(gestante.status, 200);
  assert.ok(gestante.body.obras.length >= 4);
  assert.ok(gestante.body.obras.every((obra) => obra.categoria === "gestante"));
  const ruim = await request(app).get("/api/portfolio?categoria=inexistente");
  assert.equal(ruim.status, 400);
  await db.close();
});

test("POST /api/contatos grava e limita a repetição", async () => {
  const { db, app } = await appComBanco();
  const corpo = { nome: "Ana", telefone: "(49) 99999-0000", mensagem: "Quero agendar o combo." };
  const primeira = await request(app).post("/api/contatos").send(corpo);
  assert.equal(primeira.status, 201);
  const segunda = await request(app).post("/api/contatos").send(corpo);
  assert.equal(segunda.status, 201);
  const terceira = await request(app).post("/api/contatos").send(corpo);
  assert.equal(terceira.status, 429);
  const invalida = await request(app).post("/api/contatos").send({ nome: "A" });
  assert.equal(invalida.status, 400);
  const salvas = await db.query("select nome from contatos");
  assert.equal(salvas.rows.length, 2);
  await db.close();
});
