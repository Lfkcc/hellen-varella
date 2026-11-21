import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { aplicarArquivos } from "../src/seed.js";

test("schema e seed criam os dados do site", async () => {
  const db = new PGlite();
  await aplicarArquivos((comando) => db.exec(comando));
  const combos = await db.query("select id from combos where destaque = true");
  const faq = await db.query("select count(*)::int as total from faq where confirmado = false");
  const categorias = await db.query("select id from portfolio_categorias where id = 'antes-depois'");
  const studio = await db.query("select nome, email from studio");
  assert.deepEqual(combos.rows, [{ id: "combo-2" }]);
  assert.equal(faq.rows[0].total, 2);
  assert.equal(categorias.rows.length, 1);
  assert.equal(studio.rows[0].nome, "Hellen Varella");
  assert.equal(studio.rows[0].email, null);
  await db.close();
});

test("o seed avisa quando falta DATABASE_URL", () => {
  const resultado = spawnSync(process.execPath, ["src/seed.js"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...process.env, DATABASE_URL: "" },
    encoding: "utf8",
  });
  assert.equal(resultado.status, 1);
  assert.match(resultado.stderr, /DATABASE_URL/);
});

test("os arquivos SQL estão no repositório", async () => {
  const schema = await readFile(new URL("../../database/schema.sql", import.meta.url), "utf8");
  const seed = await readFile(new URL("../../database/seed.sql", import.meta.url), "utf8");
  for (const tabela of ["studio", "combos", "portfolio", "faq", "contatos", "admins"]) {
    assert.match(schema, new RegExp(`create table ${tabela}`));
  }
  assert.match(seed, /combo-2/);
});
