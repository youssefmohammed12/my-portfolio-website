/* Shared screenshot gallery and accessible lightbox for the portfolio. */
(function () {
  "use strict";

  var galleryRoots = Array.prototype.slice.call(document.querySelectorAll("[data-gallery]"));
  if (!galleryRoots.length) return;

  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Screenshot preview");

  function makeButton(className, label, text) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
  }

  var closeButton = makeButton("lb-close", "Close preview", "×");
  var previousButton = makeButton("lb-prev", "Previous screenshot", "‹");
  var nextButton = makeButton("lb-next", "Next screenshot", "›");
  var figure = document.createElement("figure");
  figure.className = "lb-figure";
  var image = document.createElement("img");
  image.alt = "";
  var caption = document.createElement("figcaption");
  caption.setAttribute("aria-live", "polite");
  figure.appendChild(image);
  figure.appendChild(caption);
  lightbox.appendChild(closeButton);
  lightbox.appendChild(previousButton);
  lightbox.appendChild(figure);
  lightbox.appendChild(nextButton);
  document.body.appendChild(lightbox);

  var currentItems = [];
  var currentIndex = 0;
  var lastTrigger = null;

  function getItemData(item) {
    var img = item.querySelector("img");
    var figcaption = item.querySelector("figcaption");
    var title = figcaption && figcaption.querySelector("strong");
    var description = figcaption && figcaption.querySelector("span");
    var captionText = figcaption ? figcaption.textContent.trim().replace(/\s+/g, " ") : "";
    var caption = title && description
      ? title.textContent.trim() + " — " + description.textContent.trim()
      : captionText;
    return {
      src: img.currentSrc || img.src,
      alt: img.alt || "",
      caption: caption
    };
  }

  function render() {
    var item = currentItems[currentIndex];
    if (!item) return;
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.caption + " · " + (currentIndex + 1) + " / " + currentItems.length;
    previousButton.disabled = currentItems.length < 2;
    nextButton.disabled = currentItems.length < 2;
  }

  function open(item) {
    var root = item.closest("[data-gallery]");
    if (!root) return;
    currentItems = Array.prototype.slice.call(root.querySelectorAll(".g-item")).map(getItemData);
    currentIndex = Array.prototype.indexOf.call(root.querySelectorAll(".g-item"), item);
    if (!currentItems.length || currentIndex < 0) return;

    lastTrigger = item;
    render();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    image.removeAttribute("src");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  function step(direction) {
    if (currentItems.length < 2) return;
    currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
    render();
  }

  galleryRoots.forEach(function (root) {
    root.querySelectorAll(".g-item").forEach(function (item) {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.setAttribute("aria-haspopup", "dialog");
      if (!item.hasAttribute("aria-label")) {
        var img = item.querySelector("img");
        item.setAttribute("aria-label", "View screenshot: " + (img ? img.alt : "project image"));
      }
      item.addEventListener("click", function () {
        open(item);
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(item);
        }
      });
    });
  });

  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", function () { step(-1); });
  nextButton.addEventListener("click", function () { step(1); });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "Tab") {
      var focusable = [closeButton];
      if (!previousButton.disabled) focusable.push(previousButton);
      if (!nextButton.disabled) focusable.push(nextButton);
      var index = focusable.indexOf(document.activeElement);
      var nextIndex = event.shiftKey
        ? (index <= 0 ? focusable.length - 1 : index - 1)
        : (index < 0 || index === focusable.length - 1 ? 0 : index + 1);
      event.preventDefault();
      focusable[nextIndex].focus();
    }
  });
})();