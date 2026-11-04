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
