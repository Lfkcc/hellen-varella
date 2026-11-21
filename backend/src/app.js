import cors from "cors";
import express from "express";

export function createApp(config) {
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

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((_req, res) => {
    res.status(404).json({ erro: "não encontrado" });
  });

  return app;
}
