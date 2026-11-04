/* ============================================================
   Youssef Mohamed — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  var backTop = document.getElementById("backTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("scrolled", y > 8);
    backTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- active nav link highlighting ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.dataset.section); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          var active = l.dataset.section === entry.target.id;
          l.classList.toggle("active", active);
          if (active) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- screenshot lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var currentItems = [];
  var currentIndex = 0;
  var lastFocused = null;

  function itemData(fig) {
    var img = fig.querySelector("img");
    var cap = fig.querySelector("figcaption");
    return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "", caption: cap ? cap.textContent : "" };
  }

  function renderLightbox() {
    var item = currentItems[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.caption + "  ·  " + (currentIndex + 1) + " / " + currentItems.length;
  }

  function openLightbox(fig) {
    var gallery = fig.closest(".gallery");
    currentItems = Array.prototype.slice.call(gallery.querySelectorAll(".g-item")).map(itemData);
    currentIndex = currentItems.findIndex(function (it) { return it.src === fig.querySelector("img").getAttribute("src"); });
    if (currentIndex < 0) currentIndex = 0;
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocused) lastFocused.focus();
  }

  function stepLightbox(dir) {
    currentIndex = (currentIndex + dir + currentItems.length) % currentItems.length;
    renderLightbox();
  }

  document.querySelectorAll(".g-item").forEach(function (fig) {
    fig.addEventListener("click", function () { openLightbox(fig); });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(fig);
      }
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { stepLightbox(-1); });
  lbNext.addEventListener("click", function () { stepLightbox(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "Tab") {
      /* simple focus trap between the three controls */
      var focusables = [lbClose, lbPrev, lbNext];
      var idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? (idx <= 0 ? focusables.length - 1 : idx - 1) : (idx === focusables.length - 1 || idx === -1 ? 0 : idx + 1);
      focusables[next].focus();
    }
  });

  /* ---------- contact form (Web3Forms) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        status.textContent = "Please complete every field and check that your email address is valid.";
        status.className = "form-status err";
        form.reportValidity();
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      var submitLabel = submitButton ? submitButton.querySelector(".submit-label") : null;
      var originalLabel = submitLabel ? submitLabel.textContent : "Send Message";

      if (submitButton && submitButton.disabled) return;
      if (submitButton) submitButton.disabled = true;
      form.setAttribute("aria-busy", "true");
      if (submitLabel) submitLabel.textContent = "Sending...";
      status.textContent = "Sending your message securely...";
      status.className = "form-status pending";

      try {
        /* Web3Forms uses "subject" as the email title. Also place it inside
           the message body so it is always visible in the notification email. */
        var payload = Object.fromEntries(new FormData(form).entries());
        var subjectValue = String(payload.subject || "").trim();
        var messageValue = String(payload.message || "").trim();
        payload.message = "Project subject: " + subjectValue + "\n\n" + messageValue;
        var response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
        var result = await response.json().catch(function () { return null; });

        if (!response.ok || !result || result.success !== true) {
          throw new Error("The form service did not accept the submission.");
        }

        status.textContent = "Thanks for reaching out! Your message was sent successfully. I'll reply to your email as soon as I can.";
        status.className = "form-status ok";
        form.reset();
      } catch (error) {
        status.textContent = "I couldn't send your message right now. Please email me directly at yousefmohamed1e@gmail.com and I'll get back to you.";
        status.className = "form-status err";
      } finally {
        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
        form.removeAttribute("aria-busy");
      }
    });
  }
})();
