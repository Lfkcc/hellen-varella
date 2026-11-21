import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

const config = { corsOrigin: ["http://127.0.0.1:4173"], port: 0, databaseUrl: "" };

test("GET /health responde ok", async () => {
  const resposta = await request(createApp(config)).get("/health");
  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.body, { ok: true });
});

test("GET /health libera a origem do front", async () => {
  const resposta = await request(createApp(config))
    .get("/health")
    .set("Origin", "http://127.0.0.1:4173");
  assert.equal(resposta.headers["access-control-allow-origin"], "http://127.0.0.1:4173");
});

test("GET /health não libera outra origem", async () => {
  const resposta = await request(createApp(config))
    .get("/health")
    .set("Origin", "https://exemplo-ruim.test");
  assert.equal(resposta.headers["access-control-allow-origin"], undefined);
});

test("rota inexistente responde 404", async () => {
  const resposta = await request(createApp(config)).get("/api/combos");
  assert.equal(resposta.status, 404);
  assert.deepEqual(resposta.body, { erro: "não encontrado" });
});
