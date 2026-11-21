import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { loadConfig } from "./config.js";

const pastaSql = resolve(dirname(fileURLToPath(import.meta.url)), "../../database");

export function comandosSql(texto) {
  return texto
    .split(/;\s*(?:\r?\n|$)/)
    .map((parte) => parte.trim())
    .filter((parte) => parte && !parte.split("\n").every((linha) => linha.trim().startsWith("--") || linha.trim() === ""));
}

export async function aplicarArquivos(query) {
  for (const nome of ["schema.sql", "seed.sql"]) {
    const texto = await readFile(resolve(pastaSql, nome), "utf8");
    for (const comando of comandosSql(texto)) {
      await query(comando);
    }
  }
}

async function main() {
  const { databaseUrl } = loadConfig();
  if (!databaseUrl) {
    console.error("Defina DATABASE_URL em backend/.env. O modelo está em .env.example. Esse arquivo não entra no Git.");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: /supabase\.(co|com)/.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    await aplicarArquivos((comando) => client.query(comando));
    const { rows } = await client.query("select count(*)::int as total from combos");
    console.log(`Banco populado. Combos: ${rows[0].total}.`);
  } finally {
    await client.end();
  }
}

const executadoDireto = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executadoDireto) {
  main().catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  });
}
