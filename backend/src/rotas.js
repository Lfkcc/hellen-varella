import { Router } from "express";
import {
  categoriaExiste,
  gravarContato,
  lerCombos,
  lerFaq,
  lerPortfolio,
  lerServicos,
  lerStudio,
} from "./consultas.js";

function texto(valor, minimo, maximo) {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  if (limpo.length < minimo || limpo.length > maximo) return null;
  return limpo;
}

function telefoneValido(valor) {
  const limpo = texto(valor, 8, 20);
  if (!limpo) return null;
  const digitos = limpo.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) return null;
  return limpo;
}

function seguro(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function rotasPublicas(db, config = {}) {
  const rotas = Router();
  const maximo = config.limiteContato?.max ?? 5;
  const janelaMs = config.limiteContato?.janelaMs ?? 10 * 60 * 1000;
  const acessos = new Map();

  rotas.get("/studio", seguro(async (_req, res) => {
    const studio = await lerStudio(db);
    if (!studio) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json(studio);
  }));

  rotas.get("/combos", seguro(async (_req, res) => {
    res.json({ combos: await lerCombos(db) });
  }));

  rotas.get("/servicos", seguro(async (_req, res) => {
    res.json(await lerServicos(db));
  }));

  rotas.get("/faq", seguro(async (_req, res) => {
    res.json({ itens: await lerFaq(db) });
  }));

  rotas.get("/portfolio", seguro(async (req, res) => {
    const categoria = typeof req.query.categoria === "string" ? req.query.categoria : "";
    if (!(await categoriaExiste(db, categoria))) {
      res.status(400).json({ erro: "categoria desconhecida" });
      return;
    }
    res.json(await lerPortfolio(db, categoria));
  }));

  rotas.post("/contatos", seguro(async (req, res) => {
    const nome = texto(req.body?.nome, 2, 80);
    const telefone = telefoneValido(req.body?.telefone);
    const mensagem = texto(req.body?.mensagem, 5, 1000);
    if (!nome || !telefone || !mensagem) {
      res.status(400).json({ erro: "informe nome, telefone e mensagem." });
      return;
    }

    const ip = req.ip || "local";
    const agora = Date.now();
    const recentes = (acessos.get(ip) || []).filter((quando) => agora - quando < janelaMs);
    if (recentes.length >= maximo) {
      res.status(429).json({ erro: "muitas mensagens agora. tente de novo daqui a pouco." });
      return;
    }

    recentes.push(agora);
    acessos.set(ip, recentes);
    await gravarContato(db, { nome, telefone, mensagem });
    res.status(201).json({ ok: true });
  }));

  return rotas;
}
