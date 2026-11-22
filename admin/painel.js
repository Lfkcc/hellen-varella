const $ = (id) => document.getElementById(id);

function apiPadrao() {
  const host = location.hostname;
  if (host === "127.0.0.1" || host === "localhost") return "http://127.0.0.1:3000";
  return "https://hellen-varella-api.onrender.com";
}

function base() {
  return (localStorage.getItem("hv-api") || apiPadrao()).replace(/\/$/, "");
}

function aviso(texto) {
  $("aviso").textContent = texto || "";
}

async function api(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});
  const token = sessionStorage.getItem("hv-token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let body = opcoes.body;
  if (opcoes.json) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(opcoes.json);
  }
  const resposta = await fetch(`${base()}${caminho}`, { method: opcoes.method || "GET", headers, body });
  const dados = await resposta.json().catch(() => ({}));
  if (resposta.status === 401) {
    sessionStorage.removeItem("hv-token");
    mostrarLogin();
    throw new Error(dados.erro || "entre de novo.");
  }
  if (!resposta.ok) throw new Error(dados.erro || "não foi possível concluir.");
  return dados;
}

function campo(rotulo, valor, atributos = {}) {
  const label = document.createElement("label");
  label.textContent = rotulo;
  const input = document.createElement(atributos.linhas ? "textarea" : "input");
  Object.assign(input, atributos);
  if (atributos.linhas) input.rows = atributos.linhas;
  input.value = valor ?? "";
  label.append(input);
  return { label, input };
}

function botao(rotulo, classe, aoClicar) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = rotulo;
  if (classe) el.className = classe;
  el.addEventListener("click", aoClicar);
  return el;
}

function mostrarLogin() {
  $("login").hidden = false;
  $("app").hidden = true;
}

function mostrarPainel() {
  $("login").hidden = true;
  $("app").hidden = false;
  carregarAba(document.querySelector(".abas button[aria-pressed='true']").dataset.aba);
}

