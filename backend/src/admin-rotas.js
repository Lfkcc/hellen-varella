import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Router } from "express";
import { lerStudio } from "./consultas.js";
import { caminhoPermitido, enviarParaStorage, prepararFoto } from "./fotos.js";

function seguro(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function texto(valor, minimo, maximo) {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  if (limpo.length < minimo || limpo.length > maximo) return null;
  return limpo;
}

function listaTextos(valor, maximo) {
  if (!Array.isArray(valor) || valor.length < 1 || valor.length > maximo) return null;
  const itens = [];
  for (const item of valor) {
    const limpo = texto(item, 1, 160);
    if (!limpo) return null;
    itens.push(limpo);
  }
  return itens;
}

function booleano(valor) {
  return valor === true || valor === false ? valor : null;
}

function inteiro(valor, maximo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0 || numero > maximo) return null;
  return numero;
}

function slug(valor) {
  return texto(valor, 2, 40) && /^[a-z0-9-]+$/.test(valor.trim()) ? valor.trim() : null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function receberArquivo(req, res, next) {
  upload.single("arquivo")(req, res, (erro) => {
    if (!erro) {
      next();
      return;
    }
    if (erro.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ erro: "a foto passa de 8 MB." });
      return;
    }
    res.status(400).json({ erro: "envie uma foto jpeg, png ou webp." });
  });
}

function comboJson(linha) {
  return {
    id: linha.id,
    kicker: linha.kicker,
    titulo: linha.titulo,
    preco: linha.preco,
    preco_valor: linha.preco_valor,
    itens: typeof linha.itens === "string" ? JSON.parse(linha.itens) : linha.itens,
    destaque: linha.destaque,
    foto_url: linha.foto_url,
    ordem: linha.ordem,
  };
}

function obraJson(linha) {
  return {
    id: linha.id,
    categoria: linha.categoria,
    kicker: linha.kicker,
    titulo: linha.titulo,
    texto: linha.texto,
    formato: linha.formato,
    foto_url: linha.foto_url,
    foto_depois_url: linha.foto_depois_url,
    ordem: linha.ordem,
    visivel: linha.visivel,
  };
}

