function lista(valor) {
  if (typeof valor === "string") return JSON.parse(valor);
  return valor;
}

function studioParaJson(linha) {
  const contato = {
    whatsapp_numero: linha.whatsapp_numero,
    whatsapp_link_curto: linha.whatsapp_link_curto,
    telefone_exibicao: linha.telefone_exibicao,
    telefone_href: linha.telefone_href,
    instagram: linha.instagram,
    instagram_handle: linha.instagram_handle,
    threads: linha.threads,
  };
  if (linha.email) contato.email = linha.email;
  else contato.email_placeholder = "[EMAIL DA HELLEN — confirmar se quer publicar]";
  if (linha.endereco) contato.endereco = linha.endereco;
  else contato.endereco_placeholder = "[ENDEREÇO DO STUDIO — confirmar se quer publicar ou manter só 'Fraiburgo, SC']";
  if (linha.horario) contato.horario = linha.horario;
  else contato.horario_placeholder = "[HORÁRIO DE ATENDIMENTO — confirmar]";

  const seo = {
    titulo: linha.seo_titulo,
    descricao: linha.seo_descricao,
  };
  if (linha.url_canonica) seo.url_canonica = linha.url_canonica;
  else seo.url_canonica_placeholder = "https://[DOMINIO-QUANDO-PUBLICAR]/";

  return {
    marca: {
      nome: linha.nome,
      assinatura: linha.assinatura,
      cidade: linha.cidade,
      mensagem_central: linha.mensagem_central,
      posicionamento: linha.posicionamento,
      marca_frase: linha.marca_frase,
      rodape_frase: linha.rodape_frase,
    },
    contato,
    fotos: {
      hellen: linha.foto_hellen_url,
      hero: linha.foto_hero_url,
    },
    mensagens_whatsapp: {
      geral: linha.mensagem_geral,
      combo: linha.mensagem_combo,
      servico: linha.mensagem_servico,
      referencias: linha.mensagem_referencias,
      curso: linha.mensagem_curso,
      quinta: linha.mensagem_quinta,
      proxima: linha.mensagem_proxima,
    },
    seo,
    reserva: {
      sinal: linha.sinal,
      regra: linha.regra_sinal,
    },
    extra: linha.extra,
  };
}

function comboParaJson(linha) {
  return {
    id: linha.id,
    kicker: linha.kicker,
    titulo: linha.titulo,
    preco: linha.preco,
    preco_valor: linha.preco_valor,
    itens: lista(linha.itens),
    destaque: linha.destaque,
    foto_url: linha.foto_url,
  };
}

export async function lerStudio(db) {
  const { rows } = await db.query("select * from studio where id = 1");
  if (!rows[0]) return null;
  return studioParaJson(rows[0]);
}

export async function lerCombos(db) {
  const { rows } = await db.query("select * from combos order by ordem");
  return rows.map(comboParaJson);
}

export async function lerServicos(db) {
  const studio = await lerStudio(db);
  const avulsos = await db.query("select * from servicos_avulsos order by ordem");
  const detalhe = await db.query("select * from servicos_detalhe order by ordem");
  const cursos = await db.query("select * from cursos order by ordem");
  return {
    avulsos: avulsos.rows.map((linha) => ({
      id: linha.id,
      kicker: linha.kicker,
      titulo: linha.titulo,
      preco: linha.preco,
      preco_sufixo: linha.preco_sufixo,
      itens: lista(linha.itens),
      aviso: linha.aviso,
      soft: linha.soft,
    })),
    extra: studio?.extra ?? null,
    servicos_detalhe: detalhe.rows.map((linha) => ({
      id: linha.id,
      titulo: linha.titulo,
      texto: linha.texto,
      aviso: linha.aviso,
      cta: linha.cta,
    })),
    cursos: cursos.rows.map((linha) => ({
      id: linha.id,
      titulo: linha.titulo,
      texto: linha.texto,
      cta: linha.cta,
    })),
    reserva: studio?.reserva ?? null,
  };
}

export async function lerFaq(db) {
  const { rows } = await db.query("select pergunta, resposta, confirmado from faq order by ordem");
  return rows;
}

export async function lerPortfolio(db, categoria) {
  const categorias = await db.query("select id, rotulo from portfolio_categorias order by ordem");
  const filtro = categoria && categoria !== "todos";
  const obras = await db.query(
    `select id, categoria, kicker, titulo, texto, formato, foto_url, foto_depois_url
     from portfolio
     where visivel = true ${filtro ? "and categoria = $1" : ""}
     order by ordem`,
    filtro ? [categoria] : [],
  );
  return {
    categorias: categorias.rows,
    obras: obras.rows,
  };
}

export async function categoriaExiste(db, categoria) {
  if (!categoria || categoria === "todos") return true;
  const { rows } = await db.query("select 1 from portfolio_categorias where id = $1", [categoria]);
  return rows.length > 0;
}

export async function gravarContato(db, { nome, telefone, mensagem }) {
  await db.query(
    "insert into contatos (nome, telefone, mensagem) values ($1, $2, $3)",
    [nome, telefone, mensagem],
  );
}
