/* net-admin.pro — интерактив */
(function () {
  "use strict";

  /* ---- мобильное меню ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* ---- появление секций при скролле ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- форма обратной связи ----
     По умолчанию шлёт в Web3Forms (нужен access_key в скрытом поле формы).
     Чтобы перецепить на свой n8n: поменяй ENDPOINT на URL вебхука n8n
     и при необходимости формат тела (n8n принимает обычный JSON). */
  var ENDPOINT = "https://api.web3forms.com/submit";

  var form = document.querySelector("#contact-form");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="botcheck"]') && form.querySelector('[name="botcheck"]').checked) return;

      var btn = form.querySelector('button[type="submit"]');
      var oldText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Отправка…"; }
      setStatus("", "");

      var data = Object.fromEntries(new FormData(form).entries());

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (res) {
          if (res.success) {
            form.reset();
            setStatus("Заявка отправлена. Свяжемся в течение рабочего дня.", "ok");
          } else {
            setStatus("Не удалось отправить. Напишите на email или позвоните.", "err");
          }
        })
        .catch(function () {
          setStatus("Сеть недоступна. Напишите на email или позвоните.", "err");
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = oldText; }
        });
    });

    function setStatus(msg, cls) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = "form-status " + (cls || "");
    }
  }

  /* ---- год в подвале ---- */
  var y = document.querySelector("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
