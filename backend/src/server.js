import pg from "pg";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const db = config.databaseUrl
  ? new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: /supabase\.(co|com)/.test(config.databaseUrl) ? { rejectUnauthorized: false } : undefined,
  })
  : null;
const app = createApp(config, db);

app.listen(config.port, () => {
  console.log(`API em http://127.0.0.1:${config.port}`);
});
