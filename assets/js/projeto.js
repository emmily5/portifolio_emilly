// ── Lightbox simples para a galeria das páginas de projeto ──
(function () {
  const items = document.querySelectorAll("[data-lightbox] img");
  if (!items.length) return;

  // Cria o overlay uma única vez
  const overlay = document.createElement("div");
  overlay.className = "pp-lightbox";
  overlay.innerHTML = `
    <button class="pp-lightbox__close" aria-label="Fechar">&times;</button>
    <img src="" alt="" />
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const closeBtn = overlay.querySelector(".pp-lightbox__close");

  function open(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || "";
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  items.forEach((img) => {
    img.addEventListener("click", () => open(img.src, img.alt));
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
