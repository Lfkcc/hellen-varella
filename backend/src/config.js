import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raizBackend = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function lerEnv(caminho) {
  let texto;
  try {
    texto = readFileSync(caminho, "utf8");
  } catch {
    return;
  }
  for (const linha of texto.split("\n")) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;
    const igual = limpa.indexOf("=");
    if (igual === -1) continue;
    const chave = limpa.slice(0, igual).trim();
    const valor = limpa.slice(igual + 1).trim();
    if (chave && process.env[chave] === undefined) process.env[chave] = valor;
  }
}

export function loadConfig(env = process.env) {
  lerEnv(resolve(raizBackend, ".env"));
  lerEnv(resolve(raizBackend, "../.env"));
  const origem = env.CORS_ORIGIN || "http://127.0.0.1:4173";
  return {
    port: Number(env.PORT || 3000),
    corsOrigin: origem.split(",").map((item) => item.trim()).filter(Boolean),
    databaseUrl: env.DATABASE_URL || "",
    jwtSecret: env.JWT_SECRET || "",
    supabaseUrl: (env.SUPABASE_URL || "").replace(/\/$/, ""),
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}
