import cors from "cors";
import express from "express";
import { rotasAdmin } from "./admin-rotas.js";
import { rotasPublicas } from "./rotas.js";

export function createApp(config, db) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  if (db) {
    app.use("/api/admin", rotasAdmin(db, config));
    app.use("/api", rotasPublicas(db, config));
  }

  app.use((_req, res) => {
    res.status(404).json({ erro: "não encontrado" });
  });

  app.use((erro, _req, res, _next) => {
    if (erro.type === "entity.parse.failed") {
      res.status(400).json({ erro: "informe nome, telefone e mensagem." });
      return;
    }
    console.error(erro);
    res.status(500).json({ erro: "não foi possível concluir agora." });
  });

  return app;
}
