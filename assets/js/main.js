/* CEO Couverture et Élagage — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header scroll state ---- */
  var header = document.querySelector(".site-header");
  function headerState() { if (header) header.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", headerState, { passive: true });
  headerState();

  /* ---- Mobile overlay menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.querySelector(".nav-overlay");
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      var open = overlay.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---- Graceful image fallback (keeps premium gradient if photo fails) ---- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () { img.style.opacity = "0"; });
    if (img.complete && img.naturalWidth === 0) img.style.opacity = "0";
  });

  /* ---- Split headings into words (use *word* for accent) ---- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      var acc = w.indexOf("*") !== -1;
      if (acc) w = w.replace(/\*/g, "");
      return '<span class="word"><span' + (acc ? ' class="wacc"' : "") + ">" + w + "</span></span>";
    }).join(" ");
    el.classList.add("split-done");
  });

  /* ---- Scroll reveal (toujours actif, animations courtes & accessibles) ---- */
  var revealEls = document.querySelectorAll("[data-reveal], .hero, .hero h1");
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Fallback : balayage initial après layout, au cas où l'IO ne déclenche pas
     pour les éléments déjà au-dessus de la ligne de flottaison. */
  function initialReveal() {
    var vh = window.innerHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) {
        el.classList.add("is-in");
        if (io) io.unobserve(el);
      }
    });
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(initialReveal);
    setTimeout(initialReveal, 250);
  });
  window.addEventListener("load", initialReveal);

  /* ---- Counters ---- */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = 1700, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 4);
      var val = target * e;
      el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val)).toString().replace(".", ",");
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
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count").replace(".", ","); });
  }

  /* ---- Parallax (subtle) ---- */
  var pxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
  if (pxEls.length && !reduce) {
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        el.style.transform = "translate3d(0," + (-center * speed) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---- Marquee: duplicate for seamless loop ---- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var a = item.querySelector(".faq-a");
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* ---- Gallery filter ---- */
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

  /* ---- Galerie réalisations (photo/vidéo, avant/après) + lecteur ---- */
  var vidCards = document.querySelectorAll(".vid-card[data-avant], .vid-card[data-apres]");
  if (vidCards.length) {
    var lightbox = document.getElementById("videoLightbox");
    var lbFrame = lightbox && lightbox.querySelector(".lightbox-frame");
    var lbClose = lightbox && lightbox.querySelector(".lightbox-close");
    var lbToggle = lightbox && lightbox.querySelector(".lightbox-toggle");
    var lbBtns = lbToggle ? lbToggle.querySelectorAll("button") : [];
    var current = { avant: "", apres: "" };

    function isImage(src) { return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(src); }

    function playPhase(phase) {
      var src = phase === "avant" ? current.avant : current.apres;
      if (!src) return;
      lbFrame.innerHTML = isImage(src)
        ? '<img src="' + src + '" alt="Photo du chantier">'
        : '<video src="' + src + '" controls autoplay playsinline></video>';
      lbBtns.forEach(function (b) {
        b.classList.toggle("current", b.getAttribute("data-phase") === phase);
      });
    }
    function openVideo(avant, apres) {
      if (!lightbox) return;
      current.avant = avant;
      current.apres = apres;
      if (lbToggle) lbToggle.hidden = !(avant && apres);
      playPhase(apres ? "apres" : "avant");
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeVideo() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      lbFrame.innerHTML = "";
      document.body.style.overflow = "";
    }
    lbBtns.forEach(function (b) {
      b.addEventListener("click", function () { playPhase(b.getAttribute("data-phase")); });
    });
    if (lbClose) lbClose.addEventListener("click", closeVideo);
    if (lightbox) lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeVideo();
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) closeVideo();
    });

    vidCards.forEach(function (card) {
      var avant = card.getAttribute("data-avant") || "";
      var apres = card.getAttribute("data-apres") || "";
      var thumbSrc = apres || avant;
      var ready = !!thumbSrc;

      function markEmpty() {
        ready = false;
        card.classList.add("is-empty");
        card.removeAttribute("role");
        card.removeAttribute("tabindex");
        if (!card.querySelector(".vid-empty-note")) {
          var note = document.createElement("span");
          note.className = "vid-empty-note";
          note.textContent = "Vidéo à venir";
          card.appendChild(note);
        }
      }

      if (thumbSrc) {
        var thumb;
        if (isImage(thumbSrc)) {
          thumb = document.createElement("img");
          thumb.src = thumbSrc;
        } else {
          thumb = document.createElement("video");
          thumb.muted = true;
          thumb.playsInline = true;
          thumb.preload = "metadata";
          thumb.src = thumbSrc + "#t=0.5";
        }
        thumb.className = "vid-thumb";
        thumb.addEventListener("error", markEmpty);
        card.insertBefore(thumb, card.firstChild);
      } else {
        markEmpty();
      }

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", function () { if (ready) openVideo(avant, apres); });
      card.addEventListener("keydown", function (e) {
        if (ready && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openVideo(avant, apres); }
      });
    });
  }

  /* ---- Form field focus + submit ---- */
  document.querySelectorAll(".field input, .field select, .field textarea").forEach(function (inp) {
    var field = inp.closest(".field");
    inp.addEventListener("focus", function () { field.classList.add("focus"); });
    inp.addEventListener("blur", function () { field.classList.remove("focus"); });
  });
  document.querySelectorAll("form[data-quote-form]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    var btn = form.querySelector("button[type=submit]");

    function show(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.hidden = false;
      msg.classList.toggle("is-error", !ok);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var action = form.getAttribute("action") || "";
      var endpoint = action.replace("formsubmit.co/", "formsubmit.co/ajax/");

      if (!endpoint) {
        show("Merci, votre demande a bien été reçue. Notre équipe vous recontacte sous 48 h ouvrées.", true);
        form.reset();
        return;
      }

      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && (data.success === "true" || data.success === true)) {
            show("Merci, votre demande a bien été envoyée. Notre équipe vous recontacte sous 48 h ouvrées.", true);
            form.reset();
          } else {
            show("Votre demande n'a pas pu être envoyée. Merci de nous appeler au 07 46 32 96 34.", false);
          }
        })
        .catch(function () {
          show("Envoi impossible — vérifiez votre connexion, ou appelez-nous au 07 46 32 96 34.", false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  });

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
