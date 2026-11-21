import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcrypt";
import sharp from "sharp";
import { PGlite } from "@electric-sql/pglite";
import request from "supertest";
import { createApp } from "../src/app.js";
import { aplicarArquivos } from "../src/seed.js";

const config = {
  corsOrigin: ["http://127.0.0.1:4173"],
  port: 0,
  databaseUrl: "",
  jwtSecret: "segredo-de-teste",
  limiteLogin: { max: 2, janelaMs: 60_000 },
};

async function preparar() {
  const db = new PGlite();
  await aplicarArquivos((comando) => db.exec(comando));
  const senhaHash = await bcrypt.hash("senha-teste", 4);
  await db.exec(
    `insert into admins (email, senha_hash) values ('professor@studiohellen.test', '${senhaHash}')`,
  );
  const enviados = [];
  const app = createApp(config, db);
  app.locals = app.locals || {};
  const comUpload = createApp({
    ...config,
    enviarArquivo: async (caminho, buffer) => {
      enviados.push({ caminho, tamanho: buffer.length });
      return `https://exemplo.test/fotos/${caminho}`;
    },
  }, db);
  return { db, app, comUpload, enviados };
}

async function entrar(app, senha = "senha-teste") {
  const resposta = await request(app)
    .post("/api/admin/login")
    .send({ email: "professor@studiohellen.test", senha });
  return resposta;
}

test("o login recusa senha errada e aceita a senha certa", async () => {
  const { db, app } = await preparar();
  const ruim = await entrar(app, "outra-senha");
  assert.equal(ruim.status, 401);
  const boa = await entrar(app);
  assert.equal(boa.status, 200);
  assert.equal(typeof boa.body.token, "string");
  const semToken = await request(app).get("/api/admin/combos");
  assert.equal(semToken.status, 401);
  const comToken = await request(app)
    .get("/api/admin/combos")
    .set("Authorization", `Bearer ${boa.body.token}`);
  assert.equal(comToken.status, 200);
  assert.equal(comToken.body.combos.find((combo) => combo.destaque).id, "combo-2");
  await db.close();
});

test("muitas senhas erradas travam o login", async () => {
  const { db, app } = await preparar();
  assert.equal((await entrar(app, "errada")).status, 401);
  assert.equal((await entrar(app, "errada")).status, 401);
  assert.equal((await entrar(app, "senha-teste")).status, 429);
  await db.close();
});

test("um administrador altera o combo e o estúdio", async () => {
  const { db, app } = await preparar();
  const { body } = await entrar(app);
  const combo = await request(app)
    .put("/api/admin/combos/combo-2")
    .set("Authorization", `Bearer ${body.token}`)
    .send({
      kicker: "Combo 2",
      titulo: "Maquiagem + cabelo + ensaio",
      preco: "R$ 380",
      preco_valor: 380,
      itens: ["Maquiagem profissional", "Cabelo"],
      destaque: true,
      foto_url: "https://exemplo.test/combo-2.jpg",
    });
  assert.equal(combo.status, 200);
  const lido = await db.query("select preco from combos where id = 'combo-2'");
  assert.equal(lido.rows[0].preco, "R$ 380");

  const studio = await request(app)
    .put("/api/admin/studio")
    .set("Authorization", `Bearer ${body.token}`)
    .send({ horario: "Terça a sábado, 9h às 18h", endereco: "", email: "", whatsapp_numero: "", telefone_exibicao: "" });
  assert.equal(studio.status, 200);
  assert.equal(studio.body.contato.horario, "Terça a sábado, 9h às 18h");
  await db.close();
});

test("a foto sobe só com token e vira jpeg sem dados de câmera", async () => {
  const { db, comUpload, enviados } = await preparar();
  const { body } = await entrar(comUpload);
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: "red" } }).png().toBuffer();
  const semToken = await request(comUpload)
    .post("/api/admin/upload")
    .field("destino", "portfolio/nova.jpg")
    .attach("arquivo", png, { filename: "nova.png", contentType: "image/png" });
  assert.equal(semToken.status, 401);
  const resposta = await request(comUpload)
    .post("/api/admin/upload")
    .set("Authorization", `Bearer ${body.token}`)
    .field("destino", "portfolio/nova.jpg")
    .attach("arquivo", png, { filename: "nova.png", contentType: "image/png" });
  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.url, "https://exemplo.test/fotos/portfolio/nova.jpg");
  assert.equal(enviados[0].caminho, "portfolio/nova.jpg");
  assert.ok(enviados[0].tamanho > 0);
  const texto = await request(comUpload)
    .post("/api/admin/upload")
    .set("Authorization", `Bearer ${body.token}`)
    .field("destino", "portfolio/nova.jpg")
    .attach("arquivo", Buffer.from("nao-e-imagem"), { filename: "nota.txt", contentType: "text/plain" });
  assert.equal(texto.status, 400);
  await db.close();
});

test("as mensagens de contato só aparecem para quem entrou", async () => {
  const { db, app } = await preparar();
  await db.exec("insert into contatos (nome, telefone, mensagem) values ('Ana', '49999990000', 'Quero agendar')");
  const fechado = await request(app).get("/api/admin/contatos");
  assert.equal(fechado.status, 401);
  const { body } = await entrar(app);
  const aberto = await request(app)
    .get("/api/admin/contatos")
    .set("Authorization", `Bearer ${body.token}`);
  assert.equal(aberto.status, 200);
  assert.equal(aberto.body.contatos[0].nome, "Ana");
  await db.close();
});
