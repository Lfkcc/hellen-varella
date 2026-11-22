/* reveal.js — entrada suave ao rolar (enfeite, nunca requisito).
   Camadas de segurança para que NENHUM conteúdo fique preso invisível:
   1) IntersectionObserver revela ao entrar na viewport (efeito principal);
   2) após o load, um timeout revela tudo que ainda restar. */
(function () {
  "use strict";

  var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var show = function (el) { el.classList.add("is-visible"); };

  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(show);
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach(function (el) { io.observe(el); });

  // Rede final — revela tudo que o observer ainda não mostrou.
  var flushAll = function () {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(show);
  };
  if (document.readyState === "complete") {
    setTimeout(flushAll, 2500);
  } else {
    window.addEventListener("load", function () { setTimeout(flushAll, 2500); });
  }
})();