export function rotasAdmin(db, config = {}) {
  const rotas = Router();
  const maximo = config.limiteLogin?.max ?? 5;
  const janelaMs = config.limiteLogin?.janelaMs ?? 10 * 60 * 1000;
  const falhas = new Map();

  function exigirAdmin(req, res, next) {
    if (!config.jwtSecret) {
      res.status(503).json({ erro: "painel indisponível." });
      return;
    }
    const cabecalho = req.headers.authorization || "";
    const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.adminId = payload.sub;
      next();
    } catch {
      res.status(401).json({ erro: "entre de novo." });
    }
  }

  rotas.post("/login", seguro(async (req, res) => {
    if (!config.jwtSecret) {
      res.status(503).json({ erro: "painel indisponível." });
      return;
    }
    const ip = req.ip || "local";
    const agora = Date.now();
    const recentes = (falhas.get(ip) || []).filter((quando) => agora - quando < janelaMs);
    if (recentes.length >= maximo) {
      res.status(429).json({ erro: "muitas tentativas. tente de novo daqui a pouco." });
      return;
    }

    const email = texto(req.body?.email, 5, 120)?.toLowerCase();
    const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
    const { rows } = email
      ? await db.query("select id, senha_hash from admins where email = $1", [email])
      : { rows: [] };
    const confere = rows[0] ? await bcrypt.compare(senha, rows[0].senha_hash) : false;
    if (!confere) {
      recentes.push(agora);
      falhas.set(ip, recentes);
      res.status(401).json({ erro: "e-mail ou senha não conferem." });
      return;
    }
    falhas.delete(ip);
    const token = jwt.sign({ sub: rows[0].id }, config.jwtSecret, { expiresIn: "2h" });
    res.json({ token });
  }));

  rotas.get("/combos", exigirAdmin, seguro(async (_req, res) => {
    const { rows } = await db.query("select * from combos order by ordem, id");
    res.json({ combos: rows.map(comboJson) });
  }));

  rotas.post("/combos", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.body?.id);
    const kicker = texto(req.body?.kicker, 2, 40);
    const titulo = texto(req.body?.titulo, 2, 80);
    const preco = texto(req.body?.preco, 2, 20);
    const precoValor = inteiro(req.body?.preco_valor, 100000);
    const itens = listaTextos(req.body?.itens, 12);
    if (!id || !kicker || !titulo || !preco || precoValor === null || !itens) {
      res.status(400).json({ erro: "revise o combo antes de salvar." });
      return;
    }
    const ordem = await db.query("select coalesce(max(ordem), 0) + 1 as proxima from combos");
    if (req.body?.destaque === true) {
      await db.query("update combos set destaque = false");
    }
    await db.query(
      `insert into combos (id, kicker, titulo, preco, preco_valor, itens, destaque, foto_url, ordem)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7, null, $8)`,
      [id, kicker, titulo, preco, precoValor, JSON.stringify(itens), req.body?.destaque === true, ordem.rows[0].proxima],
    );
    res.status(201).json({ id });
  }));

  rotas.put("/combos/:id", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.params.id);
    const titulo = texto(req.body?.titulo, 2, 80);
    const preco = texto(req.body?.preco, 2, 20);
    const precoValor = inteiro(req.body?.preco_valor, 100000);
    const itens = listaTextos(req.body?.itens, 12);
    const kicker = texto(req.body?.kicker, 2, 40);
    const destaque = booleano(req.body?.destaque);
    if (!id || !titulo || !preco || precoValor === null || !itens || !kicker || destaque === null) {
      res.status(400).json({ erro: "revise o combo antes de salvar." });
      return;
    }
    if (destaque) await db.query("update combos set destaque = false where id <> $1", [id]);
    const foto = texto(req.body?.foto_url || "", 0, 300);
    const resultado = await db.query(
      `update combos
       set kicker = $2, titulo = $3, preco = $4, preco_valor = $5, itens = $6::jsonb, destaque = $7, foto_url = $8
       where id = $1`,
      [id, kicker, titulo, preco, precoValor, JSON.stringify(itens), destaque, foto || null],
    );
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.delete("/combos/:id", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.params.id);
    if (!id) {
      res.status(400).json({ erro: "revise o combo antes de salvar." });
      return;
    }
    const resultado = await db.query("delete from combos where id = $1", [id]);
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.get("/avulsos", exigirAdmin, seguro(async (_req, res) => {
    const { rows } = await db.query("select * from servicos_avulsos order by ordem");
    res.json({
      avulsos: rows.map((linha) => ({
        id: linha.id,
        kicker: linha.kicker,
        titulo: linha.titulo,
        preco: linha.preco,
        preco_sufixo: linha.preco_sufixo,
        itens: typeof linha.itens === "string" ? JSON.parse(linha.itens) : linha.itens,
        aviso: linha.aviso,
      })),
    });
  }));

  rotas.put("/avulsos/:id", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.params.id);
    const titulo = texto(req.body?.titulo, 2, 80);
    const preco = texto(req.body?.preco, 2, 20);
    const itens = listaTextos(req.body?.itens, 12);
    if (!id || !titulo || !preco || !itens) {
      res.status(400).json({ erro: "revise o serviço antes de salvar." });
      return;
    }
    const aviso = texto(req.body?.aviso || "", 0, 200);
    const resultado = await db.query(
      "update servicos_avulsos set titulo = $2, preco = $3, itens = $4::jsonb, aviso = $5 where id = $1",
      [id, titulo, preco, JSON.stringify(itens), aviso || null],
    );
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.get("/portfolio", exigirAdmin, seguro(async (_req, res) => {
    const obras = await db.query("select * from portfolio order by ordem, id");
    const categorias = await db.query("select id, rotulo from portfolio_categorias where id <> 'todos' order by ordem");
    res.json({ obras: obras.rows.map(obraJson), categorias: categorias.rows });
  }));

  rotas.put("/portfolio/ordem", exigirAdmin, seguro(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
    if (!ids || ids.some((id) => !slug(id))) {
      res.status(400).json({ erro: "revise a ordem antes de salvar." });
      return;
    }
    for (let indice = 0; indice < ids.length; indice += 1) {
      await db.query("update portfolio set ordem = $2 where id = $1", [ids[indice], indice + 1]);
    }
    res.json({ ok: true });
  }));

  rotas.put("/portfolio/:id", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.params.id);
    const titulo = texto(req.body?.titulo, 2, 120);
    const textoObra = texto(req.body?.texto, 2, 400);
    const kicker = texto(req.body?.kicker, 2, 40);
    const categoria = slug(req.body?.categoria);
    const formato = ["normal", "wide", "dark"].includes(req.body?.formato) ? req.body.formato : null;
    const visivel = booleano(req.body?.visivel);
    if (!id || !titulo || !textoObra || !kicker || !categoria || !formato || visivel === null) {
      res.status(400).json({ erro: "revise a foto antes de salvar." });
      return;
    }
    const existe = await db.query("select 1 from portfolio_categorias where id = $1", [categoria]);
    if (!existe.rows.length) {
      res.status(400).json({ erro: "categoria desconhecida" });
      return;
    }
    const foto = texto(req.body?.foto_url || "", 0, 300);
    const resultado = await db.query(
      `update portfolio
       set titulo = $2, texto = $3, kicker = $4, categoria = $5, formato = $6, visivel = $7, foto_url = $8
       where id = $1`,
      [id, titulo, textoObra, kicker, categoria, formato, visivel, foto || null],
    );
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.delete("/portfolio/:id", exigirAdmin, seguro(async (req, res) => {
    const id = slug(req.params.id);
    if (!id) {
      res.status(400).json({ erro: "revise a foto antes de salvar." });
      return;
    }
    const resultado = await db.query("delete from portfolio where id = $1", [id]);
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.get("/studio", exigirAdmin, seguro(async (_req, res) => {
    const { rows } = await db.query(
      "select email, endereco, horario, whatsapp_numero, telefone_exibicao, foto_hellen_url, foto_hero_url from studio where id = 1",
    );
    res.json(rows[0] || {});
  }));

  rotas.put("/studio", exigirAdmin, seguro(async (req, res) => {
    const email = texto(req.body?.email || "", 0, 120);
    const endereco = texto(req.body?.endereco || "", 0, 160);
    const horario = texto(req.body?.horario || "", 0, 160);
    const whatsapp = texto(req.body?.whatsapp_numero || "", 0, 15);
    const telefone = texto(req.body?.telefone_exibicao || "", 0, 20);
    if (email === null || endereco === null || horario === null || whatsapp === null || telefone === null) {
      res.status(400).json({ erro: "revise os dados do estúdio." });
      return;
    }
    if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) {
      res.status(400).json({ erro: "revise os dados do estúdio." });
      return;
    }
    if (email && !email.includes("@")) {
      res.status(400).json({ erro: "revise os dados do estúdio." });
      return;
    }
    const valores = [email || null, endereco || null, horario || null, whatsapp, telefone];
    let fotos = "";
    for (const coluna of ["foto_hellen_url", "foto_hero_url"]) {
      if (typeof req.body?.[coluna] !== "string") continue;
      const foto = texto(req.body[coluna], 8, 300);
      if (!foto) {
        res.status(400).json({ erro: "revise os dados do estúdio." });
        return;
      }
      valores.push(foto);
      fotos += `, ${coluna} = $${valores.length}`;
    }
    await db.query(
      `update studio set email = $1, endereco = $2, horario = $3, whatsapp_numero = coalesce(nullif($4, ''), whatsapp_numero),
       telefone_exibicao = coalesce(nullif($5, ''), telefone_exibicao)${fotos} where id = 1`,
      valores,
    );
    res.json(await lerStudio(db));
  }));

  rotas.get("/faq", exigirAdmin, seguro(async (_req, res) => {
    const { rows } = await db.query("select id, pergunta, resposta, confirmado from faq order by ordem");
    res.json({ itens: rows });
  }));

  rotas.put("/faq/:id", exigirAdmin, seguro(async (req, res) => {
    const id = inteiro(req.params.id, 10000);
    const pergunta = texto(req.body?.pergunta, 5, 180);
    const resposta = texto(req.body?.resposta, 5, 800);
    const confirmado = booleano(req.body?.confirmado);
    if (!id || !pergunta || !resposta || confirmado === null) {
      res.status(400).json({ erro: "revise a pergunta antes de salvar." });
      return;
    }
    const resultado = await db.query(
      "update faq set pergunta = $2, resposta = $3, confirmado = $4 where id = $1",
      [id, pergunta, resposta, confirmado],
    );
    if (!resultado.rowCount) {
      res.status(404).json({ erro: "não encontrado" });
      return;
    }
    res.json({ ok: true });
  }));

  rotas.get("/contatos", exigirAdmin, seguro(async (_req, res) => {
    const { rows } = await db.query("select id, nome, telefone, mensagem, criado_em from contatos order by criado_em desc");
    res.json({
      contatos: rows.map((linha) => ({
        id: linha.id,
        nome: linha.nome,
        telefone: linha.telefone,
        mensagem: linha.mensagem,
        criado_em: new Date(linha.criado_em).toISOString(),
      })),
    });
  }));

  rotas.post("/upload", exigirAdmin, receberArquivo, seguro(async (req, res) => {
    const destino = req.body?.destino;
    if (!caminhoPermitido(destino)) {
      res.status(400).json({ erro: "escolha um lugar válido para a foto." });
      return;
    }
    const tipo = req.file?.mimetype;
    if (!req.file || !["image/jpeg", "image/png", "image/webp"].includes(tipo)) {
      res.status(400).json({ erro: "envie uma foto jpeg, png ou webp." });
      return;
    }
    const buffer = await prepararFoto(req.file.buffer);
    const enviar = config.enviarArquivo || ((caminho, conteudo) => enviarParaStorage({
      url: config.supabaseUrl,
      chave: config.supabaseServiceKey,
      caminho,
      buffer: conteudo,
    }));
    if (!config.enviarArquivo && (!config.supabaseUrl || !config.supabaseServiceKey)) {
      res.status(503).json({ erro: "painel indisponível." });
      return;
    }
    const url = await enviar(destino, buffer);
    res.json({ url });
  }));

  return rotas;
}
