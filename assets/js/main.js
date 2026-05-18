/* [Nom de l'entreprise] — interactions premium */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduce) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
      var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      window.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px)";
      }, { passive: true });
      (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        requestAnimationFrame(loop);
      })();
      var hov = "a, button, .nav-toggle, input, textarea, select, [data-cursor]";
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest(hov)) ring.classList.add("is-hover");
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest(hov)) ring.classList.remove("is-hover");
      });
      window.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
      window.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
    }
  }

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function headerState() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", headerState, { passive: true });
  headerState();

  /* ---------- Mobile overlay menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.querySelector(".nav-overlay");
  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      var open = overlay.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        overlay.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Split headings into words (use *word* for accent) ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      var acc = w.indexOf("*") !== -1;
      if (acc) w = w.replace(/\*/g, "");
      return '<span class="word"><span' + (acc ? ' class="wacc"' : "") + ">" + w + "</span></span>";
    }).join(" ");
    el.classList.add("split-done");
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal], .split-done");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Counters ---------- */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = 1700, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Parallax ---------- */
  var pxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
  if (pxEls.length && !reduce) {
    var ticking = false;
    function parallax() {
      var vh = innerHeight;
      pxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        var base = el.classList.contains("px-bg") ? "translate(-50%,-50%) " : "";
        el.style.transform = base + "translateY(" + (-center * speed) + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.22 + "px," + y * 0.3 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Marquee: duplicate content for seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var a = item.querySelector(".faq-a");
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* ---------- Gallery filter ---------- */
  var filters = document.querySelectorAll("[data-filter]");
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.remove("current"); });
        btn.classList.add("current");
        document.querySelectorAll("[data-cat]").forEach(function (it) {
          it.style.display = (cat === "all" || it.getAttribute("data-cat") === cat) ? "" : "none";
        });
      });
    });
  }

  /* ---------- Form field focus + submit ---------- */
  document.querySelectorAll(".field input, .field select, .field textarea").forEach(function (inp) {
    var field = inp.closest(".field");
    inp.addEventListener("focus", function () { field.classList.add("focus"); });
    inp.addEventListener("blur", function () { field.classList.remove("focus"); });
  });
  document.querySelectorAll("form[data-quote-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = form.querySelector(".form-msg");
      if (msg) {
        msg.textContent = "Merci, votre demande a bien été enregistrée. [À CONFIGURER : connecter ce formulaire à votre messagerie ou outil de gestion.]";
        msg.hidden = false;
      }
      form.reset();
    });
  });

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
