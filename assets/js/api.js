/* api.js — lê o banco quando a API responde.
   Se ela estiver dormindo ou fora do ar, a página fica com o HTML já escrito. */
(function () {
  "use strict";

  function base() {
    if (window.HV_API) return String(window.HV_API).replace(/\/$/, "");
    var host = location.hostname;
    if (host === "127.0.0.1" || host === "localhost") return "http://127.0.0.1:3000";
    return "";
  }

  function buscar(caminho) {
    var url = base();
    if (!url) return Promise.reject(new Error("sem api"));
    return fetch(url + caminho, { signal: AbortSignal.timeout(12000) }).then(function (resposta) {
      if (!resposta.ok) throw new Error("resposta " + resposta.status);
      return resposta.json();
    });
  }

  function preencher(el, valor) {
    if (!el) return;
    el.replaceChildren();
    var re = /<em>(.*?)<\/em>|([^<]+)/g;
    var parte;
    var texto = String(valor || "");
    while ((parte = re.exec(texto))) {
      if (parte[1] != null) {
        var em = document.createElement("em");
        em.textContent = parte[1];
        el.append(em);
      } else if (parte[2]) {
        el.append(document.createTextNode(parte[2]));
      }
    }
  }

  function semMarcacao(valor) {
    return String(valor || "").replace(/<[^>]+>/g, "");
  }

  function trocarFoto(img, url) {
    if (!img || !url) return;
    img.src = url;
    var source = img.parentElement && img.parentElement.querySelector("source");
    if (source) source.removeAttribute("srcset");
  }

  function linkWhatsapp(a, mensagem) {
    var numero = document.body.getAttribute("data-wa-number") || "";
    if (!a || !numero) return;
    a.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
    a.target = "_blank";
    a.rel = "noopener";
  }

  function aplicarStudio(studio) {
    if (!studio || !studio.contato) return;
    if (studio.contato.whatsapp_numero) document.body.setAttribute("data-wa-number", studio.contato.whatsapp_numero);
    if (studio.contato.telefone_href) document.body.setAttribute("data-tel", studio.contato.telefone_href);
    if (studio.contato.telefone_exibicao) {
      document.querySelectorAll("[data-tel-link]").forEach(function (a) {
        a.textContent = studio.contato.telefone_exibicao;
      });
    }
    trocarFoto(document.querySelector(".photo-frame__img"), studio.fotos && studio.fotos.hero);
    trocarFoto(document.querySelector(".persona__photo"), studio.fotos && studio.fotos.hellen);
    var detalhe = document.querySelector("[data-slot='agenda.detalhe']");
    var partes = [studio.contato.endereco, studio.contato.horario].filter(Boolean);
    if (detalhe && partes.length) {
      detalhe.hidden = false;
      detalhe.textContent = partes.join(" · ");
    }
    if (studio.extra) {
      var extra = document.querySelector("[data-slot='valores.extra']");
      if (extra) extra.textContent = studio.extra;
    }
    document.dispatchEvent(new CustomEvent("hv:whatsapp"));
  }

  function aplicarCombos(dados, studio) {
    if (!dados || !dados.combos) return;
    var modelo = (studio && studio.mensagens_whatsapp && studio.mensagens_whatsapp.combo) || "Oi, Hellen! Vi o site e quero o {combo}.";
    dados.combos.forEach(function (combo) {
      var artigo = document.querySelector('[data-id="' + combo.id + '"]');
      if (!artigo) return;
      artigo.classList.toggle("pack--feature", Boolean(combo.destaque));
      var chamada = artigo.querySelector(".pack__kicker");
      if (chamada) chamada.textContent = combo.destaque ? combo.kicker + " · o mais pedido" : combo.kicker;
      preencher(artigo.querySelector("h3"), combo.titulo);
      var preco = artigo.querySelector(".pack__price");
      if (preco) preco.textContent = combo.preco;
      var lista = artigo.querySelector("ul");
      if (lista) {
        lista.replaceChildren();
        (combo.itens || []).forEach(function (item) {
          var li = document.createElement("li");
          li.textContent = item;
          lista.append(li);
        });
      }
      trocarFoto(artigo.querySelector("img"), combo.foto_url);
      linkWhatsapp(artigo.querySelector("[data-wa]"), modelo.replace("{combo}", semMarcacao(combo.titulo) + " (" + combo.preco + ")"));
    });
  }

  function aplicarAvulsos(dados) {
    if (!dados || !dados.avulsos) return;
    dados.avulsos.forEach(function (servico) {
      var artigo = document.querySelector('[data-id="' + servico.id + '"]');
      if (!artigo) return;
      var chamada = artigo.querySelector(".pack__kicker");
      if (chamada) chamada.textContent = servico.kicker;
      var titulo = artigo.querySelector("h3");
      if (titulo) titulo.textContent = servico.titulo;
      var preco = artigo.querySelector(".pack__price");
      if (preco) preco.textContent = servico.preco_sufixo ? servico.preco + " " + servico.preco_sufixo : servico.preco;
      var lista = artigo.querySelector("ul");
      if (lista) {
        lista.replaceChildren();
        (servico.itens || []).forEach(function (item) {
          var li = document.createElement("li");
          li.textContent = item;
          lista.append(li);
        });
      }
      var nota = artigo.querySelector(".pack__note");
      if (nota) nota.textContent = servico.aviso || "";
    });
  }

  function aplicarPortfolio(dados) {
    var grade = document.querySelector("[data-portfolio-grid]");
    if (!grade || !dados || !dados.obras) return;
    grade.replaceChildren();
    dados.obras.forEach(function (obra) {
      var artigo = document.createElement("article");
      artigo.className = "work reveal is-visible";
      if (obra.formato === "wide") artigo.classList.add("work--wide");
      if (obra.formato === "dark") artigo.classList.add("work--dark");
      if (obra.foto_url) artigo.classList.add("work--photo");
      artigo.dataset.cat = obra.categoria;
      if (obra.foto_url) {
        var picture = document.createElement("picture");
        picture.className = "work__media";
        var img = document.createElement("img");
        img.className = "work__photo";
        img.loading = "lazy";
        img.decoding = "async";
        img.src = obra.foto_url;
        img.alt = obra.kicker + ": " + semMarcacao(obra.titulo);
        picture.append(img);
        artigo.append(picture);
      }
      var chamada = document.createElement("span");
      chamada.className = "work__kicker";
      chamada.textContent = obra.kicker;
      var titulo = document.createElement("h3");
      preencher(titulo, obra.titulo);
      var texto = document.createElement("p");
      texto.textContent = obra.texto;
      artigo.append(chamada, titulo, texto);
      grade.append(artigo);
    });
    grade.dataset.origem = "api";
    document.dispatchEvent(new CustomEvent("hv:portfolio"));
  }

  function aplicarFaq(dados) {
    var lista = document.querySelector("[data-slot='faq.lista']");
    if (!lista || !dados || !dados.itens) return;
    var confirmados = dados.itens.filter(function (item) { return item.confirmado !== false; });
    if (!confirmados.length) return;
    lista.replaceChildren();
    confirmados.forEach(function (item) {
      var details = document.createElement("details");
      var summary = document.createElement("summary");
      summary.textContent = item.pergunta;
      var p = document.createElement("p");
      p.textContent = item.resposta;
      details.append(summary, p);
      lista.append(details);
    });
  }

  function ligarFormulario() {
    var form = document.querySelector("[data-contato]");
    if (!form) return;
    var status = form.querySelector("[data-contato-status]");
    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var url = base();
      var botao = form.querySelector("button");
      var dados = new FormData(form);
      if (!url) {
        status.textContent = "Não consegui enviar agora. Chame no WhatsApp.";
        return;
      }
      botao.disabled = true;
      status.textContent = "Enviando…";
      fetch(url + "/api/contatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dados.get("nome"),
          telefone: dados.get("telefone"),
          mensagem: dados.get("mensagem"),
        }),
      }).then(function (resposta) {
        return resposta.json().catch(function () { return {}; }).then(function (corpo) {
          if (!resposta.ok) throw new Error(corpo.erro || "falha");
          form.reset();
          status.textContent = "Mensagem enviada. A Hellen responde no WhatsApp.";
        });
      }).catch(function (erro) {
        status.textContent = erro.message && erro.message !== "falha"
          ? erro.message
          : "Não consegui enviar agora. Chame no WhatsApp.";
      }).finally(function () {
        botao.disabled = false;
      });
    });
  }

  ligarFormulario();

  Promise.allSettled([
    buscar("/api/studio"),
    buscar("/api/combos"),
    buscar("/api/servicos"),
    buscar("/api/faq"),
    buscar("/api/portfolio"),
  ]).then(function (resultados) {
    var studio = resultados[0].status === "fulfilled" ? resultados[0].value : null;
    if (studio) aplicarStudio(studio);
    if (resultados[1].status === "fulfilled") aplicarCombos(resultados[1].value, studio);
    if (resultados[2].status === "fulfilled") aplicarAvulsos(resultados[2].value);
    if (resultados[3].status === "fulfilled") aplicarFaq(resultados[3].value);
    if (resultados[4].status === "fulfilled") aplicarPortfolio(resultados[4].value);
  });
})();
