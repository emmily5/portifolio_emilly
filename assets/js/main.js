// ── Carrossel de Services (Navegação 1 por 1) ──────────────────────────────
(function () {
  const carousel = document.getElementById("servicesCarousel");
  if (!carousel) return;

  const track = document.getElementById("servicesTrack");
  const viewport = carousel.querySelector(".services__viewport");
  const prevBtn = document.getElementById("servicesPrev");
  const nextBtn = document.getElementById("servicesNext");
  const dotsBox = document.getElementById("servicesDots");

  let cards = Array.from(track.children);
  let cardsPerView = 3;
  let currentIndex = 0; // Representa o índice do card atual à esquerda
  let maxIndex = 0; 

  // Define quantos cards aparecem simultaneamente
  function getCardsPerView() {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    return 3;
  }

  // Ajusta o tamanho dos cards para caberem na viewport
  function updateCardSizes() {
    const gap = parseInt(getComputedStyle(track).gap) || 0;
    const vw = viewport.clientWidth;
    const size = (vw - gap * (cardsPerView - 1)) / cardsPerView;
    cards.forEach((c) => (c.style.width = size + "px"));
  }

  // Move o carrossel para o índice de card específico
  function goTo(index, animate = true) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const gap = parseInt(getComputedStyle(track).gap) || 0;
    const cardW = cards[0]?.offsetWidth || 0;
    
    // Deslocamento baseado em 1 card por vez
    const offset = currentIndex * (cardW + gap);

    track.style.transition = animate
      ? "transform .55s cubic-bezier(.22,.61,.36,1)"
      : "none";
    track.style.transform = `translateX(${-offset}px)`;

    updateUI();
  }

  function updateUI() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;

    const dots = dotsBox.querySelectorAll(".services__dot");
    dots.forEach((d, i) => {
      d.classList.toggle("services__dot--active", i === currentIndex);
    });
  }

  function buildDots() {
    dotsBox.innerHTML = "";
    // Cria um dot para cada posição possível de navegação
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.className = "services__dot" + (i === currentIndex ? " services__dot--active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsBox.appendChild(dot);
    }
    dotsBox.style.display = maxIndex > 0 ? "flex" : "none";
  }

  function rebuild() {
    cards = Array.from(track.children);
    cardsPerView = getCardsPerView();
    
    // O limite é o total de cards menos os que já estão visíveis na tela
    maxIndex = Math.max(0, cards.length - cardsPerView);

    currentIndex = Math.min(currentIndex, maxIndex);

    updateCardSizes();
    buildDots();
    goTo(currentIndex, false);
  }

  // Eventos de Clique
  prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));

  // ── Swipe / Drag logic ──
  let dragStartX = 0;
  let dragDelta = 0;
  let isDragging = false;

  function onDragStart(x) {
    isDragging = true;
    dragStartX = x;
    dragDelta = 0;
    track.classList.add("is-dragging");
    track.style.transition = "none";
  }

  function onDragMove(x) {
    if (!isDragging) return;
    dragDelta = x - dragStartX;
    const gap = parseInt(getComputedStyle(track).gap) || 0;
    const cardW = cards[0]?.offsetWidth || 0;
    const currentOffset = currentIndex * (cardW + gap);
    track.style.transform = `translateX(${-currentOffset + dragDelta}px)`;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");

    const threshold = 50; 
    if (dragDelta < -threshold && currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else if (dragDelta > threshold && currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      goTo(currentIndex);
    }
    dragDelta = 0;
  }

  track.addEventListener("touchstart", (e) => onDragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", (e) => onDragMove(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", onDragEnd);
  track.addEventListener("mousedown", (e) => { 
    onDragStart(e.clientX); 
    e.preventDefault(); 
  });
  window.addEventListener("mousemove", (e) => { if (isDragging) onDragMove(e.clientX); });
  window.addEventListener("mouseup", () => { if (isDragging) onDragEnd(); });

  // Previne cliques acidentais em links durante o drag
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (Math.abs(dragDelta) > 5) e.preventDefault();
    });
  });

  // Teclado
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(currentIndex - 1);
    if (e.key === "ArrowRight") goTo(currentIndex + 1);
  });

  // Resize com debounce
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 120);
  });

  rebuild();
})();


// ── Entrance animations ──────────────────────────────
document
  .querySelectorAll(
    ".hero__headline, .hero__testimonial, .hero__experience, .hero__photo-wrap",
  )
  .forEach((el, i) => {
    el.style.cssText += `opacity:0;transform:translateY(22px);
  transition:opacity .65s ease ${(i * 0.11 + 0.1).toFixed(2)}s,
             transform .65s ease ${(i * 0.11 + 0.1).toFixed(2)}s`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }),
    );
  });

// ── Hamburger / drawer ───────────────────────────────
const btn = document.getElementById("hamburger");
const drawer = document.getElementById("drawer");

if (btn && drawer) {
  btn.addEventListener("click", () => {
    const open = drawer.classList.toggle("is-open");
    btn.classList.toggle("is-active", open);
    drawer.setAttribute("aria-hidden", String(!open));
  });

  drawer.querySelectorAll("a, button").forEach((el) =>
    el.addEventListener("click", () => {
      drawer.classList.remove("is-open");
      btn.classList.remove("is-active");
      drawer.setAttribute("aria-hidden", "true");
    }),
  );
}