$("form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const dados = new FormData(evento.currentTarget);
  localStorage.setItem("hv-api", String(dados.get("api")).trim());
  $("login-erro").textContent = "";
  try {
    const resposta = await fetch(`${base()}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: dados.get("email"), senha: dados.get("senha") }),
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(corpo.erro || "não foi possível entrar.");
    sessionStorage.setItem("hv-token", corpo.token);
    mostrarPainel();
  } catch (erro) {
    $("login-erro").textContent = erro.message;
  }
});

$("sair").addEventListener("click", () => {
  sessionStorage.removeItem("hv-token");
  mostrarLogin();
});

document.querySelectorAll(".abas button").forEach((botaoAba) => {
  botaoAba.addEventListener("click", () => {
    document.querySelectorAll(".abas button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === botaoAba));
    });
    document.querySelectorAll("#app section").forEach((secao) => {
      secao.hidden = secao.id !== `aba-${botaoAba.dataset.aba}`;
    });
    carregarAba(botaoAba.dataset.aba);
  });
});

async function carregarAba(nome) {
  aviso("Carregando…");
  try {
    if (nome === "combos") await renderCombos();
    if (nome === "servicos") await renderServicos();
    if (nome === "portfolio") await renderPortfolio();
    if (nome === "estudio") await renderEstudio();
    if (nome === "faq") await renderFaq();
    if (nome === "mensagens") await renderMensagens();
    aviso("");
  } catch (erro) {
    aviso(erro.message);
  }
}

async function renderCombos() {
  const secao = $("aba-combos");
  secao.replaceChildren();
  const { combos } = await api("/api/admin/combos");
  const novo = document.createElement("form");
  novo.className = "cartao";
  const id = campo("Identificador", "", { name: "id", required: true });
  const kicker = campo("Chamada", "Combo", { required: true });
  const titulo = campo("Título", "", { required: true });
  const preco = campo("Preço", "R$ ", { required: true });
  const valor = campo("Valor", "0", { type: "number", min: "0", required: true });
  const itens = campo("Itens, um por linha", "", { linhas: 4, required: true });
  novo.append(id.label, kicker.label, titulo.label, preco.label, valor.label, itens.label);
  novo.append(botao("Criar combo", "", async () => {
    try {
      await api("/api/admin/combos", {
        method: "POST",
        json: {
          id: id.input.value,
          kicker: kicker.input.value,
          titulo: titulo.input.value,
          preco: preco.input.value,
          preco_valor: Number(valor.input.value),
          itens: itens.input.value.split("\n").map((item) => item.trim()).filter(Boolean),
          destaque: false,
        },
      });
      await renderCombos();
      aviso("Combo criado.");
    } catch (erro) {
      aviso(erro.message);
    }
  }));
  secao.append(novo);

  for (const combo of combos) {
    const artigo = document.createElement("article");
    const chamada = campo("Chamada", combo.kicker);
    const nome = campo("Título", combo.titulo);
    const precoCombo = campo("Preço", combo.preco);
    const valorCombo = campo("Valor", String(combo.preco_valor), { type: "number", min: "0" });
    const lista = campo("Itens, um por linha", combo.itens.join("\n"), { linhas: 5 });
    const foto = campo("Foto", combo.foto_url || "");
    const destaque = document.createElement("label");
    destaque.className = "check";
    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.checked = combo.destaque;
    destaque.append(marca, document.createTextNode("Combo em destaque"));
    const acoes = document.createElement("div");
    acoes.className = "acoes";
    acoes.append(
      botao("Salvar", "", async () => {
        try {
          await api(`/api/admin/combos/${combo.id}`, {
            method: "PUT",
            json: {
              kicker: chamada.input.value,
              titulo: nome.input.value,
              preco: precoCombo.input.value,
              preco_valor: Number(valorCombo.input.value),
              itens: lista.input.value.split("\n").map((item) => item.trim()).filter(Boolean),
              destaque: marca.checked,
              foto_url: foto.input.value,
            },
          });
          aviso("Combo salvo.");
          await renderCombos();
        } catch (erro) {
          aviso(erro.message);
        }
      }),
      botao("Apagar", "secundario", async () => {
        if (!confirm(`Apagar ${combo.titulo}?`)) return;
        try {
          await api(`/api/admin/combos/${combo.id}`, { method: "DELETE" });
          await renderCombos();
        } catch (erro) {
          aviso(erro.message);
        }
      }),
    );
    const arquivo = document.createElement("input");
    arquivo.type = "file";
    arquivo.accept = "image/jpeg,image/png,image/webp";
    arquivo.addEventListener("change", () => enviarFoto(arquivo, `combos/${combo.id}.jpg`, async (url) => {
      foto.input.value = url;
      marca.dispatchEvent(new Event("change"));
      await api(`/api/admin/combos/${combo.id}`, {
        method: "PUT",
        json: {
          kicker: chamada.input.value,
          titulo: nome.input.value,
          preco: precoCombo.input.value,
          preco_valor: Number(valorCombo.input.value),
          itens: lista.input.value.split("\n").map((item) => item.trim()).filter(Boolean),
          destaque: marca.checked,
          foto_url: url,
        },
      });
      await renderCombos();
    }));
    artigo.append(chamada.label, nome.label, precoCombo.label, valorCombo.label, lista.label, foto.label, destaque, arquivo, acoes);
    secao.append(artigo);
  }
}

async function renderServicos() {
  const secao = $("aba-servicos");
  secao.replaceChildren();
  const { avulsos } = await api("/api/admin/avulsos");
  for (const servico of avulsos) {
    const artigo = document.createElement("article");
    const titulo = campo("Título", servico.titulo);
    const preco = campo("Preço", servico.preco);
    const itens = campo("Itens, um por linha", servico.itens.join("\n"), { linhas: 4 });
    const nota = campo("Aviso", servico.aviso || "");
    artigo.append(titulo.label, preco.label, itens.label, nota.label, botao("Salvar", "", async () => {
      try {
        await api(`/api/admin/avulsos/${servico.id}`, {
          method: "PUT",
          json: {
            titulo: titulo.input.value,
            preco: preco.input.value,
            itens: itens.input.value.split("\n").map((item) => item.trim()).filter(Boolean),
            aviso: nota.input.value,
          },
        });
        aviso("Serviço salvo.");
      } catch (erro) {
        aviso(erro.message);
      }
    }));
    secao.append(artigo);
  }
}

async function renderPortfolio() {
  const secao = $("aba-portfolio");
  secao.replaceChildren();
  const { obras, categorias } = await api("/api/admin/portfolio");
  for (const obra of obras) {
    const artigo = document.createElement("article");
    if (obra.foto_url) {
      const img = document.createElement("img");
      img.className = "mini";
      img.alt = "";
      img.src = `${obra.foto_url}?v=${Date.now()}`;
      artigo.append(img);
    }
    const titulo = campo("Título", obra.titulo);
    const texto = campo("Texto", obra.texto, { linhas: 3 });
    const kicker = campo("Chamada", obra.kicker);
    const categoria = document.createElement("label");
    categoria.textContent = "Categoria";
    const select = document.createElement("select");
    for (const item of categorias) {
      const opcao = document.createElement("option");
      opcao.value = item.id;
      opcao.textContent = item.rotulo;
      opcao.selected = item.id === obra.categoria;
      select.append(opcao);
    }
    categoria.append(select);
    const visivel = document.createElement("label");
    visivel.className = "check";
    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.checked = obra.visivel;
    visivel.append(marca, document.createTextNode("Aparece no site"));
    const arquivo = document.createElement("input");
    arquivo.type = "file";
    arquivo.accept = "image/jpeg,image/png,image/webp";
    arquivo.addEventListener("change", () => enviarFoto(arquivo, `portfolio/${obra.id}.jpg`, async (url) => {
      await salvarObra(obra.id, { titulo, texto, kicker, select, marca, foto: url, formato: obra.formato });
      await renderPortfolio();
    }));
    const acoes = document.createElement("div");
    acoes.className = "acoes";
    acoes.append(
      botao("Subir", "secundario", () => mover(obras, obra.id, -1)),
      botao("Descer", "secundario", () => mover(obras, obra.id, 1)),
      botao("Salvar", "", async () => {
        try {
          await salvarObra(obra.id, { titulo, texto, kicker, select, marca, foto: obra.foto_url || "", formato: obra.formato });
          aviso("Foto salva.");
        } catch (erro) {
          aviso(erro.message);
        }
      }),
      botao("Ocultar da grade", "secundario", async () => {
        marca.checked = false;
        await salvarObra(obra.id, { titulo, texto, kicker, select, marca, foto: obra.foto_url || "", formato: obra.formato });
        await renderPortfolio();
      }),
    );
    artigo.append(titulo.label, texto.label, kicker.label, categoria, visivel, arquivo, acoes);
    secao.append(artigo);
  }
}

async function salvarObra(id, campos) {
  await api(`/api/admin/portfolio/${id}`, {
    method: "PUT",
    json: {
      titulo: campos.titulo.input.value,
      texto: campos.texto.input.value,
      kicker: campos.kicker.input.value,
      categoria: campos.select.value,
      formato: campos.formato,
      visivel: campos.marca.checked,
      foto_url: campos.foto,
    },
  });
}

async function mover(obras, id, sentido) {
  const ids = obras.map((obra) => obra.id);
  const indice = ids.indexOf(id);
  const destino = indice + sentido;
  if (destino < 0 || destino >= ids.length) return;
  [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
  try {
    await api("/api/admin/portfolio/ordem", { method: "PUT", json: { ids } });
    await renderPortfolio();
  } catch (erro) {
    aviso(erro.message);
  }
}

async function renderEstudio() {
  const secao = $("aba-estudio");
  secao.replaceChildren();
  const studio = await api("/api/admin/studio");
  const formulario = document.createElement("form");
  formulario.className = "cartao";
  const email = campo("E-mail", studio.email || "");
  const endereco = campo("Endereço", studio.endereco || "");
  const horario = campo("Horário", studio.horario || "");
  const whatsapp = campo("WhatsApp, só números", studio.whatsapp_numero || "");
  const telefone = campo("Telefone como aparece no site", studio.telefone_exibicao || "");
  formulario.append(email.label, endereco.label, horario.label, whatsapp.label, telefone.label);
  formulario.append(botao("Salvar dados", "", async () => {
    try {
      await api("/api/admin/studio", {
        method: "PUT",
        json: {
          email: email.input.value,
          endereco: endereco.input.value,
          horario: horario.input.value,
          whatsapp_numero: whatsapp.input.value,
          telefone_exibicao: telefone.input.value,
        },
      });
      aviso("Estúdio salvo.");
    } catch (erro) {
      aviso(erro.message);
    }
  }));
  secao.append(formulario);
  secao.append(blocoFoto("Foto da Hellen", studio.foto_hellen_url, "hellen/retrato.jpg"));
  secao.append(blocoFoto("Foto do hero", studio.foto_hero_url, "hero/retrato.jpg"));
}

function blocoFoto(rotulo, url, destino) {
  const artigo = document.createElement("article");
  const titulo = document.createElement("h2");
  titulo.textContent = rotulo;
  artigo.append(titulo);
  if (url) {
    const img = document.createElement("img");
    img.className = "mini";
    img.alt = "";
    img.src = `${url}?v=${Date.now()}`;
    artigo.append(img);
  }
  const arquivo = document.createElement("input");
  arquivo.type = "file";
  arquivo.accept = "image/jpeg,image/png,image/webp";
  arquivo.addEventListener("change", () => enviarFoto(arquivo, destino, async (novaUrl) => {
    const corpo = await api("/api/admin/studio");
    await api("/api/admin/studio", {
      method: "PUT",
      json: {
        email: corpo.email || "",
        endereco: corpo.endereco || "",
        horario: corpo.horario || "",
        whatsapp_numero: corpo.whatsapp_numero || "",
        telefone_exibicao: corpo.telefone_exibicao || "",
        ...(destino.startsWith("hellen/") ? { foto_hellen_url: novaUrl } : {}),
        ...(destino.startsWith("hero/") ? { foto_hero_url: novaUrl } : {}),
      },
    });
    await renderEstudio();
  }));
  artigo.append(arquivo);
  return artigo;
}

async function renderFaq() {
  const secao = $("aba-faq");
  secao.replaceChildren();
  const { itens } = await api("/api/admin/faq");
  for (const item of itens) {
    const artigo = document.createElement("article");
    const pergunta = campo("Pergunta", item.pergunta);
    const resposta = campo("Resposta", item.resposta, { linhas: 4 });
    const confirmado = document.createElement("label");
    confirmado.className = "check";
    const marca = document.createElement("input");
    marca.type = "checkbox";
    marca.checked = item.confirmado;
    confirmado.append(marca, document.createTextNode("Resposta confirmada pela Hellen"));
    artigo.append(pergunta.label, resposta.label, confirmado, botao("Salvar", "", async () => {
      try {
        await api(`/api/admin/faq/${item.id}`, {
          method: "PUT",
          json: { pergunta: pergunta.input.value, resposta: resposta.input.value, confirmado: marca.checked },
        });
        aviso("Pergunta salva.");
      } catch (erro) {
        aviso(erro.message);
      }
    }));
    secao.append(artigo);
  }
}

async function renderMensagens() {
  const secao = $("aba-mensagens");
  secao.replaceChildren();
  const { contatos } = await api("/api/admin/contatos");
  if (!contatos.length) {
    const vazio = document.createElement("p");
    vazio.textContent = "Nenhuma mensagem ainda.";
    secao.append(vazio);
    return;
  }
  for (const contato of contatos) {
    const artigo = document.createElement("article");
    const nome = document.createElement("strong");
    nome.textContent = contato.nome;
    const telefone = document.createElement("p");
    telefone.textContent = contato.telefone;
    const quando = document.createElement("p");
    quando.textContent = new Date(contato.criado_em).toLocaleString("pt-BR");
    const mensagem = document.createElement("p");
    mensagem.textContent = contato.mensagem;
    artigo.append(nome, telefone, quando, mensagem);
    secao.append(artigo);
  }
}

async function enviarFoto(input, destino, depois) {
  const arquivo = input.files?.[0];
  if (!arquivo) return;
  const corpo = new FormData();
  corpo.set("destino", destino);
  corpo.set("arquivo", arquivo);
  aviso("Enviando a foto…");
  try {
    const token = sessionStorage.getItem("hv-token");
    const resposta = await fetch(`${base()}/api/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: corpo,
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(dados.erro || "não foi possível enviar a foto.");
    await depois(dados.url);
    aviso("Foto enviada.");
  } catch (erro) {
    aviso(erro.message);
  } finally {
    input.value = "";
  }
}

const apiSalva = localStorage.getItem("hv-api");
document.querySelector("#form-login [name=api]").value = apiSalva || apiPadrao();
if (sessionStorage.getItem("hv-token")) mostrarPainel();
