import bcrypt from "bcrypt";
import pg from "pg";
import { loadConfig } from "./config.js";

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const senha = process.env.ADMIN_SENHA || "";

if (!email.includes("@") || senha.length < 8) {
  console.error("Defina ADMIN_EMAIL e ADMIN_SENHA (mínimo de 8 caracteres). Nada disso entra no Git.");
  process.exit(1);
}

const { databaseUrl } = loadConfig();
if (!databaseUrl) {
  console.error("Defina DATABASE_URL em backend/.env.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: /supabase\.(co|com)/.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
});

try {
  await client.connect();
  const senhaHash = await bcrypt.hash(senha, 12);
  await client.query(
    `insert into admins (email, senha_hash) values ($1, $2)
     on conflict (email) do update set senha_hash = excluded.senha_hash`,
    [email, senhaHash],
  );
  console.log(`Administrador gravado: ${email}`);
} catch (erro) {
  console.error(erro.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
